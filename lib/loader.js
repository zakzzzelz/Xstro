import { pathToFileURL } from 'url';
import { join, extname } from 'path';
import { readdir } from 'fs/promises';

export async function loadFiles() {
    const baseDir = process.cwd();
    const pluginsDir = join(baseDir, 'plugins');
    const sqlDir = join(baseDir, 'sql');
    const eventDir = join(baseDir, 'bot');

    const dirsToRead = [pluginsDir, sqlDir, eventDir];

    for (const dir of dirsToRead) {
        const files = await readdir(dir, { withFileTypes: true });
        await Promise.all(
            files.map(async file => {
                const fullPath = join(dir, file.name);
                if (file.isDirectory() && fullPath !== sqlDir) return;
                if (extname(file.name) === '.js') {
                    try {
                        // Convert the path to a proper file URL
                        const fileUrl = pathToFileURL(fullPath).href;
                        await import(fileUrl);
                    } catch (err) {
                        console.log('ERROR', `${file.name}: ${err.message}`);
                    }
                }
            }),
        );
    }
}
