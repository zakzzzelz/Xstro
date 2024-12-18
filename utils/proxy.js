import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { ProxyAgent } from 'proxy-agent';

const proxyFilePath = path.join('proxy.txt');

export const getRandomProxy = async () => {
	try {
		const data = await fs.promises.readFile(proxyFilePath, 'utf8');
		const proxies = data.split('\n').filter(line => line.trim() !== '');
		if (proxies.length === 0) return null;
		const randomIndex = Math.floor(Math.random() * proxies.length);
		return proxies[randomIndex];
	} catch (error) {
		console.error('Error reading proxy file:', error);
		return null;
	}
};
