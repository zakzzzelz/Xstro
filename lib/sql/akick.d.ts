export function addAKick(groupJid: string, userJid: string): Promise<boolean>;
export function delKick(groupJid: string, userJid: string): Promise<number>;
export function getKicks(groupJid: string, userJid?: string): Promise<any[]>;
