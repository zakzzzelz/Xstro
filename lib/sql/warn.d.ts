export function addWarn(jid: any, reason: any): Promise<{
    success: boolean;
    warnings: any;
    reason: any;
}>;
export function getWarn(jid: any): Promise<{
    success: boolean;
    warnings: any;
    reason: any;
}>;
export function resetWarn(jid: any): Promise<{
    success: boolean;
}>;
export function isWarned(jid: any): Promise<boolean>;
export default WarnDB;
declare const WarnDB: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
