export function getAfkMessage(): Promise<{
    message: any;
    timestamp: any;
} | null>;
export function setAfkMessage(afkMessage: any, timestamp: any): Promise<import("sequelize").Model<any, any>>;
export function delAfkMessage(): Promise<void>;
