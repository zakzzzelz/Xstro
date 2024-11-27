import { bot } from '../lib/handler.js';
import { getMuteStatus, setMute, setUnMute, delMute } from '../lib/sql/scheduler.js';
import { parseTime } from '../lib/utils.js';
import config from '../config.js';

const { TIME_ZONE } = config;

bot(
    {
        pattern: 'amute',
        isPublic: true,
        desc: 'SetUp Muting Schedule for Group',
        type: 'group'
    },
    async (message, match, m) => {
        if (!m.isGroup) return message.sendReply('_For groups only!_');
        if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
        if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
        const groupJid = message.jid;
        const timeString = match[1];

        if (!timeString) return message.sendReply(message, 'Please provide a valid time to mute the group.');

        const muteDurationInSeconds = parseTime(timeString);

        if (!muteDurationInSeconds) return message.sendReply(message, 'Invalid time format. Please use a valid time like "2:30pm" or "3:09am".');

        await setMute(groupJid, muteDurationInSeconds);
        return message.sendReply(message, `Group will be muted until ${new Date(Date.now() + muteDurationInSeconds * 1000).toLocaleString('en-US', { timeZone: TIME_ZONE })}.`);
    }
);

bot(
    {
        pattern: 'aunmute',
        isPublic: true,
        desc: 'Set Unmuting Schedule for Group',
        type: 'group'
    },
    async (message, match, m) => {
        if (!m.isGroup) return message.sendReply('_For groups only!_');
        if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
        if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
        const groupJid = message.jid;

        try {
            await setUnMute(groupJid);
            return message.sendReply(message, 'Group has been unmuted.');
        } catch (error) {
            console.error('Error unmuting group:', error);
            return message.sendReply(message, 'There was an error unmuting the group. Please try again later.');
        }
    }
);

bot(
    {
        pattern: 'delmute',
        isPublic: true,
        desc: 'Remove Muting Schedule for Group',
        type: 'group'
    },
    async (message, match) => {
        const groupJid = message.jid;
        await delMute(groupJid);
        return message.sendReply(message, 'Mute schedule has been removed for this group.');
    }
);

bot(
    {
        pattern: 'getmute',
        isPublic: true,
        desc: 'Get Muting Schedule for Group',
        type: 'group'
    },
    async (message, match) => {
        const groupJid = message.jid;
        const muteData = await getMuteStatus(groupJid);

        if (!muteData) return message.sendReply(message, 'This group is not currently muted or has no mute schedule.');

        const { muteStart, muteEnd } = muteData;
        const muteStartTimeFormatted = new Date(muteStart).toLocaleString('en-US', { timeZone: TIME_ZONE });
        const muteEndTimeFormatted = new Date(muteEnd).toLocaleString('en-US', { timeZone: TIME_ZONE });

        return message.sendReply(message, `This group is muted from ${muteStartTimeFormatted} to ${muteEndTimeFormatted}.`);
    }
);
