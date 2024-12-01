export function isEnabled(groupJid: string): Promise<boolean>;
export function getWelcomeMessage(groupJid: string): Promise<string | null>;
export function getGoodByeMessage(groupJid: string): Promise<string | null>;
export function setWelcomeMessage(groupJid: string, message: string): Promise<void>;
export function setGoodByeMessage(groupJid: string, message: string): Promise<void>;
export default Greetings;
declare const Greetings: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
