import { bot } from "../lib/handler.js";
import Jimp from "jimp";

bot(
    {
        pattern: "fullpp$",
        fromMe: true,
        desc: "Set full screen profile picture",
        type: "whatsapp",
    },
    async (message,) => {
        if (!message.reply_message.image) return await message.sendReply("_Reply to a photo_");
        const media = await message.download();
        await updateProfilePicture(message.user, media, message);
        return await message.sendReply("_Profile Picture Updated_");
    }
);

const updateProfilePicture = async (jid, image, message) => {
    const { query } = message.client;
    const { img } = await generateProfilePicture(image);
    await query({
        tag: "iq",
        attrs: {
            to: jid,
            type: "set",
            xmlns: "w:profile:picture",
        },
        content: [
            {
                tag: "picture",
                attrs: { type: "image" },
                content: img,
            },
        ],
    });
};

const generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer);
    const min = jimp.getWidth();
    const max = jimp.getHeight();
    const cropped = jimp.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(324, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
    };
};
