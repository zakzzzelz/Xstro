import { DataTypes } from 'sequelize';
import DATABASE from '../lib/database.js';

const WarnDB = DATABASE.define(
	'Warn',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		warnings: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		reason: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	},
	{
		tableName: 'warnings',
		timestamps: false,
	},
);

export const addWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	if (user) {
		user.warnings += 1;
		await user.save();
		return { success: true, warnings: user.warnings };
	} else {
		const newUser = await WarnDB.create({ jid, warnings: 1 });
		return { success: true, warnings: newUser.warnings };
	}
};

export const getWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	return { success: true, warnings: user ? user.warnings : 0 };
};

export const resetWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	if (user) {
		user.warnings = 0;
		await user.save();
	}
	return { success: true };
};

export const isWarned = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	return user ? user.warnings > 0 : false;
};

export default WarnDB;
