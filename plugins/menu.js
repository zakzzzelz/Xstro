import config from '../config.js';
import { commands, bot } from '../lib/plugins.js';
import { formatBytes, runtime } from '../lib/utils.js';
import { platform, totalmem, freemem } from 'os';
import { fancy } from './bot/font.js';
import { getBuffer } from 'utils';

bot(
   {
      pattern: 'menu',
      isPublic: true,
      desc: 'Show All Commands (Dynamic Design)',
      dontAddCommandList: true,
   },
   async message => {
      const menuDesign = config.MENU_DESIGN; // Get the design from config.js
      const imageUrl = config.MENU_IMAGE_URL; // Get the image URL

      
      let menuText = `╭─ ${config.BOT_INFO.split(';')[1]} ───
│ User: ${message.pushName}
│ Mode: ${config.MODE}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Plugins: ${commands.length}
│ Memory: ${formatBytes(totalmem() - freemem())}
│ Version: ${config.VERSION}
╰────────────────\n`;

      let commandCounter = 1;
      const categorized = commands
         .filter(cmd => cmd.pattern && !cmd.dontAddCommandList)
         .map(cmd => ({
            name: cmd.pattern.toString().split(/\W+/)[2],
            category: cmd.type?.toLowerCase() || 'misc',
         }))
         .reduce((acc, { name, category }) => {
            acc[category] = (acc[category] || []).concat(name);
            return acc;
         }, {});

      Object.keys(categorized).forEach(category => {
         menuText += `\n╭──〈 ${category} 〉────\n`;
         categorized[category].forEach(cmd => {
            menuText += `│▸ ${commandCounter}. ${cmd}\n`;
            commandCounter++;
         });
         menuText += `╰──────────────\n`;
      });

      
      if (menuDesign === 1) {
         // Design 1: Menu with Image
         try {
            const imageBuffer = await getBuffer(imageUrl); // Fetch the image
            await message.send(imageBuffer, {
               caption: fancy(`\`\`\`${menuText}\`\`\``),
            });
         } catch (error) {
            console.error('Failed to fetch image:', error);
            await message.send(fancy(`\`\`\`${menuText}\`\`\``)); // Fallback to text-only menu
         }
      } else if (menuDesign === 2) {
         // Design 2: Menu without Image
         await message.send(fancy(`\`\`\`${menuText}\`\`\``));
      } else {
         
         await message.send('_Invalid menu design selected in configuration._');
      }
   },
);
