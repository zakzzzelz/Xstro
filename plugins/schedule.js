import { bot } from '#lib';
import { schedule } from '#sql';

const convertTo24Hour = (timeStr) => {
  const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])(am|pm)$/i;
  const match = timeStr.toLowerCase().match(timeRegex);
  if (!match) return null;
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  if (period === 'pm' && hours !== 12) hours += 12;
  else if (period === 'am' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const convertTo12Hour = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  let period = 'AM';
  let hour = parseInt(hours);
  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;
  return `${hour}:${minutes}${period}`;
};

bot(
  {
    pattern: 'automute',
    public: true,
    isGroup: true,
    desc: 'Set a time to automatically mute a group',
    type: 'schedule',
  },
  async (message, match) => {
    if (!(await message.isUserAdmin())) return;
    if (!match)
      return message.send(`*Please provide time in 12hr format*\n\n_Example: .automute 3:15pm_`);
    const time24 = convertTo24Hour(match.trim());
    if (!time24) return message.send(`*Invalid time format*\n\n_Please use format like: 3:15pm_`);

    const scheduleEntry = await schedule.findOne({ where: { groupId: message.jid } });
    if (scheduleEntry) {
      scheduleEntry.muteTime = time24;
      scheduleEntry.isScheduled = true;
      await scheduleEntry.save();
      return message.send(`_Group will now be muted at ${match.trim()}_`);
    } else {
      await schedule.create({
        groupId: message.jid,
        muteTime: time24,
        isScheduled: true,
      });
      return message.send(`_Group will be muted at ${match.trim()}_`);
    }
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
    if (!(await message.isUserAdmin())) return;
    if (!match)
      return message.send(`*Invalid time in 12hr format*\n\n_Example: .autounmute 2:00am_`);
    const time24 = convertTo24Hour(match.trim());
    if (!time24) return message.send(`*Invalid time format*\n\n_Please use format like: 2:00am_`);

    const scheduleEntry = await schedule.findOne({ where: { groupId: message.jid } });
    if (scheduleEntry) {
      scheduleEntry.unmuteTime = time24;
      scheduleEntry.isScheduled = true;
      await scheduleEntry.save();
      return message.send(`_Group will now be unmuted at ${match.trim()}_`);
    } else {
      await schedule.create({
        groupId: message.jid,
        unmuteTime: time24,
        isScheduled: true,
      });
      return message.send(`_Group will be unmuted at ${match.trim()}_`);
    }
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
    const scheduleEntry = await schedule.findOne({
      where: { groupId: message.jid },
    });
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
    if (!message.isAdmin) return message.send('```You are not an Admin```');
    if (!message.isBotAdmin) return message.send('```I am not an Admin```');

    const scheduleEntry = await schedule.findOne({
      where: { groupId: message.jid },
    });
    if (!scheduleEntry || !scheduleEntry.isScheduled) return message.send('_No Jobs Where Online_');

    scheduleEntry.isScheduled = false;
    scheduleEntry.isMuted = false;
    await scheduleEntry.save();
    return message.send('_Mute Settings Removed_');
  }
);
