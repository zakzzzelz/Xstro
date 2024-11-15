import { delay } from 'baileys';
import { bot } from '../lib/client/plugins.js';
import { fancy } from './client/font.js';

bot(
	{
		pattern: 'advertise',
		isPublic: false,
		desc: 'Create and Share Advertisement Messages to all Your Groups',
		type: 'group',
	},
	async (message, match, m, client) => {
		const adMsg = match || message.quoted?.text;
		if (!adMsg) return message.sendReply('_I need text to advertise!_');
		const groups = await client.groupFetchAllParticipating();
		const groupDetails = Object.values(groups);
		const groupIds = groupDetails.map(group => group.id);
		await message.sendReply(`_Broadcasting to ${groupIds.length} groups. Estimated completion in ${groupIds.length * 1.5} seconds_`);
		const broadcastMessage = fancy(`*Broadcast*\n\n*Message:* `) + adMsg;
		const messageOptions = {
			forwardingScore: 999,
			isForwarded: true,
			externalAdReply: {
				showAdAttribution: true,
			},
		};
		for (const groupId of groupIds) {
			await delay(1500);
			await client.sendMessage(groupId, broadcastMessage, { contextInfo: messageOptions });
		}
		return await message.sendReply(`_Advertised Message to ${groupIds.length} Groups_`);
	},
);
