/**
welcome to fetchfiles.js 
**/


import { bot } from '#lib'; // bot handlers 
import fs from 'fs'; // file system
import path from 'path';

bot(
    {
        pattern: 'file ?(.*)', 
        fromMe: true, 
        desc: 'Send the content of a specified file',
        type: 'utility',
    },
    async (message, match) => {
        
        if (!match) {
            return message.send('_Please specify the file name. Example: file config.js_');
        }

        const fileName = match.trim();
        const filePath = path.join(process.cwd(), fileName); 

        try {
          
            if (!fs.existsSync(filePath)) {
                return message.send(`_The file "${fileName}" does not exist._`);
            }
             const fileContent = fs.readFileSync(filePath, 'utf-8');

        
            return message.send(`_Content of the file "${fileName}":_\n\n\`\`\`${fileContent}\`\`\``);
        } catch (error) {
            console.error(`[ERROR] File Command:`, error.message);
            return message.send('_Failed to read the file. Please check the file name and try again._');
        }
    }
);
