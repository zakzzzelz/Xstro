import { Antilink } from '../antilink.js';

export const handleAntiLink = async (conn, msg) => {
	const groupId = msg.from;
	const userId = msg.sender;

	const config = await Antilink.findOne({ where: { groupId } });
	if (!config?.enabled || msg.isAdmin) return;
	const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[^\s]+)/gi;
	if (!linkRegex.test(msg.body)) return;

	await conn.sendMessage(groupId, { delete: msg.key });

	const notify = async text =>
		await conn.sendMessage(groupId, {
			text: `_@${userId.split('@')[0]} ${text}_`,
			mentions: [userId],
		});

	let warnings = config.warnings || {};
	if (!warnings[userId]) warnings[userId] = 0;

	if (config.action === 'on') {
		await notify('links are not allowed here');
		return;
	}

	if (config.action === 'kick') {
		await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
		await notify('has been removed for sending links');
		return;
	}

	if (config.action === 'warn') {
		warnings[userId]++;
		config.set('warnings', warnings);
		config.changed('warnings', true);
		await config.save();

		if (warnings[userId] >= 3) {
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
