// Derived from Base UI v1.8.0 packages/react/src/internals/labelable-provider/LabelableProvider.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

const LABELABLE_CONTEXT = Symbol('labelable');

/**
 * Accessible name and description for one labelable scope.
 * `controlId` starts as the generated id so the label's `for` and the control's
 * `id` match in server HTML, before a control claims an explicit id.
 * `null` means the label omits `for`.
 */
export class Labelable {
	controlId = $state<string | null | undefined>(undefined);
	labelId = $state<string | undefined>(undefined);
	messageIds = $state<string[]>([]);
	readonly parent: Labelable | undefined;
	private readonly registrations = new SvelteMap<symbol, string | null>();
	private readonly readDefaultId: () => string;

	constructor(parent: Labelable | undefined, readDefaultId: () => string) {
		this.parent = parent;
		this.readDefaultId = readDefaultId;
		this.controlId = readDefaultId();
	}

	registerControlId(source: symbol, nextId: string | null | undefined) {
		if (nextId === undefined) this.registrations.delete(source);
		else this.registrations.set(source, nextId);

		if (this.registrations.size === 0) return;

		const previous = this.controlId;
		let next: string | null | undefined;
		for (const id of this.registrations.values()) {
			if (id === previous) return;
			if (next === undefined) next = id;
		}
		this.controlId = next;
	}

	resetControlId() {
		if (this.registrations.size === 0) this.controlId = this.readDefaultId();
	}

	setLabelId(next: string | undefined | ((current: string | undefined) => string | undefined)) {
		const current = untrack(() => this.labelId);
		this.labelId = typeof next === 'function' ? next(current) : next;
	}

	setMessageIds(next: string[] | ((current: string[]) => string[])) {
		const current = untrack(() => this.messageIds);
		this.messageIds = typeof next === 'function' ? next(current) : next;
	}

	/** Parent descriptions, then this scope's, merged with an author `aria-describedby`. */
	describedBy(external: string | undefined): string | undefined {
		const ids = external ? external.split(' ').filter(Boolean) : [];
		if (this.parent) ids.push(...this.parent.messageIds);
		ids.push(...this.messageIds);
		const unique: string[] = [];
		for (const id of ids) {
			if (!unique.includes(id)) unique.push(id);
		}
		return unique.length > 0 ? unique.join(' ') : undefined;
	}
}

export function setLabelableContext(labelable: Labelable) {
	setContext(LABELABLE_CONTEXT, labelable);
}

export function useLabelableContext(optional: true): Labelable | undefined;
export function useLabelableContext(optional?: false): Labelable;
export function useLabelableContext(optional = false) {
	if (!hasContext(LABELABLE_CONTEXT)) {
		if (optional) return undefined;
		throw new Error(
			'Base UI: LabelableContext is missing. Field parts must be placed within <Field.Root>.'
		);
	}
	return getContext<Labelable>(LABELABLE_CONTEXT);
}
