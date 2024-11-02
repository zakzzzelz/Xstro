import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const toBool = (x) => x === "true";
const DATABASE_URL = process.env.DATABASE_URL || "./database.db";
export const BOT_INFO = process.env.BOT_INFO || "ᴀsᴛʀᴏ;xsᴛʀᴏ-ᴍᴅ;https://img.freepik.com/free-photo/cityscape-anime-inspired-urban-area_23-2151028605.jpg?t=st=1730553887~exp=1730557487~hmac=5ba4fb5c7312cdc27e4605bd9854aa3851f8f56ee4573484b1e65e110ae897c2&w=1480";
export const GITHUB_URL = process.env.GITHUB_URL || "https://github.com/ASTRO-X10/xstro-md";
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
