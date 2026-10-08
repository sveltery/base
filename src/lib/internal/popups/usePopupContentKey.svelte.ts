// Derived from Base UI v1.8.0 packages/react/src/utils/usePopupViewport.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The current pane remounts when the active trigger id or the payload identity
// changes. The key is read from those values directly. An effect that diffs the
// previous id and payload is the React hook; this port does not copy that.

const objectIdentities = new WeakMap<object, number>();
let nextObjectIdentity = 0;

function payloadIdentity(payload: unknown) {
	if (typeof payload === 'object' && payload !== null) {
		let identity = objectIdentities.get(payload);
		if (identity === undefined) {
			identity = nextObjectIdentity;
			nextObjectIdentity += 1;
			objectIdentities.set(payload, identity);
		}
		return `obj:${identity}`;
	}
	return `val:${String(payload)}`;
}

export function usePopupContentKey(
	activeTriggerId: () => string | null | undefined,
	payload: () => unknown
) {
	return {
		get current() {
			return `${activeTriggerId() ?? 'current'}-${payloadIdentity(payload())}`;
		}
	};
}
