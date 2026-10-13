// Derived from Base UI v1.9.0 packages/utils/src/createLogOnce.ts, warn.ts and error.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { DEV } from 'esm-env';

const logged = new Set<string>();

function createLogOnce(severity: 'warn' | 'error') {
	return (...messages: string[]) => {
		if (!DEV) return;
		const output = `Base UI: ${messages.join(' ')}`;
		const key = `${severity}:${output}`;
		if (logged.has(key)) return;
		logged.add(key);
		console[severity](output);
	};
}

/** Dev only. Writes each message to `console.warn` once, prefixed with `Base UI:`. */
export const warn = createLogOnce('warn');

/** Dev only. Writes each message to `console.error` once, prefixed with `Base UI:`. */
export const error = createLogOnce('error');

/** Forgets the logged messages, so a test can see a message again. */
export function resetLogged() {
	logged.clear();
}
