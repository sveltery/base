// Derived from Base UI v1.8.0 packages/react/src/collapsible/root/CollapsibleRootContext.ts
// and packages/react/src/collapsible/root/useCollapsibleRoot.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
import type {
	CollapsibleRootChangeEventDetails,
	CollapsibleRootChangeEventReason,
	CollapsibleRootState
} from './types.js';
import { defineContext } from '../internal/context.js';

export class CollapsibleRoot {
	/** `undefined` keeps the generated id. `null` means the panel unmounted. */
	registeredPanelId = $state<string | null | undefined>(undefined);

	readonly readOpen: () => boolean;
	// The ending phase waits one frame so the panel can measure before closed styles apply.
	private readonly transition: TransitionStatus;
	readonly writeOpen: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
	readonly readDisabled: () => boolean;
	readonly onOpenChange:
		((open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void) | undefined;
	readonly defaultPanelId: string;

	constructor(
		readOpen: () => boolean,
		writeOpen: (open: boolean, details: CollapsibleRootChangeEventDetails) => void,
		readDisabled: () => boolean,
		onOpenChange:
			((open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void) | undefined,
		defaultPanelId: string
	) {
		this.readOpen = readOpen;
		this.writeOpen = writeOpen;
		this.readDisabled = readDisabled;
		this.onOpenChange = onOpenChange;
		this.defaultPanelId = defaultPanelId;
		this.transition = new TransitionStatus(readOpen, {
			enableIdleState: true,
			deferEndingState: true
		});
	}

	get mounted(): boolean {
		return this.transition.mounted;
	}

	get transitionStatus() {
		return this.transition.transitionStatus;
	}

	get open(): boolean {
		return this.readOpen();
	}

	get disabled(): boolean {
		return this.readDisabled();
	}

	get state(): CollapsibleRootState {
		return {
			open: this.open,
			disabled: this.disabled,
			transitionStatus: this.transitionStatus
		};
	}

	get panelId(): string | undefined {
		if (this.registeredPanelId === null) return undefined;
		return this.registeredPanelId ?? this.defaultPanelId;
	}

	registerPanel(registeredId: string | undefined) {
		// The registration effect must not subscribe to the id it writes.
		const current = untrack(() => this.registeredPanelId);
		const next = registeredId ?? (current === null ? undefined : current);
		if (next !== current) this.registeredPanelId = next;
	}

	unregisterPanel(registeredId: string | undefined) {
		const current = untrack(() => this.registeredPanelId);
		if (current === registeredId) this.registeredPanelId = null;
	}

	setMounted(next: boolean) {
		this.transition.setMounted(next);
	}

	/**
	 * Asks `onOpenChange`, then writes `open` unless the caller cancels.
	 * Returns whether the open state was written.
	 */
	requestOpen(next: boolean, event: Event, reason: CollapsibleRootChangeEventReason): boolean {
		const details = createChangeEventDetails(reason, event);
		this.onOpenChange?.(next, details);
		if (details.isCanceled) return false;
		this.writeOpen(next, details);
		return true;
	}

	handleTrigger(event: Event) {
		this.requestOpen(!this.open, event, REASONS.triggerPress);
	}
}

export const [useCollapsibleRootContext, setCollapsibleRootContext] =
	defineContext<CollapsibleRoot>(
		'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.'
	);
