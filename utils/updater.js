import { execSync } from 'child_process';
import { manageProcess } from '#utils';

export async function updateBot() {
	execSync('git stash');
	execSync('git pull origin');
	manageProcess('restart');
	return { success: true };
}

export async function getCommitDetails() {
	execSync('git fetch');
	const trackingBranch = execSync('git rev-parse --abbrev-ref --symbolic-full-name @{upstream}').toString().trim();
	const localCommit = execSync('git rev-parse HEAD').toString().trim();
	const remoteCommit = execSync(`git rev-parse ${trackingBranch}`).toString().trim();
	if (localCommit === remoteCommit) {
		return { commits: [], behindCount: 0 };
	}
	const behindCount = parseInt(execSync(`git rev-list HEAD..${trackingBranch} --count`).toString().trim() || '0');
	let commits = [];
	if (behindCount > 0) {
		commits = execSync(`git rev-list HEAD..${trackingBranch} --pretty=format:"%s"`)
			.toString()
			.trim()
			.split('\n')
			.filter(commit => commit);
	}
	return {
		commits,
		behindCount,
	};
}

export async function isLatest() {
	execSync('git fetch');
	const localCommit = execSync('git rev-parse HEAD').toString().trim().substring(0, 5);
	const trackingBranch = execSync('git rev-parse --abbrev-ref --symbolic-full-name @{upstream}').toString().trim();
	const remoteCommit = execSync(`git rev-parse ${trackingBranch}`).toString().trim().substring(0, 5);
	return {
		latest: localCommit === remoteCommit,
		localCommit,
		remoteCommit,
	};
}
