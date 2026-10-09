// The listener set for TabsListModel.registerIndicatorUpdateListener.
// `svelte/prefer-svelte-reactivity` flags `new Set` in an exported class in a
// `.svelte.ts` file. The set is created here, in a plain module that rule does
// not scan. Registration (add, delete, notify) stays on the list model.

const listeners = new WeakMap<object, Set<() => void>>();

export function indicatorListeners(owner: object): Set<() => void> {
	let set = listeners.get(owner);
	if (!set) {
		set = new Set();
		listeners.set(owner, set);
	}
	return set;
}
