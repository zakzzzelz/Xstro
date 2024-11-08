import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';

const NotesDB = DATABASE.define(
	'NotesDB',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		timestamps: false,
		tableName: 'notes',
	},
);

export async function addNote(title, content) {
	try {
		const newNote = await NotesDB.create({ title, content });
		return newNote;
	} catch (error) {
		console.error('Error adding note:', error);
		throw error;
	}
}

export async function updateNote(id, updates) {
	try {
		const [updated] = await NotesDB.update(updates, {
			where: { id },
		});
		if (updated) {
			const updatedNote = await NotesDB.findByPk(id);
			return updatedNote;
		}
		throw new Error('Note not found');
	} catch (error) {
		console.error('Error updating note:', error);
		throw error;
	}
}

export async function removeNote(id) {
	try {
		const deleted = await NotesDB.destroy({
			where: { id },
		});
		return deleted;
	} catch (error) {
		console.error('Error removing note:', error);
		throw error;
	}
}

export async function getNotes() {
	try {
		const notes = await NotesDB.findAll();
		return notes;
	} catch (error) {
		console.error('Error retrieving notes:', error);
		throw error;
	}
}

export default NotesDB;
