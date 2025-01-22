import { bot } from '#lib';
import { addOrUpdateSchedule, getSchedule, removeSchedule } from '#sql';
import { convertTo12Hour, convertTo24Hour } from '#utils';

bot(
  {
    pattern: 'automute',
    public: true,
    isGroup: true,
    desc: 'Set a time to automatically mute a group',
    type: 'schedule',
  },
  async (message, match) => {
    if (!(await message.getAdmin())) return;
    if (!match)
      return message.send(`*Please provide time in 12hr format*\n\n_Example: .automute 3:15pm_`);

    const time24 = convertTo24Hour(match.trim());
    if (!time24) return message.send(`*Invalid time format*\n\n_Please use format like: 3:15pm_`);

    const currentSchedule = await getSchedule(message.jid);
    const updatedSchedule = await addOrUpdateSchedule(
      message.jid,
      time24,
      currentSchedule?.unmuteTime || null,
      currentSchedule?.isMuted || false,
      true
    );
    if (updatedSchedule) return message.send(`_Group will be muted at ${match.trim()}_`);
  }
);

bot(
  {
    pattern: 'autounmute',
    public: true,
    isGroup: true,
    desc: 'Set a time to automatically unmute a group',
    type: 'schedule',
  },
  async (message, match) => {
    if (!(await message.getAdmin())) return;
    if (!match)
      return message.send(`*Invalid time in 12hr format*\n\n_Example: .autounmute 2:00am_`);

    const time24 = convertTo24Hour(match.trim());
    if (!time24) return message.send(`*Invalid time format*\n\n_Please use format like: 2:00am_`);

    const currentSchedule = await getSchedule(message.jid);
    const updatedSchedule = await addOrUpdateSchedule(
      message.jid,
      currentSchedule?.muteTime || null,
      time24,
      currentSchedule?.isMuted || false,
      true
    );

    if (updatedSchedule) return message.send(`_Group will be unmuted at ${match.trim()}_`);
  }
);

bot(
  {
    pattern: 'getmute',
    public: true,
    isGroup: true,
    desc: 'Get muting time for a group',
    type: 'schedule',
  },
  async (message) => {
    const scheduleEntry = await getSchedule(message.jid);
    if (!scheduleEntry || !scheduleEntry.isScheduled)
      return message.send('No active mute schedule for this group');

    let response = '*📅 Mute Schedules*\n\n';
    if (scheduleEntry.muteTime)
      response += `*🔇 Mute:* _${convertTo12Hour(scheduleEntry.muteTime)}_\n`;
    if (scheduleEntry.unmuteTime)
      response += `*🔊 Unmute:* _${convertTo12Hour(scheduleEntry.unmuteTime)}_\n`;
    response += `*Status:* _${scheduleEntry.isMuted ? '🔇 Muted' : '🔊 Unmuted'}_`;
    return message.send(response);
  }
);

bot(
  {
    pattern: 'delmute',
    public: true,
    isGroup: true,
    desc: 'Cancel mute schedule for the group',
    type: 'schedule',
  },
  async (message) => {
    if (!(await message.getAdmin())) return;
    const removed = await removeSchedule(message.jid);
    if (!removed) return message.send('_No Jobs Where Online_');

    return message.send('_Mute Settings Removed_');
  }
);
