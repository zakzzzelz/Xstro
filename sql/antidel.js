import config from '../config.js';
import { DataTypes } from 'sequelize';

const AntiDelDB = config.DATABASE.define(
	'AntiDelete',
	{
		chatId: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		status: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: 'antidelete',
		timestamps: false,
	},
);

export async function setAnti(chatId, status) {
	const record = await AntiDelDB.findOne({ where: { chatId } });
	if (record) {
		await record.update({ status });
	} else {
		await AntiDelDB.create({ chatId, status });
	}
	return true;
}

export async function getAnti(chatId) {
	const record = await AntiDelDB.findOne({ where: { chatId } });
	return record ? record.status : false;
}
