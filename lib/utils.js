import { exec } from 'child_process';
import * as baileys from 'baileys';
import { fileTypeFromBuffer } from 'file-type';
import { Buffer } from 'buffer';
import XUtils from 'utils'

export const mods = XUtils

export async function manageProcess(opts) {
   if (opts === 'restart') {
      await exec('npm start');
   } else if (opts === 'stop') {
      await exec('npm stop');
   }
}

export async function getBuffer(url, options = {}) {
   const res = await fetch(url, {
      method: 'GET',
      headers: { DNT: '1', 'Upgrade-Insecure-Request': '1', ...options.headers },
      ...options,
   });
   if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
   const arrayBuffer = await res.arrayBuffer();
   return Buffer.from(arrayBuffer);
}

export const decodeJid = (jid) => {
   if (!jid) return jid;
   if (/:\d+@/gi.test(jid)) {
      const decode = baileys.jidDecode(jid) || {};
      return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
   } else {
      return jid;
   }
};

export function extractUrlFromMessage(message) {
   const urlRegex = /(https?:\/\/[^\s]+)/gi;
   const match = urlRegex.exec(message);
   return match ? match[0] : null;
}

export async function getJson(url, options = {}) {
   const res = await fetch(url, {
      method: 'GET',
      headers: {
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
         ...options.headers,
      },
      ...options,
   });
   if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
   const data = await res.json();
   return data;
}

export function parsedJid(text = '') {
   return [...text.matchAll(/([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net');
}

export function formatBytes(bytes, decimals = 2) {
   if (!+bytes) return '0 Bytes';
   const k = 1024;
   const dm = decimals < 0 ? 0 : decimals;
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const runtime = function (seconds) {
   seconds = Number(seconds);
   var d = Math.floor(seconds / (3600 * 24));
   var h = Math.floor((seconds % (3600 * 24)) / 3600);
   var m = Math.floor((seconds % 3600) / 60);
   var s = Math.floor(seconds % 60);
   var dDisplay = d > 0 ? d + (d == 1 ? ' d ' : ' d ') : '';
   var hDisplay = h > 0 ? h + (h == 1 ? ' h ' : ' h ') : '';
   var mDisplay = m > 0 ? m + (m == 1 ? ' m ' : ' m ') : '';
   var sDisplay = s > 0 ? s + (s == 1 ? ' s' : ' s') : '';
   return dDisplay + hDisplay + mDisplay + sDisplay;
};

export const getFloor = (number) => {
   return Math.floor(number);
};

export const getRandom = (array) => {
   if (array.length === 0) return undefined;
   const randomIndex = Math.floor(Math.random() * array.length);
   return array[randomIndex];
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const numtoId = (phoneNumber) => {
   if (!phoneNumber || typeof phoneNumber !== 'string') return '';
   return `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;
};

export const getMimeType = async (buffer) => {
   if (typeof buffer === 'string') return 'text/plain';
   try {
      const fileType = await fileTypeFromBuffer(buffer);
      return fileType ? fileType.mime : 'application/octet-stream';
   } catch {
      return 'application/octet-stream';
   }
};

export async function isAdmin(jid, user, client) {
   const groupMetadata = await client.groupMetadata(jid);
   const groupAdmins = groupMetadata.participants.filter((participant) => participant.admin !== null).map((participant) => participant.id);

   return groupAdmins.includes(decodeJid(user));
}
