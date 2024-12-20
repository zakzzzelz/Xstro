import { bot } from '#lib';
import { remini, uploadFile } from '#utils';

bot(
	{
		pattern: 'getpp',
		public: true,
		desc: 'Get Another Person Profile Image',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const img = await message.getProfileImage(jid);
		await message.send(img);
	},
);

bot(
	{
		pattern: 'getbio',
		public: true,
		desc: 'Get the WhatsApp Bio of a User',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const bioDetails = await message.client.fetchStatus(jid);
		const { status, setAt } = bioDetails;
		if (status && setAt) {
			await message.send(`\`\`\`@${jid.split('@')[0]} bio's\n\nBio: ${status}\n\nSetAt: ${setAt}\`\`\``, { mentions: [jid] });
		} else {
			message.send('_Unable to Get user bio_');
		}
	},
);

bot(
	{
		pattern: 'enhance',
		public: true,
		desc: 'Enahnces An Image',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const img = await message.download();
		const enhancedImg = await remini(img, 'enhance');
		await message.send(enhancedImg);
	},
);

bot(
	{
		pattern: 'recolor',
		public: true,
		desc: 'Recolors An Image',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const img = await message.download();
		const recoloredImg = await remini(img, 'recolor');
		await message.send(recoloredImg);
	},
);

bot(
	{
		pattern: 'dehaze',
		public: true,
		desc: 'Dehazes An Image',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const img = await message.download();
		const dehazedImg = await remini(img, 'dehaze');
		await message.send(dehazedImg);
	},
);

bot(
	{
		pattern: 'upload',
		public: true,
		desc: 'Uploads A File',
	},
	async message => {
		if (!message.reply_message.image && !message.reply_message.video && !message.reply_message.audio && !message.reply_message.sticker && !message.reply_message.document) {
			return message.send('_Reply A File_');
		}
		const data = await message.download();
		const url = await uploadFile(data);
		await message.send(`_Uploaded File:\n${url}_`);
	},
);
