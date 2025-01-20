import { getConfig } from '#sql';

const commands = [];

async function bot(cmd, func) {
  cmd.function = func;
  cmd.pattern = new RegExp(`^(${cmd.pattern})(?:\\s+([\\s\\S]+))?$`, 'i');
  cmd.public = cmd.public || false;
  cmd.isGroup = cmd.isGroup || false;
  cmd.dontAddCommandList = cmd.dontAddCommandList || false;
  commands.push(cmd);
  return cmd;
}

const Plugins = async (msg, client, Message) => {
  if (!msg.body) return;
  const { PREFIX, disablegc, disabledm, cmdReact, cmdRead, disabledCmds } = await getConfig();

  for (const cmd of commands) {
    console.log(cmd);
    const prefix = Array.from(PREFIX).find((p) => msg.body.startsWith(p));
    const match = msg.body.slice(prefix.length).match(cmd.pattern);
    if (prefix && match) {
      if (msg.isGroup && disablegc && `${prefix}${match[2]}` !== `${prefix}enablegc`) return;
      if (!msg.isGroup && disabledm && msg.from !== msg.user) return;
      if (disabledCmds.includes(match[1])) return await msg.send('```This command is disabled```');

      const args = match[2] ?? '';

      if (msg.mode && !msg.sudo && !msg.user) return;
      if (msg.isban) return await msg.send('```You are banned from using commands!```');
      if (cmd.isGroup && !msg.isGroup) return msg.send('```This Command is for Groups```');
      if (!msg.mode && !cmd.public && !msg.sudo) return await msg.send('```For My Owners Only!```');
      if (cmdReact) await Message.react('⏳');
      if (cmdRead) await client.readMessages([msg.key]);

      try {
        await cmd.function(Message, args, { ...Message });
        return await Message.react('');
      } catch (err) {
        await Message.react('❌');
        return msg.error(cmd, err);
      }
    }
  }
};
export { commands, bot, Plugins };
