// Derived from Base UI v1.8.0 packages/react/src/popover/store/PopoverHandle.ts
// and packages/react/src/utils/popups/popupHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Detached triggers read `current`. While no root is attached they register on the
// inert store, whose setOpen does nothing.

import { DEV } from 'esm-env';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import { createControllableValue } from '../internal/controllable-value.svelte.js';
import { AnimationFrame } from '../internal/timeout.js';
import { PopoverStore } from './store.svelte.js';

class InertPopoverStore extends PopoverStore {
	override setOpen(_nextOpen: boolean, _details: Parameters<PopoverStore['setOpen']>[1]) {}
}

export class PopoverHandle<Payload = unknown> {
	current = $state<PopoverStore | null>(null);
	readonly fallback: PopoverStore;
	private fallbackOpen = $state<boolean | undefined>(undefined);
	private readonly attached: PopoverStore[] = [];
	private readonly overlapFrame = AnimationFrame.create();

	constructor() {
		const value = createControllableValue<boolean>({
			getProp: () => this.fallbackOpen,
			setProp: (next) => {
				this.fallbackOpen = next;
			},
			getDefault: () => false
		});
		this.fallback = new InertPopoverStore({
			open: value,
			floatingId: 'popover-detached',
			nested: false,
			readModal: () => false,
			readTriggerId: () => null,
			onOpenChange: () => undefined,
			onOpenChangeComplete: () => undefined
		});
	}

	get isOpen() {
		return this.current?.open ?? false;
	}

	get payload(): Payload | undefined {
		return this.current?.payload as Payload | undefined;
	}

	attach(store: PopoverStore) {
		this.attached.push(store);
		this.current = store;
		if (DEV && this.attached.length > 1) {
			this.overlapFrame.request(() => {
				if (this.attached.length > 1) {
					console.warn(
						'Base UI: A handle is attached to more than one mounted root at the same time. ' +
							'The most recently mounted root takes over and the previous one stops being controlled by the handle. ' +
							'A handle should be used by a single root that stays mounted for the lifetime of the handle.'
					);
				}
			});
		}
		return () => {
			const index = this.attached.lastIndexOf(store);
			if (index !== -1) this.attached.splice(index, 1);
			this.current = this.attached[this.attached.length - 1] ?? null;
		};
	}

	open(triggerId: string) {
		const store = this.current;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: PopoverHandle.open() was called while no root using this handle is mounted. ' +
						'The call was ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}
		let trigger = store.triggers.getById(triggerId);
		if (!trigger) {
			for (let index = this.attached.length - 1; index >= 0 && !trigger; index -= 1) {
				trigger = this.attached[index].triggers.getById(triggerId);
			}
		}
		trigger ??= this.fallback.triggers.getById(triggerId);
		if (!trigger) {
			throw new Error(
				`Base UI: PopoverHandle.open() was called with the trigger id "${triggerId}", ` +
					'but no matching trigger is registered with this handle. ' +
					'An anchored popup cannot open without a trigger to anchor to. ' +
					'Pass the id of a mounted Popover.Trigger that has this handle set on its "handle" prop.'
			);
		}
		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction, undefined, trigger));
	}

	close() {
		if (!this.current) {
			if (DEV) {
				console.warn(
					'Base UI: PopoverHandle.close() was called while no root using this handle is mounted. ' +
						'The call was ignored.'
				);
			}
			return;
		}
		this.current.closeImperative();
	}

	unmount() {
		this.current?.forceUnmount();
	}
}

export function createPopoverHandle<Payload = unknown>() {
	return new PopoverHandle<Payload>();
}
