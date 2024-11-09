import * as baileys from 'baileys';
import { profile, logger, bufferToJSON, jsonToBuffer } from './utils.js';
import { AuthStateModel } from './sql/session.js';
import { Op } from 'sequelize';
import { DATABASE } from '../config.js';
const { initAuthCreds, proto } = baileys;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function withRetry(operation, operationName) {
	let lastError;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;
			logger.warn(`${operationName} attempt ${attempt} failed:`, error);

			if (attempt < MAX_RETRIES) {
				await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
			}
		}
	}

	throw new Error(`${operationName} failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

async function cleanupOldSessions(maxAge = 30 * 24 * 60 * 60 * 1000) {
	try {
		const cutoffDate = new Date(Date.now() - maxAge);
		await AuthStateModel.destroy({
			where: {
				updatedAt: {
					[Op.lt]: cutoffDate,
				},
			},
		});
	} catch (error) {
		logger.error('Failed to cleanup old sessions:', error);
	}
}

export async function useSQLiteAuthState(sessionId) {
	if (!sessionId) {
		throw new Error('Session ID is required');
	}

	await withRetry(async () => {
		await DATABASE.query(`
      CREATE TABLE IF NOT EXISTS session (
        session_id TEXT,
        data_key TEXT,
        data_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (session_id, data_key)
      );
      CREATE INDEX IF NOT EXISTS idx_session_key ON session (session_id, data_key);
      CREATE INDEX IF NOT EXISTS idx_session_updated ON session (updated_at);
    `);
	}, 'Table creation');

	setInterval(() => cleanupOldSessions(), 24 * 60 * 60 * 1000);

	const writeData = async (key, data) => {
		return withRetry(async () => {
			const serialized = JSON.stringify(bufferToJSON(data));
			await AuthStateModel.upsert({
				session_id: sessionId,
				data_key: key,
				data_value: serialized,
				updated_at: new Date(),
			});
		}, `Write data for key ${key}`);
	};

	const readData = async key => {
		return withRetry(async () => {
			const row = await AuthStateModel.findOne({
				where: { session_id: sessionId, data_key: key },
			});

			if (!row?.data_value) return null;

			try {
				return jsonToBuffer(JSON.parse(row.data_value));
			} catch (error) {
				logger.error(`Error parsing data for key ${key}:`, error);
				return null;
			}
		}, `Read data for key ${key}`);
	};

	const creds = await profile(
		'readCreds',
		async () => {
			const data = await readData('auth_creds');
			return data || initAuthCreds();
		},
		logger,
	);

	const state = {
		creds,
		keys: {
			get: async (type, ids) => {
				return profile(
					'keys.get',
					async () => {
						const data = {};

						if (!Array.isArray(ids) || ids.length === 0) {
							return data;
						}

						const rows = await withRetry(async () => {
							return AuthStateModel.findAll({
								where: {
									session_id: sessionId,
									data_key: ids.map(id => `${type}-${id}`),
								},
							});
						}, 'Keys get operation');

						for (const row of rows) {
							try {
								const id = row.data_key.split('-')[1];
								let value = jsonToBuffer(JSON.parse(row.data_value));

								if (type === 'app-state-sync-key') {
									value = proto.Message.AppStateSyncKeyData.fromObject(value);
								}

								data[id] = value;
							} catch (error) {
								logger.error(`Error processing key ${row.data_key}:`, error);
							}
						}

						return data;
					},
					logger,
				);
			},

			set: async data => {
				return profile(
					'keys.set',
					async () => {
						if (!data || typeof data !== 'object') {
							throw new Error('Invalid data provided to keys.set');
						}

						const insert = [];
						const deleteKeys = [];

						for (const [category, categoryData] of Object.entries(data)) {
							if (!categoryData) continue;

							for (const [id, value] of Object.entries(categoryData)) {
								const key = `${category}-${id}`;

								if (value) {
									try {
										const serialized = JSON.stringify(bufferToJSON(value));
										insert.push({
											session_id: sessionId,
											data_key: key,
											data_value: serialized,
											updated_at: new Date(),
										});
									} catch (error) {
										logger.error(`Error serializing value for key ${key}:`, error);
									}
								} else {
									deleteKeys.push(key);
								}
							}
						}

						await withRetry(async () => {
							if (insert.length) {
								await AuthStateModel.bulkCreate(insert, {
									updateOnDuplicate: ['data_value', 'updated_at'],
								});
							}

							if (deleteKeys.length) {
								await AuthStateModel.destroy({
									where: {
										session_id: sessionId,
										data_key: deleteKeys,
									},
								});
							}
						}, 'Keys set operation');
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
			await profile(
				'deleteSession',
				async () => {
					await withRetry(async () => {
						await AuthStateModel.destroy({
							where: { session_id: sessionId },
						});
					}, 'Delete session');
				},
				logger,
			);
		},
	};
}
