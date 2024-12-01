export const SudoDB: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
export function addSudo(jid: any): Promise<"_Sudo added_" | "_User already sudo_">;
export function delSudo(jid: any): Promise<"_User deleted from sudo_" | "_User was not sudo_">;
export function getSudo(): Promise<string>;
export function isSudo(jid: any, owner: any): Promise<boolean | undefined>;
