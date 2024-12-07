import { downloadMediaMessage } from 'baileys';
import { Antilink } from '../plugins/sql/antilink.js';
import { getStatus } from '../plugins/sql/antivv.js';
import { AntiWord } from '../plugins/sql/antiword.js';
import { getKicks } from '../plugins/sql/akick.js';

export const handleUpserts = async (conn, msg, ev) => {
	if (!msg.from || !msg.sender || !msg.body) return;

	const groupId = msg.from;
	const userId = msg.sender;
	// Antilink Management
	const antiLinkConfig = await Antilink.findOne({ where: { groupId } });
	if (antiLinkConfig?.enabled && !msg.isAdmin && /\bhttps?:\/\/[^\s]+\b/gi.test(msg.body)) {
		await conn.sendMessage(groupId, { delete: msg.key });
		const notify = async text => await conn.sendMessage(groupId, { text: `_@${userId.split('@')[0]} ${text}_`, mentions: [userId] });

		await notify('links are not allowed here');
		if (antiLinkConfig.action === 'kick' && !msg.isAdmin) {
			await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
			await notify('has been removed for sending links');
		} else if (antiLinkConfig.action === 'warn') {
			let warnings = antiLinkConfig.warnings || {};
			warnings[userId] = (warnings[userId] || 0) + 1;
			antiLinkConfig.set('warnings', warnings);
			antiLinkConfig.changed('warnings', true);
			await antiLinkConfig.save();

			if (warnings[userId] >= 3) {
				if (!msg.isAdmin) {
					await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
					await notify('has been removed after 3 warnings');
					delete warnings[userId];
					antiLinkConfig.set('warnings', warnings);
					antiLinkConfig.changed('warnings', true);
					await antiLinkConfig.save();
				}
			} else {
				await notify(`warning ${warnings[userId]}/3 for sending links`);
			}
		}
	}
	// ViewONce Management
	const viewOnceMessage = msg.message?.viewOnceMessageV2?.message;
	if (viewOnceMessage) {
		const antiVVStatus = await getStatus();
		const isGroup = groupId?.endsWith('@g.us');
		if ((antiVVStatus === 'dm' && isGroup) || (antiVVStatus === 'gc' && !isGroup)) return;

		const buffer = await downloadMediaMessage(
			{ key: msg.key, message: viewOnceMessage },
			'buffer',
			{},
			{
				logger: console,
				reuploadRequest: conn.updateMediaMessage,
			},
		);

		await ev.send(buffer, { jid: isGroup ? groupId : ev.user });
	}
	// AntiWords Management
	const antiWordConfig = await AntiWord.findOne({ where: { groupId } });
	if (antiWordConfig?.isEnabled && !msg.isAdmin) {
		const badWords = antiWordConfig.filterWords || [];
		if (badWords.some(word => msg.body.toLowerCase().includes(word.toLowerCase()))) {
			let warnings = antiWordConfig.warnings || {};
			warnings[userId] = (warnings[userId] || 0) + 1;
			const remainingWarnings = 5 - warnings[userId];

			await conn.sendMessage(groupId, {
				text: `_@${userId.split('@')[0]}, your message contained prohibited words and was removed._\n_You have ${remainingWarnings} warnings left!_`,
				mentions: [userId],
			});
			await conn.sendMessage(groupId, { delete: msg.key });

			if (warnings[userId] >= 5) {
				await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
				delete warnings[userId];
				await conn.sendMessage(groupId, {
					text: `_@${userId.split('@')[0]} has been removed for exceeding the warning limit._`,
					mentions: [userId],
				});
			}

			await AntiWord.update({ warnings }, { where: { groupId } });
		}
	}

	const monitoredGroups = new Set();

	function isGroupMonitored(groupId) {
		return monitoredGroups.has(groupId);
	}
	if (!groupId.endsWith('@g.us') || isGroupMonitored(groupId)) return;
	monitoredGroups.add(groupId);
	let groupMetaCache = null;
	setInterval(async () => {
		if (!isGroupMonitored(groupId)) return;
		if (!groupMetaCache || groupMetaCache.id !== groupId) {
			try {
				groupMetaCache = await conn.groupMetadata(groupId);
			} catch {
				return;
			}
		}
		const participants = groupMetaCache.participants.map(p => p.id);

		for (const userJid of participants) {
			const kicks = await getKicks(groupId, userJid);
			if (kicks.length > 0) {
				await conn.sendMessage(groupId, {
					text: `@${userJid.split('@')[0]} is detected from AutoKick, now kicking loser.`,
					mentions: [userJid],
				});
				await conn.groupParticipantsUpdate(groupId, [userJid], 'remove');
			}
		}
	}, 10000);
};
