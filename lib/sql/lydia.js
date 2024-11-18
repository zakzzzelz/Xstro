import { DataTypes } from 'sequelize';
import config from '../../config.js';

export const ChatBot = config.DATABASE.define(
	'ChatBot',
	{
		chat: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		type: {
			type: DataTypes.ENUM('dm', 'gc', 'all'),
			defaultValue: 'all',
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: 'lydia',
		timestamps: false,
	},
);
