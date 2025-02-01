import { bot } from '#lib';
import { LANG } from '#lang';
import { addBgm, getBgmResponse, deleteBgm, getBgmList, saveMessages } from '#sql';

bot(
  {
    pattern: 'bgm',
    desc: 'Show BGM command menu',
    type: 'bgm',
  },
  async (message, _, { prefix }) => {
    const menuText = `
BGM Menu

Usage:
${prefix}bgm - Show menu
${prefix}addbgm <word> - Add BGM (reply to audio)
${prefix}getbgm <word> - Play BGM 
${prefix}delbgm <word> - Delete BGM
${prefix}listbgm - Show all BGMs

Note: Bot plays matching BGMs automatically in chat
`.trim();
    return message.send(menuText);
  }
);

bot(
  {
    pattern: 'addbgm',
    public: false,
    desc: 'Add a new BGM entry',
    usage: '.addbgm word (reply to audio)',
    type: 'bgm',
  },
  async (message, match, { reply_message, loadMessage }) => {
    if (!match) return message.reply('Example: .addbgm hello (reply to audio)');
    if (!reply_message || !reply_message?.audio) return message.send(LANG.AUDIO);
    const word = match.trim().toLowerCase();
    await addBgm(word, reply_message.key.id);
    if (!(await loadMessage(reply_message.key.id))) {
      await saveMessages(reply_message);
    }
    return message.send(`_BGM added for ${word}_`);
  }
);

bot(
  {
    pattern: 'getbgm',
    desc: 'Get a BGM by word',
    usage: '.getbgm word',
    type: 'bgm',
  },
  async (message, match, { loadMessage, relayMessage }) => {
    if (!match) return message.send('_Example: .getbgm hello_');
    const messageId = await getBgmResponse(match.trim().toLowerCase());
    if (!messageId) return message.send(`_No BGM found for ${match}_`);
    const audioMessage = await loadMessage(messageId);
    if (!audioMessage) return message.send('_Failed to load audio message_');
    return await relayMessage(message.jid, audioMessage.message.message, {});
  }
);

bot(
  {
    pattern: 'delbgm',
    public: false,
    desc: 'Delete a BGM entry',
    type: 'bgm',
  },
  async (message, match) => {
    if (!match) return message.send('_Example: .delbgm hello_');
    const word = match.trim().toLowerCase();
    const exists = await getBgmResponse(word);
    if (!exists) return message.send(`_No BGM found for ${word}_`);
    await deleteBgm(word);
    return message.send(`_BGM deleted for ${word}_`);
  }
);

bot(
  {
    pattern: 'listbgm',
    public: false,
    desc: 'List all available BGMs',
    type: 'bgm',
  },
  async (message) => {
    const bgmList = await getBgmList();
    if (!bgmList.length) return message.send('_No BGMs found_');
    const formattedList = bgmList.map((bgm) => `${bgm.word}`).join('\n');
    return message.send(`BGM List:\n\n${formattedList}`);
  }
);

bot(
  {
    on: 'text',
    dontAddCommandList: true,
  },
  async (message, _, { loadMessage, relayMessage }) => {
    if (message.sender === message.user) return;
    const messageId = await getBgmResponse(message.text.trim().toLowerCase());
    if (!messageId) return;
    const audioMessage = await loadMessage(messageId);
    if (!audioMessage) return;
    return await relayMessage(message.jid, audioMessage.message.message, {});
  }
);
