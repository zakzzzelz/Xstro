import { downloadMediaMessage } from 'baileys';
import { Antilink } from '../sql/antilink.js';
import { getStatus } from '../sql/antivv.js';
import { AntiWord } from '../sql/antiword.js';
import { getKicks } from '../sql/akick.js';

export const handleAntiLink = async (conn, msg) => {
	const groupId = msg.from;
	const userId = msg.sender;

	const config = await Antilink.findOne({ where: { groupId } });
	if (!config?.enabled) return;

	if (msg.isAdmin) return;

	const linkRegex = /\bhttps?:\/\/[^\s]+\b/gi;
	if (!linkRegex.test(msg.body)) return;

	await conn.sendMessage(groupId, { delete: msg.key });

	const notify = async text =>
		await conn.sendMessage(groupId, {
			text: `_@${userId.split('@')[0]} ${text}_`,
			mentions: [userId],
		});

	await notify('links are not allowed here');

	if (config.action === 'on') {
		return;
	}

	if (config.action === 'kick') {
		if (msg.isAdmin) return;
		await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
		await notify('has been removed for sending links');
		return;
	}

	if (config.action === 'warn') {
		let warnings = config.warnings || {};
		warnings[userId] = (warnings[userId] || 0) + 1;

		config.set('warnings', warnings);
		config.changed('warnings', true);
		await config.save();

		if (warnings[userId] >= 3) {
			if (msg.isAdmin) return;
			await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
			await notify('has been removed after 3 warnings');
			delete warnings[userId];
			config.set('warnings', warnings);
			config.changed('warnings', true);
			await config.save();
		} else {
			await notify(`warning ${warnings[userId]}/3 for sending links`);
		}
	}
};

export const handleViewOnce = async (msg, conn, __events) => {
	const viewOnceMessage = msg.message?.viewOnceMessageV2?.message;
	if (!viewOnceMessage) return;

	const antiVVStatus = await getStatus();
	if (!antiVVStatus) return;

	const isGroup = !!msg.from?.endsWith('@g.us');
	if ((antiVVStatus === 'dm' && isGroup) || (antiVVStatus === 'gc' && !isGroup)) return;

	const buffer = await downloadMediaMessage(
		{
			key: msg.key,
			message: viewOnceMessage,
		},
		'buffer',
		{},
		{
			logger: console,
			reuploadRequest: conn.updateMediaMessage,
		},
	);

	if (isGroup) {
		return await __events.send(buffer, { jid: msg.from });
	} else {
		return await __events.send(buffer, { jid: __events.user });
	}
};

export const handleAntiWord = async (conn, msg) => {
	const groupId = msg.from;
	const userId = msg.sender;
	const antiWordConfig = await AntiWord.findOne({ where: { groupId } });

	if (!antiWordConfig?.isEnabled) return;
	if (msg.isAdmin) return;

	const badWords = antiWordConfig.filterWords || [];
	if (!badWords.some(word => msg.body.toLowerCase().includes(word.toLowerCase()))) return;

	const warnings = antiWordConfig.warnings || {};
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
};

const monitoredGroups = new Set();
export function handleAutoKick(conn, msg) {
	const groupId = msg.from;
	if (!groupId.endsWith('@g.us') || monitoredGroups.has(groupId)) return;

	monitoredGroups.add(groupId);

	setInterval(async () => {
		const groupMeta = await conn.groupMetadata(groupId);
		const participants = groupMeta.participants.map(p => p.id);

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
	}, 5000);
}
