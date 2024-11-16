import { bot } from '../lib/client/plugins.js';
import { serialize } from '../lib/serialize.js';
import { loadMessage } from '../lib/sql/store.js';
import { numtoId, updateProfilePicture } from '../lib/utils.js';

bot(
	{
		pattern: 'vv',
		isPublic: false,
		desc: 'Download ViewOnce Messages',
		type: 'whatsapp',
	},
	async instance => {
		if (!instance.quoted.viewonce) return instance.sendReply('_Reply A ViewOnce_');
		const media = await instance.download();
		return await instance.send(media);
	},
);

bot(
	{
		pattern: 'myname',
		isPublic: false,
		desc: 'Changes your WhatsApp Name',
		type: 'whatsapp',
	},
	async (message, match) => {
		const newName = match || message.quoted?.text;
		if (!newName) return message.sendReply('_Provide A New Name_');
		if (newName > 25) return message.sendReply('_Only 25 letters allowed bro_');
		await message.client.updateProfileName(newName);
		return message.sendReply('_Name Updated!_');
	},
);

bot(
	{
		pattern: 'setpp',
		isPublic: false,
		desc: 'Set Your Profile Picture',
		type: 'whatsapp',
	},
	async message => {
		if (!message.quoted?.image) return message.sendReply('_Reply An Image_');
		const img = await message.download();
		await message.client.updateProfilePicture(message.user, img);
		return await message.sendReply('_Profile Picture Updated_');
	},
);

bot(
	{
		pattern: 'quoted',
		isPublic: false,
		desc: 'quoted message',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!message.quoted) return await message.sendReply('_Reply A Message_');
		let key = message.quoted.key.id;
		let msg = await loadMessage(key);
		if (!msg) return await message.sendReply('_Message not found maybe bot might not be running at that time_');
		msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
		if (!msg.quoted) return await message.sendReply('_No quoted message found_');
		await message.copyNForward(message.jid, msg.quoted);
	},
);

bot(
	{
		pattern: 'dlt',
		isPublic: false,
		desc: 'Deletes Message',
		type: 'whatsapp',
	},
	async message => {
		if (!message.quoted) return message.sendReply('_Reply A Message_');
		return await message.delete();
	},
);

bot(
	{
		pattern: 'archive',
		isPublic: false,
		desc: 'archive whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		const lstMsg = {
			message: m.message,
			key: m.key,
			messageTimestamp: message.timestamp,
		};
		await client.chatModify(
			{
				archive: true,
				lastMessages: [lstMsg],
			},
			message.jid,
		);
		await message.sendReply('_Archived_');
	},
);

bot(
	{
		pattern: 'unarchive',
		isPublic: false,
		desc: 'unarchive whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		const lstMsg = {
			message: m.message,
			key: m.key,
			messageTimestamp: message.timestamp,
		};
		await client.chatModify(
			{
				archive: false,
				lastMessages: [lstMsg],
			},
			message.jid,
		);
		await message.sendReply('_Unarchived_');
	},
);

bot(
	{
		pattern: 'blocklist',
		isPublic: false,
		desc: 'Fetches BlockList',
		type: 'whatsapp',
	},
	async message => {
		const blocklist = await message.client.fetchBlocklist();
		if (blocklist.length > 0) {
			const mentions = blocklist.map(number => `${number}`);
			const formattedList = blocklist.map(number => `• @${number.split('@')[0]}`).join('\n');
			await message.sendReply(`*_Blocked contacts:_*\n\n${formattedList}`, { mentions });
		} else {
			await message.sendReply('_No blocked Numbers!_');
		}
	},
);

bot(
	{
		pattern: 'clear ?(.*)',
		isPublic: false,
		desc: 'delete whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match) => {
		await message.client.chatModify(
			{
				delete: true,
				lastMessages: [
					{
						key: message.data.key,
						messageTimestamp: message.timestamp,
					},
				],
			},
			message.jid,
		);
		await message.sendReply('_Cleared_');
	},
);

bot(
	{
		pattern: 'rpp',
		isPublic: false,
		desc: 'Removes Profile Picture',
		type: 'whatsapp',
	},
	async message => {
		await message.client.removeProfilePicture(message.user);
		return message.sendReply('_Profile Picture Removed!_');
	},
);

bot(
	{
		pattern: 'pin',
		isPublic: false,
		desc: 'pin a chat',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		await client.chatModify({ pin: true }, message.jid);
		return message.sendReply('_Pined.._');
	},
);

bot(
	{
		pattern: 'unpin ?(.*)',
		isPublic: false,
		desc: 'unpin a msg',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		await client.chatModify({ pin: false }, message.jid);
		return message.sendReply('_Unpined.._');
	},
);

bot(
	{
		pattern: 'save',
		isPublic: false,
		desc: 'Saves Status',
		type: 'whatsapp',
	},
	async message => {
		if (!message.quoted) return message.sendReply('_Reply A Status_');
		const msg = await message.quoted;
		await message.copyNForward(message.user, msg, { quoted: msg });
	},
);

bot(
	{
		pattern: 'forward',
		isPublic: false,
		desc: 'Forwards A Replied Message',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!message.quoted) return message.sendReply('_Reply A Message!_');
		let jid;
		if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_You have to provide a number/tag someone_');
		const msg = message.quoted;
		await message.forward(jid, msg, { quoted: msg });
		return await message.sendReply(`_Message forward to @${jid.split('@')[0]}_`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'fullpp$',
		isPublic: false,
		desc: 'Set full screen profile picture',
		type: 'whatsapp',
	},
	async (message, match, m) => {
		if (!message.quoted.image) return await message.sendReply('_Reply to a photo_');
		let media = await message.download();
		await updateProfilePicture(message.user, media, message);
		return await message.sendReply('_Profile Picture Updated_');
	},
);
