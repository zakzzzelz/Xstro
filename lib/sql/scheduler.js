import { DataTypes } from 'sequelize';
import config from '../../config.js';

const ScheduleDB = config.DATABASE.define('Schedules', {
    groupJid: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    muteStart: {
        type: DataTypes.DATE,
    },
    muteEnd: {
        type: DataTypes.DATE,
    },
    isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

/**
 * Set Mute Schedule for the Group
 * @param {string} groupJid - The JID of the group
 * @param {number} muteDurationInSeconds - Duration in seconds for the mute
 */
export const setMute = async (groupJid, muteDurationInSeconds) => {
    const muteEndTime = new Date(Date.now() + muteDurationInSeconds * 1000);
    try {
        await ScheduleDB.upsert({
            groupJid,
            muteStart: new Date(),
            muteEnd: muteEndTime,
            isMuted: true,
        });
    } catch (error) {
        console.error('Error setting mute schedule:', error);
        throw new Error('Failed to set mute schedule');
    }
};

/**
 * Set Unmute Schedule for the Group (Unmute)
 * @param {string} groupJid - The JID of the group
 */
export const setUnMute = async (groupJid) => {
    try {
        await ScheduleDB.update(
            { isMuted: false, muteEnd: new Date() },
            { where: { groupJid } }
        );
    } catch (error) {
        console.error('Error unmuting group:', error);
        throw new Error('Failed to set unmute schedule');
    }
};

/**
 * Get Mute Status for the Group
 * @param {string} groupJid - The JID of the group
 * @returns {Object|null} - Mute status with start and end time if muted, otherwise null
 */
export const getMuteStatus = async (groupJid) => {
    try {
        const muteData = await ScheduleDB.findOne({ where: { groupJid } });
        if (muteData && muteData.isMuted) {
            return {
                muteStart: muteData.muteStart,
                muteEnd: muteData.muteEnd,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching mute status:', error);
        throw new Error('Failed to fetch mute status');
    }
};

/**
 * Delete Mute Schedule for the Group
 * @param {string} groupJid - The JID of the group
 */
export const delMute = async (groupJid) => {
    try {
        await ScheduleDB.destroy({ where: { groupJid } });
    } catch (error) {
        console.error('Error deleting mute schedule:', error);
        throw new Error('Failed to delete mute schedule');
    }
};
