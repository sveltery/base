// Dev warnings use Base UI's createLogOnce shape: one console warning per message,
// prefixed with "Base UI:". packages/utils/src/warn.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { DEV } from 'esm-env';

const logged = new Set<string>();

/** Logs each dev warning once. Production builds stay quiet. */
export function devWarn(...messages: string[]) {
	if (!DEV) return;
	const output = `Base UI: ${messages.join(' ')}`;
	if (logged.has(output)) return;
	logged.add(output);
	console.warn(output);
}
