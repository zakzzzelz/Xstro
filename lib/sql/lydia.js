import { DataTypes } from 'sequelize';
import config from '../../config.js';

export const ChatBot = config.DATABASE.define(
	'ChatBot',
	{
		chat: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		type: {
			type: DataTypes.ENUM('dm', 'gc', 'all'),
			defaultValue: 'all',
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: 'lydia',
		timestamps: false,
	},
);

export const upsertChatBot = async (chat, type, enabled) => {
	try {
		await ChatBot.upsert({ chat, type, enabled });
		console.log(`ChatBot configuration updated for ${chat}`);
	} catch (error) {
		console.error('Error while updating chatbot config:', error);
	}
};

export const isChatBotEnabled = async chat => {
	try {
		const chatbot = await ChatBot.findOne({
			where: { chat },
		});
		return chatbot ? chatbot.enabled : false; // returns false if not found
	} catch (error) {
		console.error('Error while checking if chatbot is enabled:', error);
		return false;
	}
};
