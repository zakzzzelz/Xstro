export function addBan(jid: any): Promise<string>;
export function removeBan(jid: any): Promise<string>;
export function getBanned(): Promise<any[]>;
export function isBanned(jid: any): Promise<boolean | undefined>;
export default BanDB;
declare const BanDB: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
