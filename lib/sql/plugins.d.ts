export function addPlugin(name: any): Promise<import("sequelize").Model<any, any>>;
export function updatePlugin(name: any, newName: any): Promise<import("sequelize").Model<any, any> | null>;
export function removePlugin(name: any): Promise<number>;
export function getPlugins(): Promise<import("sequelize").Model<any, any>[]>;
export default PluginDB;
declare const PluginDB: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
