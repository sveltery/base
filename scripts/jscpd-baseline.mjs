import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

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

function ancestorBaseline() {
	for (const rev of ['origin/main', 'HEAD']) {
		try {
			const text = execFileSync('git', ['show', `${rev}:.jscpd-baseline.json`], { encoding: 'utf8' });
			console.log(`jscpd baseline compared with ${rev}`);
			return text;
		} catch {
			console.log(`jscpd baseline base ${rev} is not available`);
		}
	}
	return null;
}

const isCli = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
	const current = JSON.parse(fs.readFileSync('.jscpd-baseline.json', 'utf8'));
	const ancestor = ancestorBaseline();
	if (ancestor == null) {
		console.error('jscpd baseline has no ancestor to compare');
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
}
