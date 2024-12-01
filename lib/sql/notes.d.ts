export function addNote(title: any, content: any): Promise<import("sequelize").Model<any, any>>;
export function updateNote(id: any, updates: any): Promise<import("sequelize").Model<any, any> | null>;
export function removeNote(id: any): Promise<number>;
export function getNotes(): Promise<import("sequelize").Model<any, any>[]>;
export function getNote(id: any): Promise<import("sequelize").Model<any, any> | null>;
export default NotesDB;
declare const NotesDB: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
