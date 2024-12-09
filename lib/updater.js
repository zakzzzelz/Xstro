import { exec } from 'child_process';
import config from '../config.js';
import Heroku from 'heroku-client';

export const performUpdate = async () => {
	return new Promise((resolve, reject) => {
		exec('git fetch', fetchErr => {
			if (fetchErr) return reject('Error fetching updates: ' + fetchErr.message);

			exec('git log origin/master --not master --oneline', (logErr, stdout) => {
				if (logErr) return reject('Error fetching log: ' + logErr.message);

				const commits = stdout.trim().split('\n');
				if (commits.length === 0) return resolve(`No new updates. You are on version ${config.VERSION}`);

				const changesList = commits.map((c, i) => `${i + 1}. ${c}`).join('\n');
				const changes = `*New Update*\n\n*Changes:*\n${changesList}`;
				resolve(changes);
			});
		});
	});
};

export const updateHerokuApp = async () => {
	const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

	await exec('git fetch');
	const { stdout } = await execPromise('git log master..origin/master --oneline');
	if (!stdout.trim()) return '```You already have the latest version installed.```';

	const app = await heroku.get(`/apps/${process.env.HEROKU_APP_NAME}`);
	const gitUrl = app.git_url.replace('https://', `https://api:${process.env.HEROKU_API_KEY}@`);
	await execPromise(`git remote add heroku ${gitUrl}`);
	await execPromise('git push heroku master');

	return '```Bot updated. Restarting.```';
};

function execPromise(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) reject(error);
			resolve(stdout);
		});
	});
}
