// Derived from Base UI v1.8.0 packages/react/src/popover/store/PopoverHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The attached store is `$state.raw`, so a trigger rendered before Root can read it.
// No `$effect`. Module-scope `Popover.createHandle()` does not create an effect.

import { DEV } from 'esm-env';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import { PopupTriggerMap } from '../internal/popups/popupTriggerMap.js';
import { AnimationFrame } from '../internal/timeout.js';
import type { PopoverStore } from './store.svelte.js';

export class PopoverHandle<Payload = unknown> {
	attached = $state.raw<PopoverStore | null>(null);
	readonly fallbackTriggers = new PopupTriggerMap();
	private readonly stack: PopoverStore[] = [];
	private overlapFrame: AnimationFrame | undefined;

	attachStore(store: PopoverStore) {
		this.stack.push(store);
		this.attached = store;
		if (DEV && this.stack.length > 1) {
			this.overlapFrame ??= AnimationFrame.create();
			this.overlapFrame.request(() => {
				if (this.stack.length > 1) {
					console.warn(
						'Base UI: A handle is attached to more than one mounted root at the same time. ' +
							'The most recently mounted root takes over and the previous one stops being controlled by the handle. ' +
							'A handle should be used by a single root that stays mounted for the lifetime of the handle.'
					);
				}
			});
		}
		return () => {
			const index = this.stack.lastIndexOf(store);
			if (index !== -1) this.stack.splice(index, 1);
			this.attached = this.stack[this.stack.length - 1] ?? null;
		};
	}

	get isOpen() {
		return this.attached?.open ?? false;
	}

	get payload(): Payload | undefined {
		return this.attached?.payload as Payload | undefined;
	}

	open(triggerId: string) {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: PopoverHandle.open() was called while no root using this handle is mounted. ' +
						'The call was ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}

		let trigger: Element | undefined;
		if (triggerId) {
			for (let index = this.stack.length - 1; index >= 0 && !trigger; index -= 1) {
				trigger = this.stack[index].triggers.getById(triggerId);
			}
			trigger ??= this.fallbackTriggers.getById(triggerId);
		}

		if (triggerId && !trigger) {
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
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: PopoverHandle.close() was called while no root using this handle is mounted. ' +
						'The call was ignored.'
				);
			}
			return;
		}
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	unmount() {
		this.attached?.forceUnmount();
	}
}

export function createPopoverHandle<Payload = unknown>() {
	return new PopoverHandle<Payload>();
}
