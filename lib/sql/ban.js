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
	await BanDB.create({ jid });
	return `_User ${jid} has been banned._`;
};

export const removeBan = async jid => {
	const ban = await BanDB.findOne({ where: { jid } });
	if (ban) {
		await ban.destroy();
		return `User ${jid} has been unbanned.`;
	}
	return `User ${jid} is not banned.`;
};

export const getBanned = async () => {
	const bannedUsers = await BanDB.findAll();
	return bannedUsers.map(user => user.jid);
};

export const isBanned = async jid => {
	const ban = await BanDB.findOne({ where: { jid } });
	return ban ? true : false;
};

export default BanDB;
