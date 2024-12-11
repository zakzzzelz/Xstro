import config from '../config.js';
import Scheduler from '../sql/scheduler.js';

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
		const hour = parts.find(part => part.type === 'hour').value;
		const minute = parts.find(part => part.type === 'minute').value;
		return `${hour}:${minute}`;
	} catch (error) {
		throw new Error(`Invalid timezone: ${timezone}. Error: ${error.message}`);
	}
};

export const schedules = async client => {
	setInterval(async () => {
		const currentTime = getCurrentTime();

		const schedules = await Scheduler.findAll({
			where: { isScheduled: true },
		});

		for (const schedule of schedules) {
			if (schedule.muteTime === currentTime && !schedule.isMuted) {
				await client.groupSettingUpdate(schedule.groupId, 'announcement');
				schedule.isMuted = true;
				await schedule.save();
				await client.sendMessage(schedule.groupId, { text: config.MUTE_MSG });
			}
			if (schedule.unmuteTime === currentTime && schedule.isMuted) {
				await client.groupSettingUpdate(schedule.groupId, 'not_announcement');
				schedule.isMuted = false;
				await schedule.save();
				await client.sendMessage(schedule.groupId, { text: config.UN_MUTE_MSG });
			}
		}
	}, 60000);
};
