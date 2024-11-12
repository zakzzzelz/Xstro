import { delay } from 'baileys';
import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'ckick',
		isPublic: false,
		desc: 'Kick a certain country code from a group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins only!_');
		const countryCode = match?.trim().replace('+', '');
		if (!countryCode || isNaN(countryCode)) return message.sendReply('_Please provide a valid country code._');
		const metadata = await client.groupMetadata(m.from);
		const participants = metadata.participants;
		const toKick = participants.filter(participant => participant.id.startsWith(`${countryCode}`) && !participant.admin).map(participant => participant.id);
		if (!toKick.length) return message.sendReply(`_No members found with the country code ${countryCode}._`);
		for (const jid of toKick) {
			await client.groupParticipantsUpdate(m.from, [jid], 'remove');
			await message.sendReply(`_Kicked member:_ @${jid.split('@')[0]}`, { mentions: [jid] });
			await delay(2000);
		}
		await message.sendReply(`_Kicked All Memeber from ${countryCode}._`);
	},
);
