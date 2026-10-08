// Derived from Base UI v1.8.0
// packages/react/src/internals/field-register-control/useRegisterFieldControl.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One registration per control. The form reads `getValue` when it submits.
// Value changes do not unregister and register again.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { FieldRootModel } from '../field/model.svelte.js';

export interface FieldControlRead {
	enabled: () => boolean;
	id: () => string | undefined;
	name: () => string | undefined;
	element: () => HTMLElement | null;
	getValue: () => unknown;
}

interface PublishedControl {
	enabled: boolean;
	id: string | undefined;
	name: string | undefined;
	element: HTMLElement | null;
}

class FieldRegistration {
	private registered = false;
	private readonly source = Symbol();
	/** Host node from the attachment. The effect re-reads this when it changes. */
	element = $state<HTMLElement | null>(null);

	constructor(
		private readonly field: FieldRootModel,
		private readonly read: Omit<FieldControlRead, 'element'>
	) {}

	watch(element: () => HTMLElement | null) {
		$effect(() => {
			const next = {
				enabled: this.read.enabled(),
				id: this.read.id(),
				name: this.read.name(),
				element: element()
			};
			untrack(() => this.apply(next));
		});

		$effect(() => {
			return () => this.release();
		});
	}

	private apply(next: PublishedControl) {
		if (!next.enabled || !next.element) {
			this.release();
			return;
		}
		this.registered = true;
		this.field.registerControl(this.source, {
			id: next.id,
			name: next.name,
			element: next.element,
			getValue: this.read.getValue
		});
	}

	private release() {
		if (!this.registered) return;
		this.registered = false;
		this.field.registerControl(this.source, undefined);
	}
}

/**
 * Keep the field's control registration in step with `read`.
 * Call this while the component is initializing. `getValue` is not read here.
 */
export function watchFieldControl(field: FieldRootModel, read: FieldControlRead) {
	new FieldRegistration(field, read).watch(read.element);
}

/**
 * The attachment publishes the host element. Registration stays on one source.
 */
export function attachFieldControl(
	field: FieldRootModel,
	read: Omit<FieldControlRead, 'element'>
): Attachment<HTMLElement> {
	const registration = new FieldRegistration(field, read);
	registration.watch(() => registration.element);
	return (node) => {
		registration.element = node;
		return () => {
			if (registration.element === node) registration.element = null;
		};
	};
}
