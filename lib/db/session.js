import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';
import { profile, transformBuffer, logger } from '../utils/utils.js';

export default async function useSQLiteAuthState(sessionId) {
	const AuthStateModel = DATABASE.define(
		'AuthState',
		{
			session_id: { type: DataTypes.STRING, primaryKey: true },
			data_key: { type: DataTypes.STRING, primaryKey: true },
			data_value: DataTypes.TEXT,
		},
		{
			tableName: 'auth_state',
			timestamps: false,
		},
	);

	const writeData = async (key, data) => {
		const serialized = JSON.stringify(transformBuffer(data));
		await AuthStateModel.upsert({ session_id: sessionId, data_key: key, data_value: serialized });
	};

	const readData = async key => {
		const row = await AuthStateModel.findOne({ where: { session_id: sessionId, data_key: key } });
		return row?.data_value ? transformBuffer(JSON.parse(row.data_value), true) : null;
	};

	const creds = (await profile('readCreds', () => readData('auth_creds'))) || initAuthCreds();

	const state = {
		creds,
		keys: {
			get: async (type, ids) => {
				return profile('keys.get', async () => {
					const rows = await AuthStateModel.findAll({
						where: { session_id: sessionId, data_key: ids.map(id => `${type}-${id}`) },
					});
					return rows.reduce((data, row) => {
						const id = row.data_key.split('-')[1];
						let value = transformBuffer(JSON.parse(row.data_value), true);
						if (type === 'app-state-sync-key') value = proto.Message.AppStateSyncKeyData.fromObject(value);
						data[id] = value;
						return data;
					}, {});
				});
			},
			set: async data => {
				return profile('keys.set', async () => {
					const inserts = [];
					const deleteKeys = [];

					for (const [category, categoryData] of Object.entries(data)) {
						for (const [id, value] of Object.entries(categoryData || {})) {
							const key = `${category}-${id}`;
							if (value) {
								inserts.push({ session_id: sessionId, data_key: key, data_value: JSON.stringify(transformBuffer(value)) });
							} else {
								deleteKeys.push(key);
							}
						}
					}

					if (inserts.length) await AuthStateModel.bulkCreate(inserts, { updateOnDuplicate: ['data_value'] });
					if (deleteKeys.length) await AuthStateModel.destroy({ where: { session_id: sessionId, data_key: deleteKeys } });
				});
			},
		},
	};

	return {
		state,
		saveCreds: async () => profile('saveCreds', () => writeData('auth_creds', state.creds), logger),
		deleteSession: async () => profile('deleteSession', () => AuthStateModel.destroy({ where: { session_id: sessionId } }), logger),
	};
}

export { useSQLiteAuthState };
