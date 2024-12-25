/**
 * @file SQLite Authentication State Management for Baileys
 * @license MIT
 *
 * Use and modify this code freely under the MIT license. If you use this in your projects, attribution would be appreciated.
 *
 * Author: Zaid (GitHub: hacxk)
 */
import { initAuthCreds } from 'baileys';
import pkg from 'baileys';
import { AuthState } from '#sql';
import { jsonToBuffer, bufferToJSON, profile } from '#utils';

const { proto } = pkg;

export const SessionState = async (sessionId, logger) => {
	const writeData = async (key, data) => {
		const serialized = JSON.stringify(bufferToJSON(data));
		await AuthState.upsert({
			session_id: sessionId,
			data_key: key,
			data_value: serialized,
		});
	};

	const readData = async key => {
		const record = await AuthState.findOne({
			where: { session_id: sessionId, data_key: key },
		});
		return record ? jsonToBuffer(JSON.parse(record.data_value)) : null;
	};

	const creds =
		(await profile('readCreds', () => readData('creds'), logger)) ||
		initAuthCreds();

	const state = {
		creds,
		keys: {
			get: async (type, ids) => {
				return profile(
					'keys.get',
					async () => {
						const data = {};
						const rows = await AuthState.findAll({
							where: {
								session_id: sessionId,
								data_key: ids.map(
									id => `${type}-${id}`,
								),
							},
						});

						const idMap = Object.fromEntries(
							ids.map(id => [`${type}-${id}`, id]),
						);

						rows.forEach(row => {
							let value = jsonToBuffer(
								JSON.parse(row.data_value),
							);
							if (type === 'app-state-sync-key') {
								value =
									proto.Message.AppStateSyncKeyData.fromObject(
										value,
									);
							}
							const originalId = idMap[row.data_key];
							if (originalId) {
								data[originalId] = value;
							}
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
						const entries = [];
						for (const [type, ids] of Object.entries(data)) {
							for (const [id, value] of Object.entries(
								ids || {},
							)) {
								entries.push({
									session_id: sessionId,
									data_key: `${type}-${id}`,
									data_value: JSON.stringify(
										bufferToJSON(value),
									),
								});
							}
						}
						await AuthState.bulkCreate(entries, {
							updateOnDuplicate: ['data_value'],
						});
					},
					logger,
				);
			},
		},
	};

	return {
		state,
		saveCreds: () =>
			profile(
				'saveCreds',
				() => writeData('creds', state.creds),
				logger,
			),
		deleteSession: () =>
			profile(
				'deleteSession',
				() =>
					AuthState.destroy({
						where: { session_id: sessionId },
					}),
				logger,
			),
	};
};
