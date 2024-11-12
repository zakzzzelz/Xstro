import fs from 'fs';
import axios from 'axios';
import { bot } from '../lib/client/plugins.js';
import { addPlugin, getPlugins, removePlugin } from '../lib/sql/plugins.js';
import { fancy } from '../lib/extras/font.js';
import { dirname, basename, resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

bot(
	{
		pattern: 'install ?(.*)',
		isPublic: false,
		desc: 'Installs a Plugin',
		type: 'system',
	},
	async (message, match) => {
		const pluginUrl = match.trim();
		if (!pluginUrl.startsWith('https://gist.githubusercontent.com')) return message.sendReply('_Provide a valid Plugin URL_');

		const baseName = basename(pluginUrl, extname(pluginUrl));
		const pluginName = `${baseName}.js`;
		const existingPlugins = await getPlugins();
		if (existingPlugins.some(plugin => plugin.name === pluginName)) return message.sendReply('_Plugin already installed_');

		const pluginPath = resolve(__dirname, '../plugins', pluginName);
		const response = await axios.get(pluginUrl, { responseType: 'arraybuffer' });
		fs.writeFileSync(pluginPath, response.data);
		await addPlugin(pluginName);
		message.sendReply(`_${pluginName} plugin installed_`);
	},
);

bot(
	{
		pattern: 'delplugin ?(.*)',
		isPublic: false,
		desc: 'Deletes a Plugin',
		type: 'system',
	},
	async (message, match) => {
		if (!match) return message.sendReply('_Provide an installed plugin name_');
		const baseName = match.trim();
		const pluginName = `${baseName}.js`;
		const deleted = await removePlugin(pluginName);
		if (!deleted) return message.sendReply('_Plugin not found_');

		const pluginPath = resolve(__dirname, '../plugins', pluginName);
		if (fs.existsSync(pluginPath)) fs.unlinkSync(pluginPath);
		message.sendReply(`_${pluginName} plugin uninstalled_`);
	},
);

bot(
	{
		pattern: 'getplugins',
		isPublic: false,
		desc: 'Lists all installed plugins',
		type: 'system',
	},
	async message => {
		const plugins = await getPlugins();
		const pluginList = plugins.length > 0 ? `Plugins Installed:\n${plugins.map(plugin => plugin.name).join('\n')}` : '_No plugins installed_';
		message.sendReply(fancy(pluginList));
	},
);
