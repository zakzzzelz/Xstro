import { DATABASE } from '../../config.js';
import { DataTypes } from 'sequelize';
import { performance } from 'perf_hooks';
import * as baileys from 'baileys';
const { initAuthCreds, proto } = baileys;

let sequelize = DATABASE;

const bufferToJSON = obj => {
	if (Buffer.isBuffer(obj)) {
		return { type: 'Buffer', data: Array.from(obj) };
	}
	if (Array.isArray(obj)) {
		return obj.map(bufferToJSON);
	}
	if (obj && typeof obj === 'object') {
		if (typeof obj.toJSON === 'function') {
			return obj.toJSON();
		}

		const result = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				result[key] = bufferToJSON(obj[key]);
			}
		}
		return result;
	}
	return obj;
};

const jsonToBuffer = obj => {
	if (obj && obj.type === 'Buffer' && Array.isArray(obj.data)) {
		return Buffer.from(obj.data);
	}
	if (Array.isArray(obj)) {
		return obj.map(jsonToBuffer);
	}
	if (obj && typeof obj === 'object') {
		const result = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				result[key] = jsonToBuffer(obj[key]);
			}
		}
		return result;
	}
	return obj;
};

const profile = async (name, fn, logger) => {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	logger.debug(`${name} took ${(end - start).toFixed(2)} ms`);
	return result;
};

export default async function useSQLiteAuthState(sqliteConfig, sessionId, customLogger) {
	const logger = customLogger;

	await sequelize.query(`
    CREATE TABLE IF NOT EXISTS auth_state (
      session_id TEXT,
      data_key TEXT,
      data_value TEXT,
      PRIMARY KEY (session_id, data_key)
    );
    CREATE INDEX IF NOT EXISTS idx_session_key ON auth_state (session_id, data_key);
  `);

	const AuthStateModel = sequelize.define(
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
