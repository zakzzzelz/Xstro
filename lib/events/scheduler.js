import { schedule as _schedule } from 'node-cron';
import moment from 'moment-timezone';
import config from '../../config.js';
import Scheduler from '../sql/scheduler.js';

const getCurrentTime = () => {
  const timezone = config.TIME_ZONE;
  return moment().tz(timezone).format('HH:mm');
};

export const schedules = async (client) => {
  _schedule('* * * * *', async () => {
    const currentTime = getCurrentTime();

    const schedules = await Scheduler.findAll({
      where: { isScheduled: true },
    });

    for (const schedule of schedules) {
      if (schedule.muteTime === currentTime && !schedule.isMuted) {
        await client.groupSettingUpdate(schedule.groupId, 'announcement');
        schedule.isMuted = true;
        await schedule.save();
        await client.sendMessage(schedule.groupId, { text: '```🔇 Group is now Closed```' });
      }
      if (schedule.unmuteTime === currentTime && schedule.isMuted) {
        await client.groupSettingUpdate(schedule.groupId, 'not_announcement');
        schedule.isMuted = false;
        await schedule.save();
        await client.sendMessage(schedule.groupId, { text: '```🔊 Group is now Opened```' });
      }
    }
  });
};
