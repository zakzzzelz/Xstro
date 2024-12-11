import { bot } from '../lib/cmds.js';
import { delay } from 'baileys';
import { numtoId } from '../lib/utils.js';
import { isSudo } from '../sql/sudo.js';

bot(
	{
		pattern: 'add',
		isPublic: false,
		isGroup: true,
		desc: 'Adds A User to Group',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const jid = await message.thatJid(match);
		try {
			await message.client.groupParticipantsUpdate(message.jid, [jid], 'add');
			return message.send(`_@${jid.split('@')[0]} added_`, { mentions: [jid] });
		} catch {
			const inviteLink = await message.client.groupInviteCode(message.jid);
			const userMessage = {
				text: `_@${message.sender.split('@')[0]} wants to add you to the group._\n\n*_Join here: https://chat.whatsapp.com/${inviteLink}_*\n`,
				mentions: [message.sender],
			};
			await message.send(jid, userMessage);
			return message.send("_Can't Added User, Invite Sent In DM_");
		}
	},
);

bot(
	{
		pattern: 'advertise',
		isPublic: false,
		isGroup: true,
		desc: 'Create and Share Advertisement Messages to all Your Groups',
		type: 'group',
	},
	async (message, match) => {
		const adMsg = match || message.reply_message?.text;
		if (!adMsg) return message.send('_I need text to advertise!_');
		const groups = await message.client.groupFetchAllParticipating();
		const groupDetails = Object.values(groups);
		const groupIds = groupDetails.map(group => group.id);
		await message.send(`_Broadcasting to ${groupIds.length} groups. Estimated completion in ${groupIds.length * 1.5} seconds_`);
		const broadcastMessage = `\`\`\`*Broadcast*\n\n*Message:*\`\`\`` + adMsg;
		const messageOptions = {
			forwardingScore: 9999999,
			isForwarded: true,
		};
		for (const groupId of groupIds) {
			await delay(1500);
			await message.client.sendMessage(groupId, { text: broadcastMessage, contextInfo: messageOptions });
		}
		return await message.send(`_Advertised Message to ${groupIds.length} Groups_`);
	},
);

bot(
	{
		pattern: 'ckick',
		isPublic: false,
		isGroup: true,
		desc: 'Kick a certain country code from a group',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const countryCode = match?.trim().replace('+', '');
		if (!countryCode || isNaN(countryCode)) return message.send('_Please provide a valid country code._');
		const metadata = await message.client.groupMetadata(message.jid);
		const participants = metadata.participants;
		const toKick = participants.filter(participant => participant.id.startsWith(`${countryCode}`) && !participant.admin).map(participant => participant.id);
		if (!toKick.length) return message.send(`_No members found with the country code ${countryCode}._`);
		for (const jid of toKick) {
			await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
			await message.send(`_Kicked member:_ @${jid.split('@')[0]}`, { mentions: [jid] });
			await delay(2000);
		}
		await message.send(`_Kicked All Memeber from ${countryCode}._`);
	},
);

bot(
	{
		pattern: 'gname',
		isPublic: true,
		isGroup: true,
		desc: 'Change Group Name',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const subject = match || message.reply_message?.text;
		if (!subject) return message.send('_Provide A New Name for the Group!_');
		await message.client.groupUpdateSubject(message.jid, subject);
		return message.send('_Group Name Updated_');
	},
);

bot(
	{
		pattern: 'gdesc ?(.*)',
		isPublic: true,
		isGroup: true,
		desc: 'Changes Group Description',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const desciption = match || message.reply_message?.text;
		await message.client.groupUpdateDescription(message.jid, desciption);
		return message.send('_Group Description Updated_');
	},
);

bot(
	{
		pattern: 'promote',
		isPublic: true,
		isGroup: true,
		desc: 'Promotes Someone to Admin',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const jid = await message.thatJid(match);
		if (!jid) return message.send('_Reply, tag, or give me the participant number_');
		const groupMetadata = await message.client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (participant.admin)
			return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is already an admin._`, {
				mentions: [jid],
			});
		await message.client.groupParticipantsUpdate(message.jid, [jid], 'promote');
		return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is now an admin_`, {
			mentions: [jid],
		});
	},
);

bot(
	{
		pattern: 'demote',
		isPublic: true,
		isGroup: true,
		desc: 'Demotes Someone from Admin',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const jid = await message.thatJid(match);
		if (!jid) return message.send('_Reply, tag, or give me the participant number_');
		const groupMetadata = await message.client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (!participant.admin)
			return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is not an admin._`, {
				mentions: [jid],
			});
		await message.client.groupParticipantsUpdate(message.jid, [jid], 'demote');
		return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is no longer an admin_`, {
			mentions: [jid],
		});
	},
);

bot(
	{
		pattern: 'kick ?(.*)',
		isPublic: false,
		isGroup: true,
		desc: 'Kicks A Participant from Group',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const jid = await message.thatJid(match);
		if (!jid) return message.send('_Reply, tag, or give me the participant number_');
		await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
		return message.send(`_@${jid.split('@')[0]} has been kicked!_`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'invite',
		isPublic: true,
		isGroup: true,
		desc: 'Get Group Invite link',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const msg = await message.send('*wait*');
		const code = await message.client.groupInviteCode(message.jid);
		return msg.edit(`https://chat.whatsapp.com/${code}`);
	},
);

bot(
	{
		pattern: 'leave',
		isPublic: false,
		isGroup: true,
		desc: 'leave a group',
		type: 'group',
	},
	async message => {
		await message.send('_Left Group_');
		return message.client.groupParticipantsUpdate(message.jid, [message.user], 'remove');
	},
);

bot(
	{
		pattern: 'poll',
		isPublic: true,
		isGroup: true,
		desc: 'Creates a poll in the group.',
		type: 'group',
	},
	async (message, match) => {
		let [pollName, pollOptions] = match.split(';');
		if (!pollOptions) return await message.send(message.prefix + 'poll question;option1,option2,option3.....');
		let options = [];
		for (let option of pollOptions.split(',')) if (option && option.trim() !== '') options.push(option.trim());
		await message.client.sendMessage(message.jid, {
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
		isGroup: true,
		desc: 'Tag all participants in the group with an optional message',
		type: 'group',
	},
	async (message, match) => {
		const msg = match || message.reply_message?.text;
		const text = msg || '';
		const participants = await message.client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);
		let taggedMessage = text ? `*${text}*` : '';
		await message.client.sendMessage(message.jid, {
			text: taggedMessage,
			mentions: participantJids,
		});
	},
);

bot(
	{
		pattern: 'tagall',
		isPublic: true,
		isGroup: true,
		desc: 'Tag all participants in the group',
		type: 'group',
	},
	async (message, match) => {
		const msg = match || message.reply_message?.text;
		if (!msg) return message.send('_You must provide a reason for tagging everyone._');
		const participants = await message.client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);
		const tagMsg = `*Reason:* ${msg}\n\n` + participantJids.map(jid => `@${jid.split('@')[0]}`).join('\n');
		await message.client.sendMessage(message.jid, {
			text: tagMsg,
			mentions: participantJids,
		});
	},
);

bot(
	{
		pattern: 'mute',
		isPublic: true,
		isGroup: true,
		desc: 'Mute a group (admins only)',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const metadata = await message.client.groupMetadata(message.jid);
		if (metadata.announce) return message.send('_Group is already muted. Only admins can send messages._');
		await message.client.groupSettingUpdate(message.jid, 'announcement');
		await message.send('_Group has been muted. Only admins can send messages now._');
	},
);

bot(
	{
		pattern: 'unmute',
		isPublic: true,
		isGroup: true,
		desc: 'Unmute a group (admins only)',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const metadata = await message.client.groupMetadata(message.jid);
		if (!metadata.announce) return message.send('_Group is already unmuted. All members can send messages._');
		await message.client.groupSettingUpdate(message.jid, 'not_announcement');
		await message.send('_Group has been unmuted. All members can send messages now._');
	},
);

bot(
	{
		pattern: 'tagadmin',
		isPublic: false,
		isGroup: true,
		desc: 'Tags Admins of A Group',
		type: 'group',
	},
	async message => {
		const groupMetadata = await message.client.groupMetadata(message.jid);
		const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
		if (groupAdmins.length > 0) {
			const adminTags = groupAdmins.map(admin => `@${admin.split('@')[0]}`);
			const replyText = `*_Group Admins:_*\n ${adminTags.join('\n')}`;
			await message.send(replyText, { mentions: groupAdmins });
		} else {
			await message.send('_No admins found._');
		}
	},
);

bot(
	{
		pattern: 'revoke',
		isPublic: true,
		isGroup: true,
		desc: 'Revoke Invite link',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		await message.client.groupRevokeInvite(message.jid);
		return message.send('_Group Link Revoked!_');
	},
);

bot(
	{
		pattern: 'gpp',
		isPublic: false,
		isGroup: true,
		desc: 'Changes Group Profile Picture',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		if (!message.reply_message?.image) return message.send('_Reply An Image!_');
		const img = await message.download();
		await message.client.updateProfilePicture(message.jid, img);
		return await message.send('_Group Image Updated_');
	},
);

bot(
	{
		pattern: 'lock',
		isPublic: true,
		isGroup: true,
		desc: 'Lock groups settings',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const meta = await message.client.groupMetadata(message.jid);
		if (meta.restrict) return message.send('_Group is already locked to Admins._');
		await message.client.groupSettingUpdate(message.jid, 'locked');
		return message.send('_Group has been locked to Admins_');
	},
);

bot(
	{
		pattern: 'unlock',
		isPublic: true,
		isGroup: true,
		desc: 'Unlock groups settings',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const meta = await message.client.groupMetadata(message.jid);
		if (!meta.restrict) return message.send('_Group is already unlocked for participants._');
		await message.client.groupSettingUpdate(message.jid, 'unlocked');
		return message.send('_Group is now unlocked for participants._');
	},
);

bot(
	{
		pattern: 'requests',
		isPublic: true,
		isGroup: true,
		desc: 'Shows the pending requests of the group',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const joinRequests = await message.client.groupRequestParticipantsList(message.jid);
		if (!joinRequests || !joinRequests[0]) return await message.send('_No Join Requests_');
		let requestList = '*_Group Join Requets List_*\n\n';
		let requestJids = [];
		for (let request of joinRequests) {
			requestList += `@${request.jid.split('@')[0]}\n`;
			requestJids.push(request.jid);
		}
		await message.send(requestList, { mentions: requestJids });
	},
);

bot(
	{
		pattern: 'acceptall',
		isPublic: true,
		isGroup: true,
		desc: 'Accept all join requests',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');

		const joinRequests = await message.client.groupRequestParticipantsList(message.jid);
		if (!joinRequests || !joinRequests[0]) return await message.send('_No Requests Found!_');
		let acceptedUsers = [];
		let acceptanceList = '*_Accepted Users_*\n\n';
		for (let request of joinRequests) {
			await message.client.groupRequestParticipantsUpdate(message.jid, [request.jid], 'approve');
			acceptanceList += `@${request.jid.split('@')[0]}\n`;
			acceptedUsers.push(request.jid);
		}
		await message.send(acceptanceList, { mentions: acceptedUsers });
	},
);

bot(
	{
		pattern: 'rejectall',
		isPublic: true,
		isGroup: true,
		desc: 'Reject all join requests',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		const joinRequests = await message.client.groupRequestParticipantsList(message.jid);
		if (!joinRequests || !joinRequests[0]) return await message.send('_No Requests Found!_');
		let rejectedUsers = [];
		let rejectionList = '*_Rejected Users_*\n\n';
		for (let request of joinRequests) {
			await message.client.groupRequestParticipantsUpdate(message.jid, [request.jid], 'reject');
			rejectionList += `@${request.jid.split('@')[0]}\n`;
			rejectedUsers.push(request.jid);
		}
		await message.send(rejectionList, { mentions: rejectedUsers });
	},
);

bot(
	{
		pattern: 'rgpp',
		isPublic: false,
		isGroup: true,
		desc: 'Removes Group Profile Photo',
		type: 'group',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');
		await message.client.removeProfilePicture(message.jid);
		return await message.send('_Group Profile Photo Removed!_');
	},
);

bot(
	{
		pattern: 'newgc',
		isPublic: false,
		isGroup: true,
		desc: 'Creates A New Group',
		type: 'group',
	},
	async (message, match) => {
		if (!match) return await message.send(`*Provide group name: .newgc GroupName*`);

		let groupName = match.split(';')[0];
		let members = [message.sender];

		if (message.reply_message?.sender) members.push(message.reply_message.sender);
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
		await message.client.groupCreate(groupName, members);
		return await message.send(`_Group Created_`);
	},
);

//===============================================added on 10/12/2024 =============== 10:01pm  pk time============================
bot(
	{
		pattern: 'left',
		isPublic: false,
		isGroup: true,
		desc: 'Leaves the Group using bot....',
		type: 'group',
	},
	async (message, match) => {
		if (!(await isSudo(message.sender, message.user))) return message.send('```For My Owners Only!```');
		if (match.trim().toLowerCase() === 'sure' || match.trim().toLowerCase() === 'ok') {
			await message.send('```Leaving the group... Goodbye!```');
			return await message.client.groupLeave(message.jid);
		} else {
			return message.send('```Are you sure you want me to leave the group? Use "left sure" or "left ok" to confirm.```');
		}
	},
);
