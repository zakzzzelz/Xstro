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
		const aheadBehind = execSync('git rev-list --left-right --count HEAD...@{upstream}').toString().trim().split('\t');
		const [behind] = aheadBehind.map(Number);
		return behind === 0;
	} catch {
		return false;
	}
}
