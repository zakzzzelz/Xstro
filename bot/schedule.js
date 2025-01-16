import { config } from '#config';
import { getAllSchedules } from '#sql';

const getCurrentTime = () => {
  const timezone = config.TIME_ZONE;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(new Date());
    const hour = parts.find((part) => part.type === 'hour').value;
    const minute = parts.find((part) => part.type === 'minute').value;
    return `${hour}:${minute}`;
  } catch (error) {
    throw new Error(`Invalid timezone: ${timezone}. Error: ${error.message}`);
  }
};

export const schedules = async (msg) => {
  const client = msg.client;
  setInterval(async () => {
    const currentTime = getCurrentTime();

    const schedules = await getAllSchedules();

    for (const scheduleItem of schedules) {
      if (scheduleItem.muteTime === currentTime && !scheduleItem.isMuted) {
        await client.groupSettingUpdate(scheduleItem.groupId, 'announcement');
        scheduleItem.isMuted = true;
        await scheduleItem.save();
        await client.sendMessage(scheduleItem.groupId, {
          text: '```Group has been muted, due to AutoMute```',
        });
      }
      if (scheduleItem.unmuteTime === currentTime && scheduleItem.isMuted) {
        await client.groupSettingUpdate(scheduleItem.groupId, 'not_announcement');
        scheduleItem.isMuted = false;
        await scheduleItem.save();
        await client.sendMessage(scheduleItem.groupId, {
          text: '```Group is now unmuted, due to AutoUnMute```',
        });
      }
    }
  }, 60000);
};
