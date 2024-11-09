import { bot } from '../lib/client/plugins.js';
import { addNote, removeNote, updateNote, getNotes } from '../lib/db/notes.js';

bot(
	{
		pattern: 'addnote',
		desc: 'Create Notes',
		type: 'user',
	},
	async (message, match) => {
		const text = match.trim();
		const [title, ...contentArr] = text.split('\n');
		const content = contentArr.join('\n');

		if (!title) return await message.sendReply('*Format*: _.addnote title\ncontent_');

		const newNote = await addNote(title, content || '').catch(() => null);
		if (!newNote) return await message.sendReply('*Unable to perform action*');

		return await message.sendReply(`*Note added*\n\n*Title*: ${newNote.title}\n*ID*: ${newNote.id}`);
	},
);

bot(
	{
		pattern: 'delnote',
		desc: 'Delete a Note',
		type: 'user',
	},
	async (message, match) => {
		const noteId = parseInt(match.trim());
		if (!noteId || isNaN(noteId)) return await message.sendReply('*Format*: _.delnote [note_id]_');

		const deleted = await removeNote(noteId).catch(() => null);
		if (!deleted) return await message.sendReply('*Unable to perform action*');

		return await message.sendReply(`*Note ${noteId} deleted*`);
	},
);

bot(
	{
		pattern: 'editnote',
		desc: 'Update an Existing Note',
		type: 'user',
	},
	async (message, match) => {
		const text = match.trim();
		const [noteId, ...contentArr] = text.split('\n');
		const id = parseInt(noteId);
		const updates = {};

		if (!id || isNaN(id)) return await message.sendReply('*Format*: _.editnote [note_id]\ntitle: New Title\ncontent: New Content_');

		const updateText = contentArr.join('\n');
		const updateLines = updateText.split('\n');

		for (const line of updateLines) {
			if (line.startsWith('title:')) updates.title = line.slice(6).trim();
			else if (line.startsWith('content:')) updates.content = line.slice(8).trim();
		}

		if (Object.keys(updates).length === 0) return await message.sendReply('*Provide title or content to update*');

		const updatedNote = await updateNote(id, updates).catch(() => null);
		if (!updatedNote) return await message.sendReply('*Unable to perform action*');

		return await message.sendReply(`*Note updated*\n\n*ID*: ${updatedNote.id}\n*Title*: ${updatedNote.title}\n*Content*: ${updatedNote.content}`);
	},
);

bot(
	{
		pattern: 'getnotes',
		desc: 'List all Notes',
		type: 'user',
	},
	async (message, match) => {
		const notes = await getNotes().catch(() => null);
		if (!notes) return await message.sendReply('*Unable to perform action*');
		if (notes.length === 0) return await message.sendReply('*No notes found*');
		const notesList = notes.map(note => `*ID*: ${note.id}\n*Title*: ${note.title}\n*Content*: ${note.content}\n`).join('\n');
		return await message.sendReply(`*Notes*\n\n${notesList}`);
	},
);
