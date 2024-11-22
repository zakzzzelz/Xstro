import { bot } from '../lib/handler.js';
import { delay } from 'baileys';
import { fancy } from './client/font.js';
import { numtoId } from '../lib/utils.js';
import { Antilink } from '../lib/sql/antilink.js';
import { AntiWord } from '../lib/sql/antiword.js';
import { setAnti } from '../lib/sql/antidel.js';

bot(
	{
		pattern: 'add',
		isPublic: false,
		desc: 'Adds A User to Group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');

		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');
		try {
			await client.groupParticipantsUpdate(message.jid, [jid], 'add');
			return message.sendReply(`_@${jid.split('@')[0]} added_`, { mentions: [jid] });
		} catch (error) {
			const inviteLink = await client.groupInviteCode(message.jid);
			const userMessage = {
				text: `_@${message.sender.split('@')[0]} wants to add you to the group._\n\n*_Join here: https://chat.whatsapp.com/${inviteLink}_*\n`,
				mentions: [message.sender],
			};
			await message.sendReply(jid, userMessage);
			return message.sendReply("_Can't Added User, Invite Sent In DM_");
		}
	},
);

bot(
	{
		pattern: 'advertise',
		isPublic: false,
		desc: 'Create and Share Advertisement Messages to all Your Groups',
		type: 'group',
	},
	async (message, match, m, client) => {
		const adMsg = match || message.quoted?.text;
		if (!adMsg) return message.sendReply('_I need text to advertise!_');
		const groups = await client.groupFetchAllParticipating();
		const groupDetails = Object.values(groups);
		const groupIds = groupDetails.map(group => group.id);
		await message.sendReply(`_Broadcasting to ${groupIds.length} groups. Estimated completion in ${groupIds.length * 1.5} seconds_`);
		const broadcastMessage = fancy(`*Broadcast*\n\n*Message:* `) + adMsg;
		const messageOptions = {
			forwardingScore: 9999999,
			isForwarded: true,
		};
		for (const groupId of groupIds) {
			await delay(1500);
			await client.sendMessage(groupId, { text: broadcastMessage, contextInfo: messageOptions });
		}
		return await message.sendReply(`_Advertised Message to ${groupIds.length} Groups_`);
	},
);

bot(
	{
		pattern: 'antilink ?(.*)',
		isPublic: true,
		desc: 'Setup Antilink For Groups',
		type: 'Group',
	},
	async (message, match, m) => {
		if (!message.isGroup) return message.sendReply('_For Groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');

		const [settings] = await Antilink.findOrCreate({
			where: { groupId: message.jid },
			defaults: { groupId: message.jid, warnings: {} },
		});

		const cmd = match.trim().toLowerCase();
		const validActions = ['delete', 'warn', 'kick'];

		if (['on', 'off'].includes(cmd)) {
			const newState = cmd === 'on';
			if (settings.enabled === newState) return message.sendReply(`_Antilink is already ${cmd}_`);
			settings.enabled = newState;
			await settings.save();
			return message.sendReply(`_Antilink ${cmd === 'on' ? 'enabled' : 'disabled'}!_`);
		}

		if (validActions.includes(cmd)) {
			if (!settings.enabled) return message.sendReply('_Enable antilink first using antilink on_');
			if (settings.action === cmd) return message.sendReply(`_Antilink action is already set to ${cmd}_`);
			settings.action = cmd;
			await settings.save();
			return message.sendReply(`_Antilink action set to ${cmd}_`);
		}
		return message.sendReply('_' + message.prefix + 'antilink on/off/delete/kick/warn_');
	},
);

bot(
	{
		pattern: 'antiword',
		isPublic: true,
		desc: 'Setup Antiword for Groups',
		type: 'group',
	},
	async (message, match, m) => {
		if (!message.isGroup) return message.sendReply('_For Groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');

		const groupId = message.jid;
		const antiWordConfig = await AntiWord.findOrCreate({ where: { groupId } });

		if (!match) return message.sendReply(`_${message.prefix}antiword on_\n_${message.prefix}antiword off_\n_${message.prefix}antiword set badword1,badword2_`);

		if (match === 'on') {
			if (antiWordConfig[0].isEnabled) return message.sendReply('_Antiword is already enabled for this group._');
			antiWordConfig[0].isEnabled = true;
			await antiWordConfig[0].save();
			const words = antiWordConfig[0].filterWords;
			return message.sendReply(words.length > 0 ? '_Antiword has been enabled for this group._' : '_Antiword is enabled but no bad words were set._');
		}

		if (match === 'off') {
			if (!antiWordConfig[0].isEnabled) return message.sendReply('_Antiword is already disabled for this group._');
			antiWordConfig[0].isEnabled = false;
			await antiWordConfig[0].save();
			return message.sendReply('_Antiword has been disabled for this group._');
		}

		if (match.startsWith('set ')) {
			const words = match
				.slice(4)
				.split(',')
				.map(word => word.trim());
			antiWordConfig[0].filterWords = words;
			await antiWordConfig[0].save();
			return message.sendReply(`_Antiword filter updated with words: ${words.join(', ')}_`);
		}

		return message.sendReply(`_${message.prefix}antiword on_\n_${message.prefix}antiword off_\n_${message.prefix}antiword set badword1,badword2_`);
	},
);

bot(
	{
		pattern: 'ckick',
		isPublic: false,
		desc: 'Kick a certain country code from a group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const countryCode = match?.trim().replace('+', '');
		if (!countryCode || isNaN(countryCode)) return message.sendReply('_Please provide a valid country code._');
		const metadata = await client.groupMetadata(m.from);
		const participants = metadata.participants;
		const toKick = participants.filter(participant => participant.id.startsWith(`${countryCode}`) && !participant.admin).map(participant => participant.id);
		if (!toKick.length) return message.sendReply(`_No members found with the country code ${countryCode}._`);
		for (const jid of toKick) {
			await client.groupParticipantsUpdate(m.from, [jid], 'remove');
			await message.sendReply(`_Kicked member:_ @${jid.split('@')[0]}`, { mentions: [jid] });
			await delay(2000);
		}
		await message.sendReply(`_Kicked All Memeber from ${countryCode}._`);
	},
);

bot(
	{
		pattern: 'gname',
		isPublic: true,
		desc: 'Change Group Name',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!message.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const subject = match || message.quoted?.text;
		if (!subject) return message.sendReply('_Provide A New Name for the Group!_');
		await client.groupUpdateSubject(message.jid, subject);
		return message.sendReply('_Group Name Updated_');
	},
);

bot(
	{
		pattern: 'gdesc ?(.*)',
		isPublic: true,
		desc: 'Changes Group Description',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!message.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const desciption = match || message.quoted?.text;
		await client.groupUpdateDescription(message.jid, desciption);
		return message.sendReply('_Group Description Updated_');
	},
);

bot(
	{
		pattern: 'promote',
		isPublic: true,
		desc: 'Promotes Someone to Admin',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');
		const groupMetadata = await client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (participant.admin) return message.sendReply(`_@${jid.replace('@s.whatsapp.net', '')} is already an admin._`, { mentions: [jid] });
		await client.groupParticipantsUpdate(message.jid, [jid], 'promote');
		return message.sendReply(`_@${jid.replace('@s.whatsapp.net', '')} is now an admin_`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'demote',
		isPublic: true,
		desc: 'Demotes Someone from Admin',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');
		const groupMetadata = await client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (!participant.admin) return message.sendReply(`_@${jid.replace('@s.whatsapp.net', '')} is not an admin._`, { mentions: [jid] });
		await client.groupParticipantsUpdate(message.jid, [jid], 'demote');
		return message.sendReply(`_@${jid.replace('@s.whatsapp.net', '')} is no longer an admin_`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'kick ?(.*)',
		isPublic: false,
		desc: 'Kicks A Participant from Group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');
		await client.groupParticipantsUpdate(message.jid, [jid], 'remove');
		return message.sendReply(`_@${jid.split('@')[0]} has been kicked!_`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'invite',
		isPublic: true,
		desc: 'Get Group Invite link',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const code = await client.groupInviteCode(message.jid);
		return message.sendReply(`*_Invite Link: https://chat.whatsapp.com/${code}_*`);
	},
);

bot(
	{
		pattern: 'leave',
		isPublic: false,
		desc: 'leave a group',
		type: 'group',
	},
	async message => {
		await message.sendReply('_Left Group_');
		return message.client.groupParticipantsUpdate(message.jid, [message.user], 'remove');
	},
);

bot(
	{
		pattern: 'poll',
		isPublic: true,
		desc: 'Creates a poll in the group.',
		type: 'group',
	},
	async (message, match, m, client) => {
		let [pollName, pollOptions] = match.split(';');
		if (!pollOptions) return await message.sendReply(message.prefix + 'poll question;option1,option2,option3.....');
		let options = [];
		for (let option of pollOptions.split(',')) if (option && option.trim() !== '') options.push(option.trim());
		await client.sendMessage(m.from, {
			poll: {
				name: pollName,
				values: options,
			},
		});
	},
);

bot(
	{
		pattern: 'tag',
		isPublic: true,
		desc: 'Tag all participants in the group with an optional message',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		const msg = match || message.quoted?.text;
		const text = msg || '';
		const participants = await client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);
		let taggedMessage = text ? `*${text}*` : '';
		await client.sendMessage(message.jid, {
			text: taggedMessage,
			mentions: participantJids,
		});
	},
);

bot(
	{
		pattern: 'tagall',
		isPublic: true,
		desc: 'Tag all participants in the group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		const msg = match || message.quoted?.text;
		if (!msg) return message.sendReply('_You must provide a reason for tagging everyone._');
		const participants = await client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);
		const tagMsg = `*Reason:* ${msg}\n\n` + participantJids.map(jid => `@${jid.split('@')[0]}`).join('\n');
		await client.sendMessage(message.jid, {
			text: tagMsg,
			mentions: participantJids,
		});
	},
);

bot(
	{
		pattern: 'mute',
		isPublic: true,
		desc: 'Mute a group (admins only)',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const metadata = await client.groupMetadata(m.from);
		if (metadata.announce) return message.sendReply('_Group is already muted. Only admins can send messages._');
		await client.groupSettingUpdate(m.from, 'announcement');
		await message.sendReply('_Group has been muted. Only admins can send messages now._');
	},
);

bot(
	{
		pattern: 'unmute',
		isPublic: true,
		desc: 'Unmute a group (admins only)',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const metadata = await client.groupMetadata(m.from);
		if (!metadata.announce) return message.sendReply('_Group is already unmuted. All members can send messages._');
		await client.groupSettingUpdate(m.from, 'not_announcement');
		await message.sendReply('_Group has been unmuted. All members can send messages now._');
	},
);

bot(
	{
		pattern: 'tagadmin',
		isPublic: false,
		desc: 'Tags Admins of A Group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		const groupMetadata = await client.groupMetadata(message.jid);
		const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
		if (groupAdmins.length > 0) {
			const adminTags = groupAdmins.map(admin => `@${admin.split('@')[0]}`);
			const replyText = `*_Group Admins:_*\n ${adminTags.join('\n')}`;
			await message.sendReply(replyText, { mentions: groupAdmins });
		} else {
			await message.sendReply('_No admins found._');
		}
	},
);

bot(
	{
		pattern: 'revoke',
		isPublic: true,
		desc: 'Revoke Invite link',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		await client.groupRevokeInvite(message.jid);
		return message.sendReply('_Group Link Revoked!_');
	},
);

bot(
	{
		pattern: 'gpp',
		isPublic: false,
		desc: 'Changes Group Profile Picture',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		if (!message.quoted?.image) return message.sendReply('_Reply An Image!_');
		const img = await message.download();
		await client.updateProfilePicture(m.from, img);
		return await message.sendReply('_Group Image Updated_');
	},
);

bot(
	{
		pattern: 'lock',
		isPublic: true,
		desc: 'Lock groups settings',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const meta = await client.groupMetadata(m.from);
		if (meta.restrict) return message.sendReply('_Group is already locked to Admins._');
		await client.groupSettingUpdate(m.from, 'locked');
		return message.sendReply('_Group has been locked to Admins_');
	},
);

bot(
	{
		pattern: 'unlock',
		isPublic: true,
		desc: 'Unlock groups settings',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const meta = await client.groupMetadata(m.from);
		if (!meta.restrict) return message.sendReply('_Group is already unlocked for participants._');
		await client.groupSettingUpdate(m.from, 'unlocked');
		return message.sendReply('_Group is now unlocked for participants._');
	},
);

bot(
	{
		pattern: 'requests',
		isPublic: true,
		desc: 'Shows the pending requests of the group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const joinRequests = await client.groupRequestParticipantsList(m.from);
		if (!joinRequests || !joinRequests[0]) return await message.reply('_No Join Requests_');
		let requestList = '*_Group Join Requets List_*\n\n';
		let requestJids = [];
		for (let request of joinRequests) {
			requestList += `@${request.jid.split('@')[0]}\n`;
			requestJids.push(request.jid);
		}
		await message.sendReply(requestList, { mentions: requestJids });
	},
);

bot(
	{
		pattern: 'acceptall',
		isPublic: true,
		desc: 'Accept all join requests',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');

		const joinRequests = await client.groupRequestParticipantsList(m.from);
		if (!joinRequests || !joinRequests[0]) return await message.sendReply('_No Requests Found!_');
		let acceptedUsers = [];
		let acceptanceList = '*_Accepted Users_*\n\n';
		for (let request of joinRequests) {
			try {
				await client.groupRequestParticipantsUpdate(m.from, [request.jid], 'approve');
				acceptanceList += `@${request.jid.split('@')[0]}\n`;
				acceptedUsers.push(request.jid);
			} catch {}
		}
		await message.sendReply(acceptanceList, { mentions: acceptedUsers });
	},
);

bot(
	{
		pattern: 'rejectall',
		isPublic: true,
		desc: 'Reject all join requests',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		const joinRequests = await client.groupRequestParticipantsList(m.from);
		if (!joinRequests || !joinRequests[0]) return await message.sendReply('_No Requests Found!_');
		let rejectedUsers = [];
		let rejectionList = '*_Rejected Users_*\n\n';
		for (let request of joinRequests) {
			try {
				await client.groupRequestParticipantsUpdate(m.from, [request.jid], 'reject');
				rejectionList += `@${request.jid.split('@')[0]}\n`;
				rejectedUsers.push(request.jid);
			} catch {}
		}
		await message.sendReply(rejectionList, { mentions: rejectedUsers });
	},
);

bot(
	{
		pattern: 'rgpp',
		isPublic: false,
		desc: 'Removes Group Profile Photo',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin) return message.sendReply('_For Admins Only!_');
		if (!m.isBotAdmin) return message.sendReply('_I need to be Admin_');
		await client.removeProfilePicture(m.from);
		return await message.sendReply('_Group Profile Photo Removed!_');
	},
);

bot(
	{
		pattern: 'antidelete',
		isPublic: false,
		desc: 'Configure AntiDelete',
		type: 'group',
	},
	async (message, match, m, { prefix, pushName }) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!match) return message.sendReply(`_${pushName} Wrong Usage!_\n${prefix}antidel on | off`);

		const chatId = m.from;
		const status = match.toLowerCase() === 'on';

		const setStatus = await setAnti(chatId, status);
		if (setStatus) {
			return message.sendReply(`_Anti-delete has been turned ${status ? 'on' : 'off'}._`);
		} else {
			return message.sendReply('_Failed to update anti-delete status. Please try again._');
		}
	},
);

bot(
	{
		pattern: 'newgc',
		isPublic: false,
		desc: 'Creates A New Group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!match) return await message.sendReply(`*Provide group name: .newgc GroupName*`);

		let groupName = match.split(';')[0];
		let members = [message.sender];

		if (message.quoted?.sender) members.push(message.quoted.sender);
		if (message.mention && message.mention[0]) members.push(message.mention[0]);
		if (match.split(';')[1]) {
			let additionalMembers = match
				.split(';')[1]
				.split(',')
				.map(member => member.trim());
			const ids = additionalMembers.map(member => numtoId(member));
			members = [...members, ...ids];
		}
		members = [...new Set(members)];
		await client.groupCreate(groupName, members);
		return await message.sendReply(`_Group Created_`);
	},
);
