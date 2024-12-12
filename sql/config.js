import { DataTypes } from 'sequelize';
import DATABASE from '../lib/database.js';

const CONFIG_CMDS = DATABASE.define(
	'CONFIG_CMDS',
	{
		autoRead: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		autoStatusRead: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		cmdReact: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		mode: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'configs',
		timestamps: false,
	},
);

async function updateConfig(field, value) {
	const boolValue = !!value;
	let [config, created] = await CONFIG_CMDS.findOrCreate({
		where: {},
		defaults: {
			autoRead: false,
			autoStatusRead: false,
			cmdReact: false,
			mode: false,
		},
	});

	await config.update({ [field]: boolValue });

	return config;
}

async function getConfig() {
	const config = await CONFIG_CMDS.findOne({ where: {} });
	return config
		? {
				autoRead: config.autoRead,
				autoStatusRead: config.autoStatusRead,
				cmdReact: config.cmdReact,
				mode: config.mode,
		  }
		: {
				autoRead: false,
				autoStatusRead: false,
				cmdReact: false,
				mode: false,
		  };
}

export { updateConfig, getConfig };
