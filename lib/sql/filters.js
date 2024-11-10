import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';

const Filters = DATABASE.define(
	'Filters',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		filterMessage: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: false,
		tableName: 'filters',
	},
);

export async function addFilter(filterMessage) {
	try {
		const newFilter = await Filters.create({
			filterMessage,
		});
		return {
			status: true,
			message: 'Filter added successfully',
			data: newFilter,
		};
	} catch (error) {
		return {
			status: false,
			message: 'Error adding filter',
			error: error.message,
		};
	}
}

export async function getSpecificFilter(jid, filterMessage) {
	try {
		const filter = await Filters.findOne({
			where: {
				jid,
				filterMessage,
			},
		});
		return {
			status: true,
			message: 'Filter retrieved successfully',
			data: filter,
		};
	} catch (error) {
		return {
			status: false,
			message: 'Error retrieving filter',
			error: error.message,
		};
	}
}

export async function getDMFilters() {
	try {
		const filters = await Filters.findAll();
		return {
			status: true,
			message: 'DM filters retrieved successfully',
			data: filters,
		};
	} catch (error) {
		return {
			status: false,
			message: 'Error retrieving DM filters',
			error: error.message,
		};
	}
}

export async function getGCFilters() {
	try {
		const filters = await Filters.findAll();
		return {
			status: true,
			message: 'Group chat filters retrieved successfully',
			data: filters,
		};
	} catch (error) {
		return {
			status: false,
			message: 'Error retrieving group chat filters',
			error: error.message,
		};
	}
}

export async function deleteFilters(filterMessage) {
	try {
		const deleted = await Filters.destroy({
			where: {
				filterMessage,
			},
		});
		return {
			status: true,
			message: `Filter deleted successfully`,
			count: deleted,
		};
	} catch (error) {
		return {
			status: false,
			message: 'Error deleting filters',
			error: error.message,
		};
	}
}

export default Filters;
