import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';

export const AuthStateModel = DATABASE.define(
	'AuthState',
	{
		session_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		data_key: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		data_value: DataTypes.TEXT,
	},
	{
		tableName: 'session',
		timestamps: false,
	},
);
