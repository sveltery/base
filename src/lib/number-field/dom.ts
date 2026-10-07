// Derived from Base UI v1.8.0 packages/utils/src/addEventListener.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `activeElement`, `getTarget`, `ownerDocument`, and `ownerWindow` live in `src/lib/internal`.

export function addEventListener(
	target: EventTarget,
	type: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions
) {
	target.addEventListener(type, listener, options);
	return () => {
		target.removeEventListener(type, listener, options);
	};
}
