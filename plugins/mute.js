import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'mute',
		isPublic: true,
		desc: 'Mute a group (admins only)',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins only!_');
		const metadata = await client.groupMetadata(m.from);
		if (metadata.announce) return message.sendReply('_Group is already muted. Only admins can send messages._');
		await client.groupSettingUpdate(m.from, 'announcement');
		await message.sendReply('_Group has been muted. Only admins can send messages now._');
	},
);

bot(
	{
		pattern: 'unmute',
		isPublic: true,
		desc: 'Unmute a group (admins only)',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins only!_');
		const metadata = await client.groupMetadata(m.from);
		if (!metadata.announce) return message.sendReply('_Group is already unmuted. All members can send messages._');
		await client.groupSettingUpdate(m.from, 'not_announcement');
		await message.sendReply('_Group has been unmuted. All members can send messages now._');
	},
);
