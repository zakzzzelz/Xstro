import { bot } from '../lib/cmds.js';
import { getChatSummary, getGroupMetadata } from '../sql/store.js';

bot(
	{
		pattern: 'getchats',
		isPublic: false,
		desc: 'Get chats summary',
	},
	async (message, match, { prefix }) => {
		if (!match) return message.send(`Usage: ${prefix}getchats dm/gc`);

		const chatType = match.trim();
		const allChats = await getChatSummary();

		const filteredChats = chatType === 'dm' ? allChats.filter(chat => !chat.jid.endsWith('@g.us') && !chat.jid.endsWith('@newsletter')) : allChats.filter(chat => chat.jid.endsWith('@g.us'));

		if (filteredChats.length === 0) return message.send(`No ${chatType === 'dm' ? 'direct messages' : 'group chats'} found.`);

		const mentionJids = filteredChats.filter(chat => chatType === 'dm').map(chat => chat.jid);

		const formattedChats =
			chatType === 'dm'
				? filteredChats.map((chat, index) => `${index + 1}. FROM: @${chat.jid.split('@')[0]}\nMessages: ${chat.messageCount}\nLast Message: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`)
				: await Promise.all(
						filteredChats.map(async (chat, index) => {
							try {
								const groupMetadata = await getGroupMetadata(chat.jid);
								return `GROUP: ${groupMetadata?.subject || 'Unknown Group'}\nMessages: ${chat.messageCount}\nLast Message: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`;
							} catch (error) {
								return `GROUP: Unknown Group\nMessages: ${chat.messageCount}\nLast Message: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`;
							}
						}),
				  );

		message.send(`\`\`\`${chatType.toUpperCase()} Chats:\n\n${formattedChats.join('\n\n')}\`\`\``, { mentions: mentionJids });
	},
);
