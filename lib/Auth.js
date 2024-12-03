import { performance } from 'perf_hooks';
import * as baileys  from 'baileys';
import { AuthState } from '../plugins/sql/session.js';

const bufferToJSON = obj => {
	if (Buffer.isBuffer(obj)) return { type: 'Buffer', data: Array.from(obj) };
	if (Array.isArray(obj)) return obj.map(bufferToJSON);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, bufferToJSON(value)]));
	}
	return obj;
};

const jsonToBuffer = obj => {
	if (obj?.type === 'Buffer' && Array.isArray(obj.data)) return Buffer.from(obj.data);
	if (Array.isArray(obj)) return obj.map(jsonToBuffer);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, jsonToBuffer(value)]));
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

const useSequelizeAuthState = async (sessionId, logger) => {
	const writeData = async (key, data) => {
		const serialized = JSON.stringify(bufferToJSON(data));
		await AuthState.upsert({ session_id: sessionId, data_key: key, data_value: serialized });
	};

	const readData = async key => {
		const record = await AuthState.findOne({ where: { session_id: sessionId, data_key: key } });
		return record ? jsonToBuffer(JSON.parse(record.data_value)) : null;
	};

	const creds = (await profile('readCreds', () => readData('creds'), logger)) || baileys.initAuthCreds();

	const state = {
		creds,
		keys: {
			get: async (type, ids) => {
				return profile(
					'keys.get',
					async () => {
						const keys = ids.map(id => `${type}-${id}`);
						const records = await AuthState.findAll({
							where: { session_id: sessionId, data_key: keys },
						});
						return records.reduce((acc, record) => {
							const id = record.data_key.split('-')[1];
							let value = jsonToBuffer(JSON.parse(record.data_value));
							if (type === 'app-state-sync-key') value = baileys.proto.Message.AppStateSyncKeyData.fromObject(value);
							acc[id] = value;
							return acc;
						}, {});
					},
					logger,
				);
			},
			set: async data => {
				return profile(
					'keys.set',
					async () => {
						const entries = [];
						for (const [type, ids] of Object.entries(data)) {
							for (const [id, value] of Object.entries(ids || {})) {
								entries.push({
									session_id: sessionId,
									data_key: `${type}-${id}`,
									data_value: JSON.stringify(bufferToJSON(value)),
								});
							}
						}
						await AuthState.bulkCreate(entries, { updateOnDuplicate: ['data_value'] });
					},
					logger,
				);
			},
		},
	};

	return {
		state,
		saveCreds: () => profile('saveCreds', () => writeData('creds', state.creds), logger),
		deleteSession: () => profile('deleteSession', () => AuthState.destroy({ where: { session_id: sessionId } }), logger),
	};
};

export default useSequelizeAuthState;
