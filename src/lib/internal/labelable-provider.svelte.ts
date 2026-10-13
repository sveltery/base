// Derived from Base UI v1.9.0 packages/react/src/internals/labelable-provider/LabelableProvider.tsx,
// useLabelableId.ts and useAriaLabelledBy.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { getAbortSignal, tick, untrack } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { findAssociatedLabel } from './associated-label.js';
import { defineContext } from './context.js';

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
export class LabelableId<Fallback extends string | undefined = undefined> {
	private readonly source = Symbol();
	private hadExplicitId = false;
	private readonly enabled: boolean;

	constructor(
		private readonly labelable: Labelable | undefined,
		private readonly read: {
			id: () => string | null | undefined;
			/** The id when nothing claims the scope. A group that only omits `for` has none. */
			fallback?: () => Fallback;
			/** False when the control shares a scope it does not own, such as a radio in its group. */
			enabled?: () => boolean;
		}
	) {
		this.enabled = $derived(this.read.enabled?.() ?? true);
		$effect(() => {
			const scope = this.labelable;
			if (!scope) return;
			const enabled = this.enabled;
			const explicit = this.read.id();
			const fallback = this.read.fallback?.();
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
	get current(): string | Fallback {
		const owned = this.enabled ? this.labelable?.controlId : undefined;
		return (owned || this.read.id() || this.read.fallback?.()) as string | Fallback;
	}
}

/**
 * `aria-labelledby` for a non-native control: the explicit value, then the Field label,
 * then a native `<label>` wrapped around or pointing at its hidden input. A non-blank
 * `aria-label` replaces the last two, as it does on a native input.
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
			ariaLabel?: () => string | null | undefined;
		}
	) {
		// Client-only: a wrapping or sibling <label> is not known during SSR. Assigning
		// the label's id is a DOM write, so it stays in an effect.
		$effect(() => {
			const input = this.read.input();
			const sourceId = this.read.labelId();
			if (this.read.explicit() || this.labelable?.labelId || this.hasAriaLabel || !input) {
				this.fallback = undefined;
				return;
			}
			const signal = getAbortSignal();
			// A control id claimed in this flush reaches the input's `id` attribute only after
			// this effect, and the label lookup reads the DOM.
			void tick().then(() => {
				if (signal.aborted) return;
				const label = findAssociatedLabel(input);
				if (label && !label.id && sourceId) label.id = sourceId;
				this.fallback = label?.id || undefined;
			});
		});
	}

	private get hasAriaLabel(): boolean {
		return Boolean(this.read.ariaLabel?.()?.trim());
	}

	get current(): string | undefined {
		const implicit = this.hasAriaLabel ? undefined : this.labelable?.labelId;
		return this.read.explicit() ?? implicit ?? this.fallback;
	}
}
