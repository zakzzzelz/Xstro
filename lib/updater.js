import { execSync } from 'child_process';
import Heroku from 'heroku-client';

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

export async function upgradeBot() {
	try {
		execSync('yarn upgrade');
		execSync('npm start');
		return { success: true };
	} catch {
		return false;
	}
}

export async function isLatest() {
	try {
		execSync('git fetch');
		const localCommit = execSync('git rev-parse HEAD').toString().trim();
		const remoteCommit = execSync('git rev-parse @{upstream}').toString().trim();
		return localCommit === remoteCommit;
	} catch {
		return false;
	}
}

export const updateHerokuApp = async () => {
	const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
	const isLatestVersion = await isLatest();
	if (!isLatestVersion) return '```You already have the latest version installed.```';
	const app = await heroku.get(`/apps/${process.env.HEROKU_APP_NAME}`);
	const gitUrl = app.git_url.replace('https://', `https://api:${process.env.HEROKU_API_KEY}@`);

	try {
		execSync('git remote add heroku ' + gitUrl);
	} catch {
		execSync('git remote set-url heroku ' + gitUrl);
	}
	execSync('git push heroku master');
	return '```Bot updated. Restarting.```';
};
