// Derived from Base UI v1.8.0 packages/react/src/utils/usePopupViewport.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The first flush only records the trigger id and payload. Later id changes remount
// the current pane, and a payload that arrives on the next flush remounts once more.

export function usePopupContentKey(
	activeTriggerId: () => string | null | undefined,
	payload: () => unknown
) {
	let key = $state(0);
	let previousId: string | null | undefined;
	let previousPayload: unknown;
	let pendingPayload = false;
	let seeded = false;

	$effect.pre(() => {
		const nextId = activeTriggerId();
		const nextPayload = payload();
		if (!seeded) {
			seeded = true;
			previousId = nextId;
			previousPayload = nextPayload;
			return;
		}
		const triggerIdChanged = nextId !== previousId;
		const payloadChanged = !Object.is(nextPayload, previousPayload);
		if (triggerIdChanged) {
			key += 1;
			pendingPayload = !payloadChanged;
		} else if (pendingPayload && payloadChanged) {
			key += 1;
			pendingPayload = false;
		}
		previousId = nextId;
		previousPayload = nextPayload;
	});

	return {
		get current() {
			return `${activeTriggerId() ?? 'current'}-${key}`;
		}
	};
}
