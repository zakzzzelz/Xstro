import { FiletypeFromUrl, parseJid, extractUrlFromMessage } from "./utils.js";

import { DATABASE } from "../config.js";
import { DataTypes } from "sequelize";

const GreetingsDB = DATABASE.define("Greetings", {
	chat: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	type: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	message: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	status: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
});

async function getMessage(jid = null, type = null) {
	const message = await GreetingsDB.findOne({
		where: {
			chat: jid,
			type,
		},
	});

	return message ? message.dataValues : false;
}

async function setMessage(jid = null, type = null, text = null) {
	const existingMessage = await GreetingsDB.findOne({
		where: {
			chat: jid,
			type,
		},
	});

	if (!existingMessage) {
		return await GreetingsDB.create({
			chat: jid,
			message: text,
			type,
			status: true,
		});
	} else {
		return await existingMessage.update({ chat: jid, message: text });
	}
}

async function toggleStatus(jid = null, type = null) {
	const existingMessage = await GreetingsDB.findOne({
		where: {
			chat: jid,
			type,
		},
	});

	if (!existingMessage) {
		return false;
	} else {
		const newStatus = !existingMessage.dataValues.status;
		return await existingMessage.update({ chat: jid, status: newStatus });
	}
}

async function delMessage(jid = null, type = null) {
	const existingMessage = await GreetingsDB.findOne({
		where: {
			chat: jid,
			type,
		},
	});

	if (existingMessage) {
		await existingMessage.destroy();
	}
}

async function getStatus(jid = null, type = null) {
	try {
		const existingMessage = await GreetingsDB.findOne({
			where: {
				chat: jid,
				type,
			},
		});

		return existingMessage ? existingMessage.dataValues.status : false;
	} catch {
		return false;
	}
}

async function Greetings(data, conn) {
	const metadata = await conn.groupMetadata(data.id);
	const participants = data.participants;

	for (const user of participants) {
		const userpp = await getUserProfilePicture(conn, user);

		switch (data.action) {
			case "add": {
				await handleGroupAction(conn, data.id, metadata, user, userpp, "welcome");
				break;
			}

			case "remove": {
				await handleGroupAction(conn, data.id, metadata, user, userpp, "goodbye");
				break;
			}
		}
	}
}

async function getUserProfilePicture(conn, user) {
	try {
		return await conn.profilePictureUrl(user, "image");
	} catch {
		return "https://getwallpapers.com/wallpaper/full/3/5/b/530467.jpg";
	}
}

async function handleGroupAction(conn, groupId, metadata, user, userpp, actionType) {
	const status = await getStatus(groupId, actionType);
	if (!status) return;

	const message = await getMessage(groupId, actionType);
	let msg = replaceMessagePlaceholders(message.message, user, metadata);

	const url = extractUrlFromMessage(msg);

	if (url) {
		const { type, buffer } = await FiletypeFromUrl(url);

		if (type === "image" || type === "video") {
			const caption = msg.replace(url, "").trim();

			conn.sendMessage(groupId, {
				[type]: buffer,
				caption,
				mentions: parseJid(msg),
			});
		} else {
			conn.sendMessage(groupId, { text: msg, mentions: parseJid(msg) });
		}
	} else {
		conn.sendMessage(groupId, { text: msg, mentions: parseJid(msg) });
	}
}

function replaceMessagePlaceholders(message, user, metadata) {
	return message
		.replace(/@user/gi, `@${user.split("@")[0]}`)
		.replace(/@gname/gi, metadata.subject)
		.replace(/@count/gi, metadata.participants.length);
}

export { Greetings, getMessage, setMessage, getStatus, toggleStatus, delMessage };
