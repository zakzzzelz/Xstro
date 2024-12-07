import { bot } from '../lib/plugins.js';
import { getWarn, resetWarn, addWarn } from './sql/warn.js';

bot(
	{
		pattern: 'warn',
		isPublic: false,
		desc: 'Warns a user',
		type: 'user',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		const response = await getWarn(jid);

		if (response.success) {
			const warnMsg = `@${jid.split('@')[0]} *has been warned.*\n\n*Warnings:* ${response.warnings}`;
			await message.send(warnMsg, { mentions: [jid] });

			if (response.warnings > 2) {
				if (message.isGroup) {
					if (!message.isBotAdmin) return (await message.Block(jid)) && message.send('_Blocked Idiot_');
					await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
					await resetWarn(jid);
					await message.send(`@${jid.split('@')[0]} *was removed from the group and blocked for exceeding the warning limit.*`, { mentions: [jid] });
				} else {
					await message.client.updateBlockStatus(message.jid, 'block');
					await resetWarn(jid);
					await message.send(`*User @${jid.split('@')[0]} was blocked for exceeding the warning limit.*`, { mentions: [jid] });
				}
			}
		} else {
			const addResponse = await addWarn(jid);
			if (addResponse.success) {
				const warnMsg = `@${jid.split('@')[0]} *has been warned.*\n\n*Warnings:* ${addResponse.warnings}`;
				await message.send(warnMsg, { mentions: [jid] });
			} else {
				await message.send('_Failed to add a warning_');
			}
		}
	},
);

bot(
	{
		pattern: 'rwarn',
		isPublic: false,
		desc: 'Resets a user’s warnings',
		type: 'user',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		await resetWarn(jid);
		await message.send(`@${jid.split('@')[0]}'s warnings have been reset.`, {
			mentions: [jid],
		});
	},
);

bot(
	{
		pattern: 'getwarns',
		isPublic: false,
		desc: 'Checks a user’s warnings',
		type: 'user',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		const response = await getWarn(jid);
		if (response.success) {
			const warnMsg = `@${jid.split('@')[0]} has ${response.warnings} warning(s).`;
			await message.send(warnMsg, { mentions: [jid] });
		} else {
			await message.send('_Failed to retrieve warnings_');
		}
	},
);
