import { Antilink } from '../sql/antilink.js';

export const handleAntiLink = async (conn, msg) => {
	const groupId = msg.from;
	const userId = msg.sender;

	const config = await Antilink.findOne({ where: { groupId } });
	if (!config?.enabled) return;

	if (msg.isAdmin) return;

	const linkRegex = /\bhttps?:\/\/[^\s]+\b/gi;
	if (!linkRegex.test(msg.body)) return;

	await conn.sendMessage(groupId, { delete: msg.key });

	const notify = async (text) =>
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
