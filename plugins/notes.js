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
		if (!text) return await message.reply('*Format*: _.addnote title|content_');
		const [title, content] = text.split('|');
		if (!title) return await message.reply('*Format*: _.addnote title|content_');
		const newNote = await addNote(title, content || '').catch(() => null);
		if (!newNote) return await message.reply('*Unable to perform action*');
		return await message.reply(`*Note added*\n\n*ID*: ${newNote.id}`);
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
		if (!noteId || isNaN(noteId)) return await message.reply('*Format*: _.delnote id_');
		const deleted = await removeNote(noteId).catch(() => null);
		if (!deleted) return await message.reply('*Unable to perform action*');
		return await message.reply(`*Note deleted*`);
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
		if (!text) return await message.reply('*Format*: _.editnote id; title|content_');
		const [id, content] = text.split(';').map(item => item.trim());
		if (!id || !content) return await message.reply('*Format*: _.editnote id; title|content_');
		const [title, newContent] = content.split('|');
		const updates = {
			title: title.trim(),
			content: newContent?.trim() || '',
		};
		const updatedNote = await updateNote(parseInt(id), updates).catch(() => null);
		if (!updatedNote) return await message.reply('*Unable to perform action*');
		return await message.reply('*Note updated*');
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
		if (!notes) return await message.reply('*Unable to perform action*');
		if (notes.length === 0) return await message.reply('*No notes found*');
		const notesList = notes.map((note, index) => `${index + 1}. ${note.title}`).join('\n');
		return await message.reply(`*_Notes:_*\n\n${notesList}`);
	},
);
