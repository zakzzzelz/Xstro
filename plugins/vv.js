import { bot } from '../lib/plugins.js'

bot(
    {
        pattern: 'vv',
        desc: 'Download ViewOnce Messages',
        type: 'whatsapp'
    },
    async (message) => {
        if (!message.quoted.viewonce) return message.sendReply('_Reply A ViewOnce_')
        const media = await message.download()
        return await message.send(media)
    }
)