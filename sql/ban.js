import config from '../config.js';
import { DataTypes } from 'sequelize';

const BanDB = config.DATABASE.define(
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
	if (!jid) throw new Error('JID is required.');
	await BanDB.create({ jid });
	return `_@${jid} has been banned._`;
};

export const removeBan = async jid => {
	if (!jid) throw new Error('JID is required.');
	const ban = await BanDB.findOne({ where: { jid } });
	if (ban) {
		await ban.destroy();
		return `_@${jid} unbanned._`;
	}
	return `_@${jid} wasn't banned._`;
};

export const getBanned = async () => {
	const bannedUsers = await BanDB.findAll();
	return bannedUsers.map(user => user.jid);
};

export const isBanned = async jid => {
	if (!jid) throw new Error('JID is required.');
	const bannedUsers = await getBanned();
	return bannedUsers.includes(jid);
};

export default BanDB;
