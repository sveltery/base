// Derived from Base UI v1.8.0 packages/react/src/internals/useValueChanged.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';

/**
 * Runs `onChange` after the DOM update whenever `read()` changes, whether a
 * handler or the parent wrote it. The first value does not count. The effect
 * re-runs only when what `read()` depends on changes, so `read` should return
 * a `$derived` or a prop.
 */
export function useValueChanged<T>(read: () => T, onChange: (next: T) => void) {
	let mounted = false;
	$effect(() => {
		const next = read();
		if (!mounted) {
			mounted = true;
			return;
		}
		untrack(() => onChange(next));
	});
}
