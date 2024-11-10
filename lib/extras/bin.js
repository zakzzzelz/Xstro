import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

function setupFoldersAndGitignore() {
	const tempFolder = join(process.cwd(), 'temp');
	const gitignoreFile = join(process.cwd(), '.gitignore');
	const gitignoreContent = `.gitignore
node_modules
database.db
test.js
package-lock.json
.env
index.js
logs
help.js
session
temp
error.log
out.log
yarn.lock`;

	if (!existsSync(tempFolder)) mkdirSync(tempFolder);
	if (!existsSync(gitignoreFile)) writeFileSync(gitignoreFile, gitignoreContent);
}

export { setupFoldersAndGitignore };
