// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingDelayGroup.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `DelayGroup` is the provider's context value and `DelayGroupMember` is `useDelayGroup`.
// The delay and the active id are plain fields, like upstream's refs. Only `isInstantPhase`
// is reactive, so a member that is not part of a change does not update.
// Members without a provider share one inert group, as in upstream's default context value.

import { createContext, untrack } from 'svelte';
import {
	createChangeEventDetails,
	REASONS,
	ScopedTimeout,
	type Timeout,
	type BaseUIChangeEventDetails
} from '@sveltery/utils';
import { getDelay, type HoverDelay } from '../hooks/useHoverShared.js';
import type { FloatingRootStore } from './FloatingRootStore.svelte.js';

export type Delay = HoverDelay;

interface ActiveMember {
	onOpenChange: (open: boolean, details: BaseUIChangeEventDetails<string>) => void;
	setInstantPhase: (value: boolean) => void;
}

interface DelayGroupState {
	readonly hasProvider: boolean;
	readonly timeoutMs: number;
	/** The delay members should use right now. */
	delay: Delay;
	/** The delay when the group is idle. */
	initialDelay: Delay;
	/** Id of the floating element that keeps the group active. */
	currentId: string | null;
	currentMember: ActiveMember | null;
	readonly timeout: Pick<Timeout, 'start' | 'clear'>;
}

export interface DelayGroupProps {
	/** The delay used while the group is not in its instant phase. */
	delay: Delay;
	/**
	 * How long grouping lasts after the close delay ends. Raise it when there is no close delay.
	 */
	timeoutMs?: number;
}

export class DelayGroup implements DelayGroupState {
	readonly hasProvider = true;
	delay: Delay;
	initialDelay: Delay;
	currentId: string | null = null;
	currentMember: ActiveMember | null = null;
	readonly timeout = new ScopedTimeout();

	constructor(private readonly props: () => DelayGroupProps) {
		this.delay = this.initialDelay = untrack(() => props().delay);

		$effect(() => {
			const delay = this.props().delay;
			this.initialDelay = delay;
			if (!this.currentId) {
				this.delay = delay;
				return;
			}
			this.delay = { open: getDelay(this.delay, 'open'), close: getDelay(delay, 'close') };
		});
	}

	get timeoutMs() {
		return this.props().timeoutMs ?? 0;
	}
}

const NO_PROVIDER: DelayGroupState = {
	hasProvider: false,
	timeoutMs: 0,
	delay: 0,
	initialDelay: 0,
	currentId: null,
	currentMember: null,
	timeout: { start() {}, clear() {} }
};

export const [getDelayGroup, setDelayGroup, hasDelayGroup] = createContext<DelayGroup>();

/** Joins the surrounding `FloatingDelayGroup`, if any, for one floating element. */
export class DelayGroupMember {
	/** True while a neighbour hands the group over, so animations should be skipped. */
	isInstantPhase = $state(false);
	readonly #group: DelayGroupState = hasDelayGroup() ? getDelayGroup() : NO_PROVIDER;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => { open: boolean }
	) {
		const group = this.#group;
		const id = store.floatingId;

		$effect(() => {
			const open = this.props().open;
			if (!group.currentId) return;

			if (!open && group.currentId === id) {
				this.isInstantPhase = false;
				const timeoutMs = group.timeoutMs;
				if (timeoutMs) {
					group.timeout.start(timeoutMs, () => {
						// Another floating element may have taken over the group.
						if (store.isOpen() || (group.currentId && group.currentId !== id)) return;
						this.#unset();
					});
				} else {
					this.#unset();
				}
			}
		});

		$effect(() => {
			if (!this.props().open) return;
			const previous = group.currentMember;
			const previousId = group.currentId;

			// The pending reset would put the delay back while this element is open.
			group.timeout.clear();
			group.currentMember = {
				onOpenChange: (next, details) => store.setOpen(next, details),
				setInstantPhase: (value) => (this.isInstantPhase = value)
			};
			group.currentId = id;
			group.delay = { open: 0, close: getDelay(group.initialDelay, 'close') };

			if (previousId !== null && previousId !== id) {
				this.isInstantPhase = true;
				previous?.setInstantPhase(true);
				previous?.onOpenChange(false, createChangeEventDetails(REASONS.none));
			} else {
				this.isInstantPhase = false;
				previous?.setInstantPhase(false);
			}
		});

		$effect(() => () => {
			if (group.currentId !== id) return;
			group.currentMember = null;
			if (!untrack(() => this.props().open)) return;
			group.currentId = null;
			group.delay = group.initialDelay;
			group.timeout.clear();
		});
	}

	#unset() {
		const group = this.#group;
		group.currentMember?.setInstantPhase(false);
		group.currentId = null;
		group.currentMember = null;
		group.delay = group.initialDelay;
		group.timeout.clear();
	}

	/** The delay to give the hover interaction. Read it when the event fires. */
	get delay() {
		return this.#group.delay;
	}

	get hasProvider() {
		return this.#group.hasProvider;
	}

	/** Id of the floating element that keeps the group active. */
	get currentId() {
		return this.#group.currentId;
	}
}
