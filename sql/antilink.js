import DATABASE from '../lib/database.js';
import { DataTypes } from 'sequelize';

const Antilink = DATABASE.define(
	'Antilink',
	{
		jid: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		type: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		action: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		warningCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	},
	{
		tableName: 'antilink',
		timestamps: false,
		indexes: [
			{
				unique: true,
				fields: ['jid', 'type'],
			},
		],
	},
);

/**
 * Set or update the antilink configuration for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type ('on', 'delete', 'kick', 'warn').
 * @param {string} action - The action to set ('on', 'delete', 'kick', 'warn').
 * @returns {Promise<void>}
 */
async function setAntilink(jid, type, action) {
	await Antilink.upsert({
		jid,
		type,
		action,
		warningCount: 0,
	});
}

/**
 * Get the antilink configuration for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type ('on', 'delete', 'kick', 'warn').
 * @returns {Promise<object|null>} - Returns the configuration object or null.
 */
async function getAntilink(jid, type) {
	return await Antilink.findOne({
		where: { jid, type },
		raw: true,
	});
}

/**
 * Save the warning count for a user in a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type.
 * @param {number} count - The warning count.
 * @returns {Promise<void>}
 */
async function saveWarningCount(jid, type, count) {
	await Antilink.update({ warningCount: count }, { where: { jid, type } });
}

/**
 * Increment the warning count for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type.
 * @returns {Promise<number>} - Returns the new warning count.
 */
async function incrementWarningCount(jid, type) {
	const config = await getAntilink(jid, type);
	if (!config) return 0;

	const newCount = (config.warningCount || 0) + 1;
	await saveWarningCount(jid, type, newCount);
	return newCount;
}

/**
 * Reset warning count for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type.
 * @returns {Promise<void>}
 */
async function resetWarningCount(jid, type) {
	await saveWarningCount(jid, type, 0);
}

export { Antilink, setAntilink, getAntilink, saveWarningCount, incrementWarningCount, resetWarningCount };
