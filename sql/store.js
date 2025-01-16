import fs from 'fs';
import path from 'path';
import { isJidGroup } from 'baileys';

const messageDb = path.join('store', 'messages.json');
const messageCountDb = path.join('store', 'message_counts.json');
const contactDb = path.join('store', 'contacts.json');
const groupMetadataDb = path.join('store', 'group_metadata.json');
const groupParticipantsDb = path.join('store', 'group_participants.json');

const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const init = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};

init(messageDb);
init(messageCountDb);
init(contactDb);
init(groupMetadataDb);
init(groupParticipantsDb);

const findOrCreate = (filePath, query) => {
  const data = readJSON(filePath);
  const record = data.find((item) => item.jid === query.jid && item.sender === query.sender);
  if (record) return { record, created: false };
  data.push(query);
  writeJSON(filePath, data);
  return { record: query, created: true };
};

/**
 * Saves or updates a contact in the JSON database.
 * @param {string} jid - The JID of the contact.
 * @param {string} name - The name of the contact.
 */
const saveContact = async (jid, name) => {
  if (!jid || !name || isJidGroup(jid)) return;
  const contacts = readJSON(contactDb);
  const contact = contacts.find((c) => c.jid === jid);
  if (contact) {
    if (contact.name !== name) {
      contact.name = name;
      writeJSON(contactDb, contacts);
    }
  } else {
    contacts.push({ jid, name });
    writeJSON(contactDb, contacts);
  }
};

/**
 * Saves or updates a message in the JSON database.
 * @param {Object} message - The message object.
 */
const saveMessage = async (message) => {
  const jid = message.key.remoteJid;
  const id = message.key.id;
  const msg = message;
  if (!id || !jid || !msg) return;
  await saveContact(message.sender, message.pushName);

  const messages = readJSON(messageDb);
  let exists = messages.find((msg) => msg.id === id && msg.jid === jid);

  if (exists) {
    exists.message = msg;
  } else {
    messages.push({ id, jid, message: msg });
  }

  writeJSON(messageDb, messages);
};

/**
 * Loads a message from the JSON database by ID.
 * @param {string} id - The message ID.
 * @returns {Object|null} - The message data or null if not found.
 */
const loadMessage = async (id) => {
  const messages = readJSON(messageDb);
  const message = messages.find((msg) => msg.id === id);
  return message || null;
};

/**
 * Gets the name of a contact from the JSON database.
 * @param {string} jid - The JID of the contact.
 * @returns {string} - The name of the contact.
 */
const getName = async (jid) => {
  const contacts = readJSON(contactDb);
  const contact = contacts.find((c) => c.jid === jid);
  return contact ? contact.name : jid.split('@')[0].replace(/_/g, ' ');
};

/**
 * Saves or updates group metadata in the JSON database.
 * @param {string} jid - The group JID.
 * @param {Object} client - The client instance to fetch metadata.
 */
const saveGroupMetadata = async (jid, client) => {
  if (!isJidGroup(jid)) return;

  const groupMetadata = await client.groupMetadata(jid);
  const metadata = {
    jid: groupMetadata.id,
    subject: groupMetadata.subject,
    subjectOwner: groupMetadata.subjectOwner,
    subjectTime: groupMetadata.subjectTime ? new Date(groupMetadata.subjectTime * 1000) : null,
    size: groupMetadata.size,
    creation: groupMetadata.creation ? new Date(groupMetadata.creation * 1000) : null,
    owner: groupMetadata.owner,
    desc: groupMetadata.desc,
    descId: groupMetadata.descId,
    linkedParent: groupMetadata.linkedParent,
    restrict: groupMetadata.restrict,
    announce: groupMetadata.announce,
    isCommunity: groupMetadata.isCommunity,
    isCommunityAnnounce: groupMetadata.isCommunityAnnounce,
    joinApprovalMode: groupMetadata.joinApprovalMode,
    memberAddMode: groupMetadata.memberAddMode,
    ephemeralDuration: groupMetadata.ephemeralDuration,
  };

  const groupMetadataData = readJSON(groupMetadataDb);
  let existingGroup = groupMetadataData.find((group) => group.jid === jid);
  if (existingGroup) {
    Object.assign(existingGroup, metadata);
  } else {
    groupMetadataData.push(metadata);
  }
  writeJSON(groupMetadataDb, groupMetadataData);

  // Save participants
  const participants = groupMetadata.participants;
  const groupParticipants = readJSON(groupParticipantsDb);
  participants.forEach((participant) => {
    const existingParticipant = groupParticipants.find(
      (p) => p.jid === jid && p.participantId === participant.id
    );
    if (existingParticipant) {
      existingParticipant.admin = participant.admin;
    } else {
      groupParticipants.push({
        jid,
        participantId: participant.id,
        admin: participant.admin,
      });
    }
  });
  writeJSON(groupParticipantsDb, groupParticipants);
};

/**
 * Gets group metadata from the JSON database.
 * @param {string} jid - The group JID.
 * @returns {Object|null} - The group metadata or null if not found.
 */
const getGroupMetadata = async (jid) => {
  const groupMetadata = readJSON(groupMetadataDb);
  const metadata = groupMetadata.find((group) => group.jid === jid);
  if (!metadata) return null;

  const participants = readJSON(groupParticipantsDb).filter((p) => p.jid === jid);
  return {
    ...metadata,
    participants: participants.map((p) => ({
      id: p.participantId,
      admin: p.admin,
    })),
  };
};

/**
 * Saves or updates the message count in the JSON database.
 * @param {Object} message - The message object.
 */
const saveMessageCount = async (message) => {
  const jid = message.key.remoteJid;
  const sender = message.key.participant || message.sender;
  if (!jid || !sender || !isJidGroup(jid)) return;

  const { record, created } = findOrCreate(messageCountDb, { jid, sender, count: 1 });
  if (!created) {
    record.count += 1;
    writeJSON(messageCountDb, readJSON(messageCountDb));
  }
};

/**
 * Gets inactive group members based on message count.
 * @param {string} jid - The group JID.
 * @returns {Array} - List of inactive participant IDs.
 */
const getInactiveGroupMembers = async (jid) => {
  if (!isJidGroup(jid)) return [];

  const groupMetadata = await getGroupMetadata(jid);
  if (!groupMetadata) return [];

  const inactiveMembers = groupMetadata.participants.filter((participant) => {
    const messageCount = readJSON(messageCountDb).find(
      (record) => record.jid === jid && record.sender === participant.id
    );
    return !messageCount || messageCount.count === 0;
  });

  return inactiveMembers.map((participant) => participant.id);
};

/**
 * Gets the message count for group members.
 * @param {string} jid - The group JID.
 * @returns {Array} - List of members and their message counts.
 */
const getGroupMembersMessageCount = async (jid) => {
  if (!isJidGroup(jid)) return [];

  const messageCounts = readJSON(messageCountDb).filter(
    (record) => record.jid === jid && record.count > 0
  );
  const rankedMembers = await Promise.all(
    messageCounts.map(async (record) => ({
      sender: record.sender,
      name: await getName(record.sender),
      messageCount: record.count,
    }))
  );

  return rankedMembers;
};

export {
  saveContact,
  loadMessage,
  getName,
  saveGroupMetadata,
  getGroupMetadata,
  saveMessageCount,
  getInactiveGroupMembers,
  getGroupMembersMessageCount,
  saveMessage,
};
