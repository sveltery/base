// Derived from Base UI v1.9.0
// packages/react/src/internals/field-register-control/useRegisterFieldControl.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// One registration per control. The form reads `getValue` when it submits.
// Value changes do not unregister and register again.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { FieldContext } from '../field/model.svelte.js';
import type { FormContextValue } from './form-context.js';
import { useValueChanged } from './useValueChanged.svelte.js';

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
	/** Host node for `attachFieldControl`. The attachment owns register and release. */
	private host: HTMLElement | null = null;
	private appliedEnabled = false;
	private appliedId: string | undefined;
	private appliedName: string | undefined;

	constructor(
		private readonly field: FieldContext,
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

	/** Re-apply id, name, and enabled. The attachment registers the element. */
	watchIdentity() {
		$effect(() => {
			const enabled = this.read.enabled();
			const id = this.read.id();
			const name = this.read.name();
			untrack(() => {
				const changed =
					enabled !== this.appliedEnabled || id !== this.appliedId || name !== this.appliedName;
				this.appliedEnabled = enabled;
				this.appliedId = id;
				this.appliedName = name;
				if (!this.host || !changed) return;
				this.apply({ enabled, id, name, element: this.host });
			});
		});
	}

	connect(node: HTMLElement) {
		this.host = node;
		untrack(() => {
			const enabled = this.read.enabled();
			const id = this.read.id();
			const name = this.read.name();
			this.appliedEnabled = enabled;
			this.appliedId = id;
			this.appliedName = name;
			this.apply({ enabled, id, name, element: node });
		});
		return () => {
			if (this.host !== node) return;
			this.host = null;
			untrack(() => this.release());
		};
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
export function watchFieldControl(field: FieldContext, read: FieldControlRead) {
	new FieldRegistration(field, read).watch(read.element);
}

/**
 * The attachment publishes the host element. Registration stays on one source.
 */
export function attachFieldControl(
	field: FieldContext,
	read: Omit<FieldControlRead, 'element'>
): Attachment<HTMLElement> {
	const registration = new FieldRegistration(field, read);
	registration.watchIdentity();
	return (node) => registration.connect(node);
}

/**
 * Reports a choice control's value to its Field and Form: filled on every value, and on
 * each change after the first, clears the Form error, sets dirty against the Field's
 * initial value, and runs change validation. Construct during component init.
 */
export class FieldValueSync<T> {
	constructor(
		field: FieldContext,
		form: FormContextValue,
		read: {
			value: () => T;
			name: () => string | undefined;
			filled: (value: T) => boolean;
			equals?: (value: T, initial: unknown) => boolean;
		}
	) {
		const equals = read.equals ?? ((value, initial) => value === initial);
		$effect(() => {
			field.setFilled(read.filled(read.value()));
		});
		useValueChanged(read.value, (next) => {
			form.clearErrors(read.name());
			field.setDirty(!equals(next, field.validityData.initialValue));
			field.change(next);
		});
	}
}
