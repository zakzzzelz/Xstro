import { execSync } from 'child_process';

export async function updateBot() {
	try {
		execSync('git stash');
		execSync('git pull origin');
		execSync('npm start');
		return { success: true };
	} catch {
		return false;
	}
}

export async function isLatest() {
	try {
		execSync('git fetch');
		const diffOutput = execSync('git diff --quiet HEAD @{upstream}');
		return diffOutput === null;
	} catch {
		return false;
	}
}
