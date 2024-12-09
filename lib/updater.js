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
		const result = execSync('git pull').toString().trim();
		return result.includes('Already up to date.');
	} catch {
		return false;
	}
}
