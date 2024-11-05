import { promises as fs } from 'fs';
import { join } from 'path';
const envPath = join(process.cwd(), '.env');

async function manageVar(params) {
	const { command, key, value } = params;

	async function readEnv() {
		try {
			return await fs.readFile(envPath, 'utf8');
		} catch (error) {
			if (error.code === 'ENOENT') {
				await fs.writeFile(envPath, '');
				return '';
			}
			throw error;
		}
	}

	switch (command) {
		case 'set': {
			const envContent = await readEnv();
			const lines = envContent.split('\n').filter(line => line.trim());
			const exists = lines.findIndex(line => line.startsWith(`${key}=`));

			if (exists !== -1) {
				lines[exists] = `${key}=${value}`;
			} else {
				lines.push(`${key}=${value}`);
			}

			await fs.writeFile(envPath, lines.join('\n') + '\n');
			return true;
		}
		case 'get': {
			const data = await readEnv();
			return data || null;
		}
		case 'del': {
			const data = await readEnv();
			const lines = data
				.split('\n')
				.filter(line => line.trim() && !line.startsWith(`${key}=`))
				.join('\n');

			await fs.writeFile(envPath, lines + '\n');
			return true;
		}
	}
}
export { manageVar };
