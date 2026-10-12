// Derived from Base UI v1.8.0 packages/react/src/internals/labelable-provider/LabelableProvider.tsx,
// useLabelableId.ts and useAriaLabelledBy.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { findAssociatedLabel } from '../internal/associated-label.js';
import { defineContext } from '../internal/context.js';

/**
 * Accessible name and description for one labelable scope.
 * `controlId` starts as the generated id so the label's `for` and the control's
 * `id` match in server HTML, before a control claims an explicit id.
 * `null` means the label omits `for`.
 */
export class Labelable {
	controlId = $state<string | null | undefined>(undefined);
	labelId = $state<string | undefined>(undefined);
	messageIds = new SvelteSet<string>();
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

	setLabelId(next: string | undefined) {
		this.labelId = next;
	}

	addMessageId(id: string) {
		this.messageIds.add(id);
	}

	deleteMessageId(id: string) {
		this.messageIds.delete(id);
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

export const [useLabelableContext, setLabelableContext, findLabelableContext] =
	defineContext<Labelable>(
		'Base UI: LabelableContext is missing. Field parts must be placed within <Field.Root>.'
	);

/**
 * A control's id within its labelable scope. An explicit `id` claims the scope, so
 * the label's `for` follows it. `id: null` makes the label omit `for`, for a group
 * that takes its name from `aria-labelledby`. Construct during component init.
 */
export class LabelableId {
	private readonly source = Symbol();
	private hadExplicitId = false;

	constructor(
		private readonly labelable: Labelable | undefined,
		private readonly read: {
			id: () => string | null | undefined;
			fallback: () => string;
			/** False when the control shares a scope it does not own, such as a radio in its group. */
			enabled?: () => boolean;
		}
	) {
		$effect(() => {
			const scope = this.labelable;
			if (!scope) return;
			const enabled = this.read.enabled?.() ?? true;
			const explicit = this.read.id();
			const fallback = this.read.fallback();
			untrack(() => {
				if (!enabled) {
					scope.registerControlId(this.source, undefined);
				} else if (explicit !== undefined) {
					this.hadExplicitId = true;
					scope.registerControlId(this.source, explicit);
				} else if (this.hadExplicitId) {
					scope.registerControlId(this.source, fallback);
				} else {
					scope.registerControlId(this.source, undefined);
					scope.resetControlId();
				}
			});
			return () => {
				untrack(() => scope.registerControlId(this.source, undefined));
			};
		});
	}

	/** The scope's id wins so server HTML pairs the label with the control before registration runs. */
	get current(): string {
		const owned = (this.read.enabled?.() ?? true) ? this.labelable?.controlId : undefined;
		return owned || this.read.id() || this.read.fallback();
	}
}

/**
 * `aria-labelledby` for a non-native control: the explicit value, then the Field label,
 * then a native `<label>` wrapped around or pointing at its hidden input.
 */
export class AriaLabelledBy {
	private fallback = $state<string | undefined>(undefined);

	constructor(
		private readonly labelable: Labelable | undefined,
		private readonly read: {
			explicit: () => string | undefined;
			/** The hidden input, or null when the host is a native button. */
			input: () => HTMLInputElement | null;
			/** Id for a native label that has none. */
			labelId: () => string | undefined;
		}
	) {
		// Client-only: a wrapping or sibling <label> is not known during SSR. Assigning
		// the label's id is a DOM write, so it stays in an effect.
		$effect(() => {
			const input = this.read.input();
			const sourceId = this.read.labelId();
			if (this.read.explicit() || this.labelable?.labelId || !input) {
				this.fallback = undefined;
				return;
			}
			const label = findAssociatedLabel(input);
			if (label && !label.id && sourceId) label.id = sourceId;
			this.fallback = label?.id || undefined;
		});
	}

	get current(): string | undefined {
		return this.read.explicit() ?? this.labelable?.labelId ?? this.fallback;
	}
}
