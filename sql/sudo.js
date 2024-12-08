import { DataTypes } from 'sequelize';
import config from '../config.js';
import { jidNormalizedUser, areJidsSameUser } from 'baileys';
import { numtoId } from '../lib/utils.js';

const SudoDB = config.DATABASE.define(
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

const addSudo = async jid => {
	const [created] = await SudoDB.findOrCreate({
		where: { userId: jid },
		defaults: { userId: jid },
	});
	return created ? '_Sudo added_' : '_User already sudo_';
};

const delSudo = async jid => {
	const deleted = await SudoDB.destroy({
		where: { userId: jid },
	});
	return deleted > 0 ? '_User deleted from sudo_' : '_User was not sudo_';
};

const getSudo = async () => {
	const sudoUsers = await SudoDB.findAll({
		attributes: ['userId'],
	});
	return sudoUsers.length > 0 ? sudoUsers.map(user => `${user.userId}`).join('\n') : '_No Sudo Numbers_';
};

const isSudo = async (jid, owner) => {
	if (!jid) return false;
	if (owner && typeof owner !== 'string') owner = owner.toString();
	if (owner && typeof jid === 'string' && areJidsSameUser(jid, owner)) return true;
	const sudoUsers = (config.SUDO ?? '').split(';').map(id => numtoId(id.trim()));
	const uId = jidNormalizedUser(jid);
	if (sudoUsers.includes(uId)) return true;
	const allSudoUsers = await getSudo();
	return allSudoUsers.includes(uId);
};

export { SudoDB, addSudo, delSudo, getSudo, isSudo };
