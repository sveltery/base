// Derived from Base UI v1.8.0 packages/react/src/utils/usePopupViewport.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The current pane remounts when the active trigger id changes. Upstream also
// remounts once more if the payload arrives on the next render. This port reads
// the active trigger's payload in the same flush as the id, so that second bump
// does not apply. A later payload change on the same trigger keeps the pane.

export function usePopupContentKey(activeTriggerId: () => string | null | undefined) {
	return {
		get current() {
			return activeTriggerId() ?? 'current';
		}
	};
}
