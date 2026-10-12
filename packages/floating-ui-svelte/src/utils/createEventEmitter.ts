// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/createEventEmitter.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export interface FloatingEvents {
	emit(event: string, data?: unknown): void;
	on(event: string, listener: (data?: unknown) => void): void;
	off(event: string, listener: (data?: unknown) => void): void;
}

export function createEventEmitter(): FloatingEvents {
	const map = new Map<string, Set<(data?: unknown) => void>>();
	return {
		emit(event, data) {
			map.get(event)?.forEach((listener) => listener(data));
		},
		on(event, listener) {
			const set = map.get(event) ?? new Set();
			set.add(listener);
			map.set(event, set);
		},
		off(event, listener) {
			map.get(event)?.delete(listener);
		}
	};
}
