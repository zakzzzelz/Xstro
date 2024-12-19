import { DataTypes } from 'sequelize';
import config from '#config';
import { runtime } from '#lib/utils';
import DATABASE from '#lib/database';
import { placeholderService } from './autobio.js';

const AliveDB = DATABASE.define(
	'AliveDB',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'alive',
		timestamps: false,
	},
);

const getAliveMsg = async () => {
	const msg = await AliveDB.findOne();
	return msg?.message || `@user ${config.BOT_INFO.split(';')[1]} is alive`;
};

const setAliveMsg = async text => {
	await AliveDB.destroy({ where: {} });
	await AliveDB.create({ message: text });
	return true;
};

const aliveMessage = async message => {
	const msg = await getAliveMsg();

	return msg
		.replace(/&runtime/g, runtime(process.uptime()))
		.replace(/&user/g, message.pushName || 'user')
		.replace(/@user/g, `@${message.sender.split('@')[0]}`)
		.replace(/&quotes/g, await placeholderService.quotes())
		.replace(/&facts/g, await placeholderService.facts())
		.replace(/&owner/g, config.BOT_INFO.split(';')[0])
		.replace(/&botname/g, config.BOT_INFO.split(';')[1]);
};

export { getAliveMsg, setAliveMsg, aliveMessage };
