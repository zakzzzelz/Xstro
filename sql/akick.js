import DATABASE from '#lib/database';
import { DataTypes } from 'sequelize';

const AutoKick = DATABASE.define(
	'AutoKick',
	{
		groupJid: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		participantJid: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
	},
	{
		tableName: 'autokick',
		timestamps: false,
	},
);

/**
 * Add a participant to the autokick list for a specific group
 * @param {string} groupJid - The group's unique identifier
 * @param {string} participantJid - The participant's unique identifier to be added to autokick
 * @returns {Promise<boolean>} - Returns true if successfully added, false otherwise
 */
const addToAutoKick = async (groupJid, participantJid) => {
	// Check if the entry already exists to prevent duplicates
	const [instance, created] = await AutoKick.findOrCreate({
		where: {
			groupJid,
			participantJid,
		},
	});

	return created;
};

/**
 * Remove a participant from the autokick list
 * @param {string} groupJid - The group's unique identifier
 * @param {string} participantJid - The participant's unique identifier to be removed
 * @returns {Promise<boolean>} - Returns true if successfully removed, false otherwise
 */
const removeFromAutoKick = async (groupJid, participantJid) => {
	const deletedCount = await AutoKick.destroy({
		where: {
			groupJid,
			participantJid,
		},
	});

	return deletedCount > 0;
};

/**
 * Get the list of participants in the autokick list for a specific group
 * @param {string} groupJid - The group's unique identifier
 * @returns {Promise<string[]|false>} - Returns array of participant JIDs or false if no entries found
 */
const getAutoKickList = async groupJid => {
	const kickList = await AutoKick.findAll({
		where: { groupJid },
		attributes: ['participantJid'],
	});

	if (kickList.length === 0) return false;

	return kickList.map(entry => entry.participantJid);
};

/**
 * Check if a specific participant is in the autokick list
 * @param {string} groupJid - The group's unique identifier
 * @param {string} participantJid - The participant's unique identifier to check
 * @returns {Promise<boolean>} - Returns true if participant is in autokick list, false otherwise
 */
const isInAutoKickList = async (groupJid, participantJid) => {
	const count = await AutoKick.count({
		where: {
			groupJid,
			participantJid,
		},
	});

	return count > 0;
};

export { AutoKick, addToAutoKick, removeFromAutoKick, getAutoKickList, isInAutoKickList };
