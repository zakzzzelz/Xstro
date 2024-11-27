import { getMuteStatus, setMute, setUnMute } from "../sql/scheduler.js";

const CHECK_INTERVAL = 60 * 1000;
const NOTIFICATION_THRESHOLD = 30 * 1000;

export async function handleScheduler(msg, conn) {
    if (!msg.from.endsWith('@g.us')) return;

    const groupJid = msg.from;
    const groupMetadata = await conn.groupMetadata(groupJid);
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);

    if (!isBotAdmin) {
        await conn.sendMessage(groupJid, { text: 'I need to be an admin to manage group settings.' });
        return;
    }

    setInterval(async () => {
        try {
            console.log(`Checking mute status for group: ${groupJid}`);
            const muteStatus = await getMuteStatus(groupJid);
            if (!muteStatus) return;

            const { muteStart, muteEnd, isMuted } = muteStatus;
            const currentTime = new Date().getTime();
            const muteStartTime = new Date(muteStart).getTime();
            const muteEndTime = new Date(muteEnd).getTime();

            console.log(`Current time: ${new Date(currentTime).toISOString()}`);
            console.log(`Mute start: ${new Date(muteStartTime).toISOString()}`);
            console.log(`Mute end: ${new Date(muteEndTime).toISOString()}`);
            console.log(`Is currently muted: ${isMuted}`);

            if (!isMuted && currentTime >= muteStartTime - NOTIFICATION_THRESHOLD && currentTime < muteStartTime) {
                console.log('Sending mute warning');
                await conn.sendMessage(groupJid, { text: 'Group will be muted in 30 seconds.' });
            } else if (!isMuted && currentTime >= muteStartTime) {
                const muteDurationInSeconds = Math.floor((muteEndTime - currentTime) / 1000);
                console.log(`Muting group for ${muteDurationInSeconds} seconds`);
                await setMute(groupJid, muteDurationInSeconds);
                await conn.groupSettingUpdate(groupJid, 'announcement');
                await conn.sendMessage(groupJid, { text: 'The group has been muted.' });
            }

            if (isMuted && currentTime >= muteEndTime - NOTIFICATION_THRESHOLD && currentTime < muteEndTime) {
                console.log('Sending unmute warning');
                await conn.sendMessage(groupJid, { text: 'Group will be unmuted in 30 seconds.' });
            } else if (isMuted && currentTime >= muteEndTime) {
                console.log('Unmuting group');
                await setUnMute(groupJid);
                await conn.groupSettingUpdate(groupJid, 'not_announcement');
                await conn.sendMessage(groupJid, { text: 'The group has been unmuted.' });
            }

        } catch (error) {
            console.error('Error in handleScheduler:', error);
        }
    }, CHECK_INTERVAL);
}