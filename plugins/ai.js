import { bot } from '../lib/handler.js';
import { DiffuseAI, Gemini, GPT4, Llama, Text2Img } from '../lib/tools/ai.js';

bot(
   {
      pattern: 'gemini ?(.*)',
      isPublic: true,
      desc: 'Chat with Gemini Ai',
      type: 'ai',
   },
   async (message, match) => {
      const msg = await message.sendReply('🤔 _Thinking_');
      const res = await Gemini(match || message.reply_message?.text);
      return await msg.edit(res);
   }
);

bot(
   {
      pattern: 'gpt',
      isPublic: true,
      desc: 'OpenAi GPT4',
      type: 'ai',
   },
   async (message, match) => {
      const msg = await message.sendReply('🤖 _Deep thought_');
      const res = await GPT4(match || message.reply_message?.text);
      return await msg.edit(res);
   }
);

bot(
   {
      pattern: 'llama',
      isPublic: true,
      desc: 'Chat with llama Ai',
      type: 'ai',
   },
   async (message, match) => {
      const msg = await message.sendReply('⏳ _Processing Request_');
      const request = await Llama(match || message.reply_message?.text);
      return await msg.edit(request);
   }
);

bot(
   {
      pattern: 'genimg',
      isPublic: true,
      desc: 'Generate Images Using Ai',
      type: 'ai',
   },
   async (message, match) => {
      const img = await DiffuseAI(match || message.reply_message?.text);
      return await message.send(img);
   }
);

bot(
   {
      pattern: 'imgai',
      isPublic: true,
      desc: 'Generate Images Using Ai',
      type: 'ai',
   },
   async (message, match) => {
      const img = await Text2Img(match || message.reply_message?.text);
      return await message.send(img);
   }
);
