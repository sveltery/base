// Derived from Base UI v1.8.0 packages/react/src/collapsible/root/CollapsibleRootContext.ts
// and packages/react/src/internals/useTransitionStatus.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// `useTransitionStatus(open, true, true)`: idle between starting and ending, and the
// ending phase waits one frame so the panel can measure before closed styles apply.

import { getContext, setContext, untrack } from 'svelte';
import { useAnimationFrame } from '../internal/timeout.svelte.js';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import type {
	CollapsibleRootChangeEventDetails,
	CollapsibleRootChangeEventReason,
	CollapsibleRootState,
	TransitionStatus
} from './types.js';

const COLLAPSABLE_ROOT_CONTEXT = Symbol('collapsible-root');

export class CollapsibleRoot {
	mounted = $state(false);
	transitionStatus = $state<TransitionStatus>(undefined);
	/** `undefined` keeps the generated id. `null` means the panel unmounted. */
	registeredPanelId = $state<string | null | undefined>(undefined);

	readonly readOpen: () => boolean;
	private readonly endingFrame = useAnimationFrame();
	private readonly idleFrame = useAnimationFrame();
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

		const initiallyOpen = readOpen();
		this.mounted = initiallyOpen;
		this.transitionStatus = initiallyOpen ? 'idle' : undefined;

		// Same-flush phase changes land before the DOM update, matching the
		// setState-during-render path that puts `data-starting-style` on the first open frame.
		$effect.pre(() => {
			const open = this.readOpen();
			if (open && !this.mounted) {
				this.mounted = true;
				this.transitionStatus = 'starting';
			} else if (open && this.mounted && this.transitionStatus === 'ending') {
				this.transitionStatus = 'starting';
			}
			if (!open && !this.mounted && this.transitionStatus === 'ending') {
				this.transitionStatus = undefined;
			}
		});

		// Ending waits a frame so the panel measures the expanded size first.
		$effect(() => {
			const open = this.readOpen();
			const mounted = this.mounted;
			const status = this.transitionStatus;
			if (open || !mounted || status === 'ending') return;
			this.endingFrame.request(() => {
				this.transitionStatus = 'ending';
			});
			return () => this.endingFrame.cancel();
		});

		// Starting settles to idle on the next frame so CSS can see both styles.
		$effect(() => {
			const open = this.readOpen();
			if (!open) return;
			if (this.mounted && this.transitionStatus !== 'idle') {
				this.transitionStatus = 'starting';
			}
			this.idleFrame.request(() => {
				this.transitionStatus = 'idle';
			});
			return () => this.idleFrame.cancel();
		});
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
		this.mounted = next;
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

export function setCollapsibleRootContext(context: CollapsibleRoot) {
	setContext(COLLAPSABLE_ROOT_CONTEXT, context);
}

export function useCollapsibleRootContext(): CollapsibleRoot {
	const context = getContext<CollapsibleRoot | undefined>(COLLAPSABLE_ROOT_CONTEXT);
	if (context === undefined) {
		throw new Error(
			'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.'
		);
	}
	return context;
}
