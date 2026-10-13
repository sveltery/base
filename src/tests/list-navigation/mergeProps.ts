// Calls each bag's handler in order, like upstream's `useTestInteractions` prop getters.

import type { HTMLAttributes } from 'svelte/elements';

export function mergeProps(...bags: object[]): HTMLAttributes<HTMLElement> {
	const merged: Record<string, unknown> = {};
	for (const bag of bags) {
		for (const [key, value] of Object.entries(bag)) {
			const previous = merged[key];
			if (key.startsWith('on') && typeof previous === 'function' && typeof value === 'function') {
				merged[key] = (event: Event) => {
					previous(event);
					value(event);
				};
			} else {
				merged[key] = value;
			}
		}
	}
	return merged;
}
