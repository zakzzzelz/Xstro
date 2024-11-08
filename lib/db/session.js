import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';
import * as baileys from 'baileys';
import { profile } from '../utils/utils.js';
const { initAuthCreds, proto } = baileys;

export default async function useSQLiteAuthState(sessionId) {
	const logger = logger;

	await DATABASE.query(`
    CREATE TABLE IF NOT EXISTS auth_state (
      session_id TEXT,
      data_key TEXT,
      data_value TEXT,
      PRIMARY KEY (session_id, data_key)
    );
    CREATE INDEX IF NOT EXISTS idx_session_key ON auth_state (session_id, data_key);
  `);

	const AuthStateModel = DATABASE.define(
		'AuthState',
		{
			session_id: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			data_key: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			data_value: DataTypes.TEXT,
		},
		{
			tableName: 'auth_state',
			timestamps: false,
		},
	);

	const writeData = async (key, data) => {
		const serialized = JSON.stringify(bufferToJSON(data));
		await AuthStateModel.upsert({ session_id: sessionId, data_key: key, data_value: serialized });
	};

	const readData = async key => {
		const row = await AuthStateModel.findOne({ where: { session_id: sessionId, data_key: key } });
		return row?.data_value ? jsonToBuffer(JSON.parse(row.data_value)) : null;
	};

	const creds = (await profile('readCreds', () => readData('auth_creds'), logger)) || initAuthCreds();

	const state = {
		creds,
		keys: {
			get: async (type, ids) => {
				return profile(
					'keys.get',
					async () => {
						const data = {};
						const rows = await AuthStateModel.findAll({
							where: {
								session_id: sessionId,
								data_key: ids.map(id => `${type}-${id}`),
							},
						});
						rows.forEach(row => {
							const id = row.data_key.split('-')[1];
							let value = jsonToBuffer(JSON.parse(row.data_value));
							if (type === 'app-state-sync-key') {
								value = proto.Message.AppStateSyncKeyData.fromObject(value);
							}
							data[id] = value;
						});
						return data;
					},
					logger,
				);
			},
			set: async data => {
				return profile(
					'keys.set',
					async () => {
						const instert = [];
						const deleteKeys = [];
						for (const [category, categoryData] of Object.entries(data)) {
							for (const [id, value] of Object.entries(categoryData || {})) {
								const key = `${category}-${id}`;
								if (value) {
									const serialized = JSON.stringify(bufferToJSON(value));
									instert.push({ session_id: sessionId, data_key: key, data_value: serialized });
								} else {
									deleteKeys.push(key);
								}
							}
						}

						if (instert.length) {
							await AuthStateModel.bulkCreate(instert, { updateOnDuplicate: ['data_value'] });
						}

						if (deleteKeys.length) {
							await AuthStateModel.destroy({
								where: {
									session_id: sessionId,
									data_key: deleteKeys,
								},
							});
						}
					},
					logger,
				);
			},
		},
	};

	return {
		state,
		saveCreds: async () => {
			await profile('saveCreds', () => writeData('auth_creds', state.creds), logger);
		},
		deleteSession: async () => {
			await profile('deleteSession', () => AuthStateModel.destroy({ where: { session_id: sessionId } }), logger);
		},
	};
}

export { useSQLiteAuthState };
