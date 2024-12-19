import { bot } from '#lib';
import { autobioDBService, placeholderService } from '#sql';

let autobioInterval;

bot(
	{
		pattern: 'autobio ?(.*)',
		isPublic: false,
		desc: 'Manage auto bio. Use "on" or "off".',
	},
	async (message, match) => {
		const action = match?.toLowerCase().trim();
		const autobioConfig = await autobioDBService.getConfig();
		const updateBio = async () => {
			const updatedBio = await placeholderService.replacePlaceholders(autobioConfig.autobio_msg, message.client);
			await message.client.updateProfileStatus(updatedBio);
			console.log(`[Autobio] Bio updated: ${updatedBio}`);
		};
		if (action === 'on') {
			if (autobioConfig.is_active) return message.send('_Autobio is already active!_');
			await autobioDBService.setActiveStatus(true);
			await updateBio();
			autobioInterval = setInterval(async () => {
				const currentConfig = await autobioDBService.getConfig();
				if (!currentConfig.is_active) return clearInterval(autobioInterval);
				await updateBio();
			}, 60 * 1000);
			return message.send('_Autobio activated! Bio will update every minute._');
		}
		if (action === 'off') {
			if (!autobioConfig.is_active) return message.send('_Autobio is not active!_');
			await autobioDBService.setActiveStatus(false);
			clearInterval(autobioInterval);
			return message.send('_Autobio deactivated!_');
		}
		return message.send('_Use "autobio on" or "autobio off"_');
	},
);
