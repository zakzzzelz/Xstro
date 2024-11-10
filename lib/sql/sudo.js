import { DataTypes } from 'sequelize';
import config from '../../config.js';
const { DATABASE } = config;

const SudoDB = DATABASE.define(
	'Sudo',
	{
		userId: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
	},
	{
		tableName: 'sudo',
		timestamps: false,
	},
);

const addSudo = async userId => {
	const [sudo, created] = await SudoDB.findOrCreate({
		where: { userId },
		defaults: { userId },
	});
	return created ? '_Sudo added_' : '_User already sudo_';
};

const delSudo = async userId => {
	const deleted = await SudoDB.destroy({
		where: { userId },
	});
	return deleted > 0 ? '_User deleted from sudo_' : '_User was not sudo_';
};

const getSudo = async () => {
	const sudoUsers = await SudoDB.findAll({
		attributes: ['userId'],
	});
	return sudoUsers.length > 0 ? sudoUsers.map(user => `${user.userId}`).join('\n') : '_No Sudo Numbers_';
};

const isSudo = async userId => {
	const sudo = await SudoDB.findOne({
		where: { userId },
	});
	return sudo !== null;
};

export { SudoDB, addSudo, delSudo, getSudo, isSudo };
