import { DataTypes } from 'sequelize';
import config from '../config.js';
import { getJson } from 'utils';
import DATABASE from '../lib/database.js';

const AutoBioDB = DATABASE.define(
	'autobio',
	{
		autobio_msg: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		editautomsg: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		update_interval: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 5 * 60 * 1000,
		},
	},
	{
		timestamps: false,
		tableName: 'autobio',
	},
);

export const autobioDBService = {
	async getConfig() {
		const autobio = await AutoBioDB.findOne({ where: { id: 1 } });
		return (
			autobio || {
				autobio_msg: 'xstro md auto bio bot',
				editautomsg: 'xstro md auto edit msg',
				is_active: false,
				update_interval: 5 * 60 * 1000,
			}
		);
	},

	async setActiveStatus(status) {
		return AutoBioDB.update({ is_active: status }, { where: { id: 1 } });
	},

	async setInterval(interval) {
		return AutoBioDB.update({ update_interval: interval * 60 * 1000 }, { where: { id: 1 } });
	},
};

export const placeholderService = {
	async facts() {
		try {
			const res = await getJson(config.XSTRO_API + '/api/facts');
			return res.fact;
		} catch (error) {
			console.error('Failed to fetch facts:', error);
			return 'Unable to fetch fact';
		}
	},

	async quotes() {
		try {
			const res = await getJson(config.XSTRO_API + '/api/quotes');
			return `${res.quote}\n_Author:_${res.author}`;
		} catch (error) {
			console.error('Failed to fetch quotes:', error);
			return 'Unable to fetch quote';
		}
	},

	async replacePlaceholders(message, client) {
		const placeholders = {
			'&user': client.user.name,
			'&facts': await this.facts(),
			'&quotes': await this.quotes(),
			'&botname': config.BOT_INFO.split(';')[1],
			'&time': new Date().toLocaleString(),
			'&date': new Date().toLocaleDateString(),
			'&weekday': new Date().toLocaleDateString('en-US', { weekday: 'long' }),
		};

		return Object.entries(placeholders).reduce((msg, [key, value]) => msg.replace(new RegExp(key, 'g'), value), message);
	},
};
export default AutoBioDB;
