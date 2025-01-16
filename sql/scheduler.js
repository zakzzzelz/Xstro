import fs from 'fs';
import path from 'path';

const store = path.join('store', 'schedules.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readSchedules = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeSchedules = (schedules) => fs.writeFileSync(store, JSON.stringify(schedules, null, 2));

/**
 * Adds or updates a schedule for a group.
 * @param {string} groupId - The ID of the group.
 * @param {string} muteTime - The mute time for the group.
 * @param {string} unmuteTime - The unmute time for the group.
 * @param {boolean} isMuted - Whether the group is muted.
 * @param {boolean} isScheduled - Whether the schedule is active.
 * @returns {Promise<Object>} - The added or updated schedule.
 */
export async function addOrUpdateSchedule(
  groupId,
  muteTime,
  unmuteTime,
  isMuted = false,
  isScheduled = false
) {
  const schedules = readSchedules();
  let schedule = schedules.find((schedule) => schedule.groupId === groupId);

  if (schedule) {
    // Update existing schedule
    schedule.muteTime = muteTime;
    schedule.unmuteTime = unmuteTime;
    schedule.isMuted = isMuted;
    schedule.isScheduled = isScheduled;
  } else {
    // Add new schedule
    schedule = { groupId, muteTime, unmuteTime, isMuted, isScheduled };
    schedules.push(schedule);
  }

  writeSchedules(schedules);
  return schedule;
}

/**
 * Retrieves a schedule by groupId.
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<Object|null>} - The schedule for the group or null if not found.
 */
export async function getSchedule(groupId) {
  const schedules = readSchedules();
  return schedules.find((schedule) => schedule.groupId === groupId) || null;
}

/**
 * Removes a schedule by groupId.
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<boolean>} - Returns true if the schedule was removed, false otherwise.
 */
export async function removeSchedule(groupId) {
  const schedules = readSchedules();
  const index = schedules.findIndex((schedule) => schedule.groupId === groupId);

  if (index === -1) {
    return false;
  }

  schedules.splice(index, 1);
  writeSchedules(schedules);
  return true;
}

/**
 * Retrieves all schedules.
 * @returns {Promise<Array>} - An array of all schedules.
 */
export async function getAllSchedules() {
  return readSchedules();
}
