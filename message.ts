/**
 * @file SQLite Authentication State Management for Baileys
 * @license MIT
 *
 * Use and modify this code freely under the MIT license. If you use this in your projects, attribution would be appreciated.
 *
 * Author: Zaid (GitHub: hacxk)
 */

import * as SQLite from "sqlite3";
import { open, Database } from "sqlite";
import { performance } from "perf_hooks";
import * as pino from "pino";
import { AuthenticationState, initAuthCreds } from "baileys";
import * as proto from "baileys";

interface SQLiteConfig {
  filename: string;
}

let dbInstance: Database | null = null;

const getDatabaseConnection = async (
  sqliteConfig: SQLiteConfig,
  logger: pino.pino.Logger
): Promise<Database> => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: sqliteConfig.filename,
    driver: SQLite.Database,
  });

  await dbInstance.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA temp_store = MEMORY;
        PRAGMA mmap_size = 268435456;
        PRAGMA cache_size = -64000;
        CREATE TABLE IF NOT EXISTS auth_state (
            session_id TEXT,
            data_key TEXT,
            data_value TEXT,
            PRIMARY KEY (session_id, data_key)
        ) WITHOUT ROWID;
        CREATE INDEX IF NOT EXISTS idx_session_key ON auth_state (session_id, data_key);
    `);

  logger.debug("Database connection established and configured");
  return dbInstance;
};

const bufferToJSON = (obj: any): any => {
  if (Buffer.isBuffer(obj)) {
    return { type: "Buffer", data: Array.from(obj) };
  }
  if (Array.isArray(obj)) {
    return obj.map(bufferToJSON);
  }
  if (obj && typeof obj === "object") {
    if (typeof obj.toJSON === "function") {
      return obj.toJSON();
    }

    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = bufferToJSON(obj[key]);
      }
    }
    return result;
  }
  return obj;
};

const jsonToBuffer = (obj: any): any => {
  if (obj && obj.type === "Buffer" && Array.isArray(obj.data)) {
    return Buffer.from(obj.data);
  }
  if (Array.isArray(obj)) {
    return obj.map(jsonToBuffer);
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = jsonToBuffer(obj[key]);
      }
    }
    return result;
  }
  return obj;
};

const profile = async (
  name: string,
  fn: () => Promise<any>,
  logger: pino.pino.Logger
) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  logger.debug(`${name} took ${(end - start).toFixed(2)} ms`);
  return result;
};

/**
 * Initializes and manages the SQLite-based authentication state for Baileys.
 *
 * @param {SQLiteConfig} sqliteConfig - Configuration for the SQLite database.
 * @param {string} sessionId - A unique identifier for the current session.
 * @param {Logger} customLogger - An instance of a Pino logger for debugging and logging.
 * @returns {Promise<{
 *   state: AuthenticationState,
 *   saveCreds: () => Promise<void>,
 *   deleteSession: () => Promise<void>
 * }>} An object containing the authentication state, a method to save credentials, and a method to delete the session.
 *
 * @example
 * // Import required dependencies
 * import pino from 'pino';
 * import useSQLiteAuthState from './useSQLiteAuthState';
 *
 * // Configure SQLite and logger
 * const sqliteConfig = { filename: './auth-state.db' };
 * const sessionId = 'my-session-id';
 * const logger = pino();
 *
 * // Use the function
 * (async () => {
 *   const { state, saveCreds, deleteSession } = await useSQLiteAuthState(sqliteConfig, sessionId, logger);
 *
 *   // Example: Save credentials
 *   await saveCreds();
 *
 *   // Example: Delete session
 *   await deleteSession();
 * })();
 */
export default async function useSQLiteAuthState(
  sqliteConfig: SQLiteConfig,
  sessionId: string,
  customLogger: pino.pino.Logger
): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  deleteSession: () => Promise<void>;
}> {
  const logger = customLogger;
  const db = await getDatabaseConnection(sqliteConfig, logger);

  const writeData = async (key: string, data: any) => {
    const serialized = JSON.stringify(bufferToJSON(data));
    await db.run(
      "INSERT OR REPLACE INTO auth_state (session_id, data_key, data_value) VALUES (?, ?, ?)",
      [sessionId, key, serialized]
    );
  };

  const readData = async (key: string): Promise<any | null> => {
    const row = await db.get(
      "SELECT data_value FROM auth_state WHERE session_id = ? AND data_key = ?",
      [sessionId, key]
    );
    return row?.data_value ? jsonToBuffer(JSON.parse(row.data_value)) : null;
  };

  const creds =
    (await profile("readCreds", () => readData("auth_creds"), logger)) ||
    initAuthCreds();

  const state: AuthenticationState = {
    creds,
    keys: {
      get: async (type, ids) => {
        return profile(
          "keys.get",
          async () => {
            const data: any = {};
            const placeholders = ids.map(() => "?").join(",");
            const query = `SELECT data_key, data_value FROM auth_state WHERE session_id = ? AND data_key IN (${placeholders})`;
            const params = [sessionId, ...ids.map((id) => `${type}-${id}`)];
            const rows = await db.all(query, params);
            const idMap = Object.fromEntries(ids.map((id) => [`${type}-${id}`, id]));
            rows.forEach((row) => {
              let value = jsonToBuffer(JSON.parse(row.data_value));
              if (type === "app-state-sync-key") {
                value = proto.proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              const originalId = idMap[row.data_key]; 
              if (originalId) {
                data[originalId] = value;
              }
            });
            return data;
          },
          logger
        );
      },
      set: async (data) => {
        return profile(
          "keys.set",
          async () => {
            console.log("[SET DATA]", JSON.stringify(data, null, 2));
            await db.run("BEGIN TRANSACTION");

            const instert: any[] = [];
            const deleteKeys: string[] = [];
            for (const [category, categoryData] of Object.entries(data)) {
              for (const [id, value] of Object.entries(categoryData || {})) {
                const key = `${category}-${id}`;
                if (value) {
                  const serialized = JSON.stringify(bufferToJSON(value));
                  instert.push(sessionId, key, serialized);
                } else {
                  deleteKeys.push(key);
                }
              }
            }

            if (instert.length) {
              const placeholders = new Array(instert.length / 3)
                .fill("(?, ?, ?)")
                .join(",");
              await db.run(
                `INSERT OR REPLACE INTO auth_state (session_id, data_key, data_value) VALUES ${placeholders}`,
                instert
              );
            }

            if (deleteKeys.length) {
              const placeholders = deleteKeys.map(() => "?").join(",");
              await db.run(
                `DELETE FROM auth_state WHERE session_id = ? AND data_key IN (${placeholders})`,
                [sessionId, ...deleteKeys]
              );
            }

            await db.run("COMMIT");
          },
          logger
        );
      },
    },
  };

  return {
    state,
    saveCreds: async () => {
      await profile(
        "saveCreds",
        () => writeData("auth_creds", state.creds),
        logger
      );
    },
    deleteSession: async () => {
      await profile(
        "deleteSession",
        () => db.run("DELETE FROM auth_state WHERE session_id = ?", sessionId),
        logger
      );
    },
  };
}

export { useSQLiteAuthState };
