import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The committed copy of `commit:repoPath`.
 * `git hash-object` checks the blob id with no history, so a depth-1 checkout
 * still fails if the copy was edited. When that commit is in the clone, the
 * bytes also have to match `git show`.
 *
 * @param {string} commit
 * @param {string} repoPath
 * @param {URL} fixtureUrl
 * @param {string} blob
 */
export function historicalSource(commit, repoPath, fixtureUrl, blob) {
	const copy = readFileSync(fixtureUrl, 'utf8');
	const path = fileURLToPath(fixtureUrl);
	const actual = execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim();
	if (actual !== blob) {
		throw new Error(`${path} blob ${actual} does not match ${blob}`);
	}
	try {
		execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { stdio: 'ignore' });
	} catch {
		return copy;
	}
	const source = execFileSync('git', ['show', `${commit}:${repoPath}`], { encoding: 'utf8' });
	if (source !== copy) {
		throw new Error(`${path} does not match ${commit}:${repoPath}`);
	}
	return source;
}
