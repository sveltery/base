import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * The file at `commit` when that object is in this clone.
 * CI checks out the pull request with depth 1, so `git show` of an older
 * commit fails there. The committed copy is what that checkout lints.
 * When the commit is present, the copy has to match it.
 *
 * @param {string} commit
 * @param {string} repoPath
 * @param {URL} fixtureUrl
 */
export function historicalSource(commit, repoPath, fixtureUrl) {
	const copy = readFileSync(fixtureUrl, 'utf8');
	try {
		execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' });
	} catch {
		return copy;
	}
	const source = execFileSync('git', ['show', `${commit}:${repoPath}`], { encoding: 'utf8' });
	if (source !== copy) {
		throw new Error(`${fixtureUrl.pathname} does not match ${commit}:${repoPath}`);
	}
	return source;
}
