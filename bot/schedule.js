import { config } from '#config';
import { getAllSchedules, addOrUpdateSchedule } from '../Sqll';

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
    try {
      const currentTime = getCurrentTime();
      const schedules = await getAllSchedules();

      for (const schedule of schedules) {
        if (!schedule.isScheduled) continue;

        if (schedule.muteTime === currentTime && schedule.isMuted) {
          try {
            await client.groupSettingUpdate(schedule.groupId, 'announcement');
            await addOrUpdateSchedule(
              schedule.groupId,
              schedule.muteTime,
              schedule.unmuteTime,
              false,
              schedule.isScheduled
            );

            await client.sendMessage(schedule.groupId, {
              text: 'Group has been muted, due to AutoMute',
            });
          } catch (error) {
            console.error(`Failed to mute group ${schedule.groupId}:`, error);
          }
        }

        // Handle unmuting
        if (schedule.unmuteTime === currentTime && !schedule.isMuted) {
          try {
            await client.groupSettingUpdate(schedule.groupId, 'not_announcement');
            await addOrUpdateSchedule(
              schedule.groupId,
              schedule.muteTime,
              schedule.unmuteTime,
              true,
              schedule.isScheduled
            );

            await client.sendMessage(schedule.groupId, {
              text: 'Group is now unmuted, due to AutoUnMute',
            });
          } catch (error) {
            console.error(`Failed to unmute group ${schedule.groupId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in schedule handler:', error);
    }
  }, 10000);
};
