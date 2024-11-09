import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';

const BanDB = DATABASE.define(
	'ban',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		timestamps: false,
		tableName: 'ban',
	},
);

export const addBan = async jid => {
	const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
	const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
	await BanDB.create({ jid: trimmedJid });
	return `_User @${trimmedJid} has been banned._`;
};

export const removeBan = async jid => {
	const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
	const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
	const ban = await BanDB.findOne({ where: { jid: trimmedJid } });
	if (ban) {
		await ban.destroy();
		return `User @${trimmedJid} has been unbanned.`;
	}
	return `User @${trimmedJid} is not banned.`;
};

export const getBanned = async () => {
	const bannedUsers = await BanDB.findAll();
	return bannedUsers.map(user => user.jid);
};

export const isBanned = async jid => {
	const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
	const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
	const ban = await BanDB.findOne({ where: { jid: trimmedJid } });
	return !!ban;
};

export default BanDB;
