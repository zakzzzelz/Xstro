import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const toBool = (x) => x === "true";
const DATABASE_URL = process.env.DATABASE_URL || "./database.db";
export const BOT_INFO = process.env.BOT_INFO || "ᴀsᴛʀᴏ;xsᴛʀᴏ-ᴍᴅ;https://raw.githubusercontent.com/ASTRO-X10/xstro-md/refs/heads/master/media/lite.jpg";
export const LOGS = toBool(process.env.LOGS) || true;
export const PREFIX = process.env.PREFIX || ".";
export const SUDO = process.env.SUDO || "";
export const STICKER_PACK = process.env.STICKER_PACK || "ᴀsᴛʀᴏ;xsᴛʀᴏ-ᴍᴅ";
export const AUTO_READ = toBool(process.env.AUTO_READ) || false;
export const AUTO_STATUS_READ = toBool(process.env.AUTO_STATUS_READ) || false;
export const WORK_TYPE = process.env.WORK_TYPE || "private";
export const GITHUB_URL = process.env.GITHUB_URL || "https://github.com/ASTRO-X10/xstro-md";
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
