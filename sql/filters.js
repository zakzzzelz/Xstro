import DATABASE from '../lib/database.js';
import { DataTypes } from 'sequelize';

const FiltersDB = DATABASE.define(
	'filters',
	{
		text: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		response: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		tableName: 'filters',
		timestamps: false,
	},
);

/**
 * Adds a DM filter to the database.
 * @param {string} text - The trigger text for the filter.
 * @param {string} response - The response for the filter.
 * @returns {Promise<string>} - A success message.
 */
export async function addDmFilter(text, response) {
	try {
		await FiltersDB.create({ text: `dm:${text}`, response });
		return `DM filter '${text}' added successfully.`;
	} catch (error) {
		if (error.name === 'SequelizeUniqueConstraintError') {
			return `DM filter '${text}' already exists.`;
		}
		throw error;
	}
}

/**
 * Adds a GC filter to the database.
 * @param {string} text - The trigger text for the filter.
 * @param {string} response - The response for the filter.
 * @returns {Promise<string>} - A success message.
 */
export async function addGcFilter(text, response) {
	try {
		await FiltersDB.create({ text: `gc:${text}`, response });
		return `GC filter '${text}' added successfully.`;
	} catch (error) {
		if (error.name === 'SequelizeUniqueConstraintError') {
			return `GC filter '${text}' already exists.`;
		}
		throw error;
	}
}

/**
 * Removes a DM filter from the database.
 * @param {string} text - The trigger text of the filter to remove.
 * @returns {Promise<string>} - A success or failure message.
 */
export async function removeDmFilter(text) {
	const rowsDeleted = await FiltersDB.destroy({
		where: { text: `dm:${text}` },
	});
	return rowsDeleted ? `DM filter '${text}' removed successfully.` : `DM filter '${text}' does not exist.`;
}

/**
 * Removes a GC filter from the database.
 * @param {string} text - The trigger text of the filter to remove.
 * @returns {Promise<string>} - A success or failure message.
 */
export async function removeGcFilter(text) {
	const rowsDeleted = await FiltersDB.destroy({
		where: { text: `gc:${text}` },
	});
	return rowsDeleted ? `GC filter '${text}' removed successfully.` : `GC filter '${text}' does not exist.`;
}

/**
 * Retrieves all DM filters from the database.
 * @returns {Promise<Array<{ word: string, response: string }>>} - An array of DM filters.
 */
export async function getDmFilters() {
	const filters = await FiltersDB.findAll({
		where: { text: { [FiltersDB.Sequelize.Op.like]: 'dm:%' } },
	});
	return filters.map(filter => ({
		word: filter.text.replace('dm:', ''),
		response: filter.response,
	}));
}

/**
 * Retrieves all GC filters from the database.
 * @returns {Promise<Array<{ word: string, response: string }>>} - An array of GC filters.
 */
export async function getGcFilters() {
	const filters = await FiltersDB.findAll({
		where: { text: { [FiltersDB.Sequelize.Op.like]: 'gc:%' } },
	});
	return filters.map(filter => ({
		word: filter.text.replace('gc:', ''),
		response: filter.response,
	}));
}

export default FiltersDB;
