import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const toBool = (x) => x === "true";
const DATABASE_URL = process.env.DATABASE_URL || "./database.db";
export const LOGS = toBool(process.env.LOGS) || true;
export const PREFIX = process.env.PREFIX || ".";
export const SUDO = process.env.SUDO || "";
export const AUTO_READ = toBool(process.env.AUTO_READ) || false;
export const AUTO_STATUS_READ = toBool(process.env.AUTO_STATUS_READ) || false;
export const WORK_TYPE = process.env.WORK_TYPE || "private";

export const DATABASE =
	DATABASE_URL === "./database.db"
		? new Sequelize({
				dialect: "sqlite",
				storage: DATABASE_URL,
				logging: false,
		  })
		: new Sequelize(DATABASE_URL, {
				dialect: "postgres",
				ssl: true,
				protocol: "postgres",
				dialectOptions: {
					native: true,
					ssl: { require: true, rejectUnauthorized: false },
				},
				logging: false,
		  });
