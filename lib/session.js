import { promises as fs } from 'fs';
import path from 'path';
import { getJson, getBuffer } from 'utils';
import config from '../config.js';
import { Sequelize, DataTypes } from 'sequelize';

export default async function getSession() {
    const { SESSION_ID } = config;
    if (!SESSION_ID) {
        return;
    }

    const DATABASE_PATH = path.join(process.cwd(), 'database.db');
    const TEMP_DATABASE_PATH = path.join(process.cwd(), 'temp_database.db');

    let mainSequelize = null;
    let tempSequelize = null;

    try {
        const res = await getJson(`https://xstrosession.onrender.com/session/${SESSION_ID}`);
        const buffer = await getBuffer(res.files[0].url);
        await fs.writeFile(TEMP_DATABASE_PATH, buffer);

        mainSequelize = new Sequelize({
            dialect: 'sqlite',
            storage: DATABASE_PATH,
            logging: false,
        });

        tempSequelize = new Sequelize({
            dialect: 'sqlite',
            storage: TEMP_DATABASE_PATH,
            logging: false,
        });

        const Session = mainSequelize.define('Session', {
            session_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            data_key: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            data_value: {
                type: DataTypes.TEXT,
                allowNull: true,
            }
        }, {
            tableName: 'session',
            timestamps: false,
        });

        await mainSequelize.sync({ force: false });

        try {
            const [mainSessionResult] = await mainSequelize.query('SELECT session_id FROM session LIMIT 1', { type: Sequelize.QueryTypes.SELECT });
            const [tempSessionResult] = await tempSequelize.query('SELECT session_id FROM session LIMIT 1', { type: Sequelize.QueryTypes.SELECT });

            const mainSessionId = mainSessionResult?.session_id;
            const tempSessionId = tempSessionResult?.session_id;

            if (mainSessionId === tempSessionId) {
                console.log('Session connected');
                return;
            }

            const tempSessionData = await tempSequelize.query('SELECT session_id, data_key, data_value FROM session', { type: Sequelize.QueryTypes.SELECT });

            await mainSequelize.transaction(async transaction => {
                await mainSequelize.query('DELETE FROM session', { transaction });

                for (const row of tempSessionData) {
                    await mainSequelize.query('INSERT INTO session (session_id, data_key, data_value) VALUES (?, ?, ?)', {
                        replacements: [row.session_id, row.data_key, row.data_value],
                        transaction,
                    });
                }
            });

            console.log('Session connected');
        } catch (queryError) {
            console.error('Session error', queryError);
            await mainSequelize.sync({ force: true });
        }
    } catch {
        console.error('Session error');
    } finally {
        try {
            if (mainSequelize) await mainSequelize.close();
            if (tempSequelize) await tempSequelize.close();

            await fs.unlink(TEMP_DATABASE_PATH).catch(() => {});
        } catch {}
    }
}
