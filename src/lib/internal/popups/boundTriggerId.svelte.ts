// Derived from Base UI v1.9.0 packages/react/src/utils/popups/popupStoreUtils.ts
// (`useOpenStateTransitions` onUnmount) and packages/react/src/utils/popups/store.ts
// (`activeTriggerIdSelector`) (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Upstream keeps the `triggerId` prop apart from the store's own `activeTriggerId`. The port
// carries both in one `$bindable` prop, so it remembers which id the store wrote there.

import { untrack } from 'svelte';

export class BoundTriggerId {
	/** Id written for this open. Survives a bound trigger id that the parent sets back. */
	claimed: string | null = null;
	/** Last id the store wrote. An id the parent set is never cleared. */
	private written: string | null = null;

	constructor(
		popup: { readonly open: boolean; readonly mounted: boolean },
		readonly read: () => string | null | undefined,
		private readonly writeValue: (id: string | null) => void
	) {
		// Upstream resets `activeTriggerId` once the popup unmounts, so the next open without a
		// trigger claims the only trigger again, even one that remounted under a new id.
		$effect(() => {
			if (popup.open || popup.mounted) return;
			untrack(() => {
				if (this.written !== null && this.read() === this.written) this.writeValue(null);
				this.written = null;
				this.claimed = null;
			});
		});
	}

	write(id: string | null) {
		this.claimed = id;
		if ((this.read() ?? null) === id) return;
		this.written = id;
		this.writeValue(id);
	}
}
