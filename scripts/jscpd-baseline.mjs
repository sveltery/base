import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Live clone ceiling. Hoisting may stay under it. Growing past it fails CI. */
export const CEILING = 69;

/**
 * Fingerprints present in `next` and absent from `base`.
 * Baseline edits may drop entries. Adding one hides a new clone.
 *
 * @param {{ fingerprints?: Record<string, unknown> }} base
 * @param {{ fingerprints?: Record<string, unknown> }} next
 */
export function addedFingerprints(base, next) {
	const known = new Set(Object.keys(base?.fingerprints ?? {}));
	return Object.keys(next?.fingerprints ?? {}).filter((key) => !known.has(key));
}

function baseRevision() {
	const fromEnv = process.env.JSCPD_BASE_SHA;
	if (fromEnv && /^0+$/.test(fromEnv)) return null;
	if (fromEnv) return fromEnv;
	return 'origin/main';
}

/**
 * @param {string} rev
 */
function readBaseline(rev) {
	return execFileSync('git', ['show', `${rev}:.jscpd-baseline.json`], { encoding: 'utf8' });
}

const isCli = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
	const current = JSON.parse(fs.readFileSync('.jscpd-baseline.json', 'utf8'));
	const count = Object.keys(current.fingerprints ?? {}).length;
	if (count > CEILING) {
		console.error(`jscpd baseline has ${count} fingerprints; ceiling is ${CEILING}`);
		process.exit(1);
	}
	const rev = baseRevision();
	if (rev == null) {
		console.error('jscpd baseline base revision is missing');
		process.exit(1);
	}
	let ancestor;
	try {
		ancestor = readBaseline(rev);
	} catch {
		console.error(`jscpd baseline base ${rev} is not available; fetch that commit before lint`);
		process.exit(1);
	}
	const added = addedFingerprints(JSON.parse(ancestor), current);
	if (added.length > 0) {
		console.error(
			`jscpd baseline added ${added.length} fingerprint(s); baseline changes are remove-only`
		);
		for (const key of added) console.error(key);
		process.exit(1);
	}
	console.log(`jscpd baseline compared with ${rev}: ${count} fingerprints, ceiling ${CEILING}`);
}
