import fs from 'fs';
import path from 'path';

const store = path.join('store', 'notes.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readNotes = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeNotes = (notes) => fs.writeFileSync(store, JSON.stringify(notes, null, 2));

/**
 * Adds a new note to the database.
 * @param {string} title - The title of the note.
 * @param {string} content - The content of the note.
 * @returns {Promise<Object>} - The created note.
 */
export async function addNote(title, content) {
  const notes = readNotes();
  const newNote = {
    id: notes.length + 1, // Auto-increment id based on the current notes length
    title,
    content,
    createdAt: new Date(),
  };

  notes.push(newNote);
  writeNotes(notes);
  return newNote;
}

/**
 * Updates an existing note by its ID.
 * @param {number} id - The ID of the note to update.
 * @param {Object} updates - The updates to apply to the note.
 * @returns {Promise<Object>} - The updated note.
 */
export async function updateNote(id, updates) {
  const notes = readNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) {
    throw new Error('Note not found');
  }

  const updatedNote = { ...notes[noteIndex], ...updates, createdAt: notes[noteIndex].createdAt };
  notes[noteIndex] = updatedNote;
  writeNotes(notes);
  return updatedNote;
}

/**
 * Removes a note by its ID.
 * @param {number} id - The ID of the note to delete.
 * @returns {Promise<boolean>} - Returns true if deletion was successful, false otherwise.
 */
export async function removeNote(id) {
  const notes = readNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) {
    return false;
  }

  notes.splice(noteIndex, 1);
  writeNotes(notes);
  return true;
}

/**
 * Retrieves all notes.
 * @returns {Promise<Array>} - An array of all notes.
 */
export async function getNotes() {
  return readNotes();
}

/**
 * Retrieves a single note by its ID.
 * @param {number} id - The ID of the note to retrieve.
 * @returns {Promise<Object|null>} - The note object if found, or null.
 */
export async function getNote(id) {
  const notes = readNotes();
  return notes.find((note) => note.id === id) || null;
}
