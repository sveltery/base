// Derived from Base UI v1.8.0 packages/react/src/fieldset/root/FieldsetRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, hasContext, setContext } from 'svelte';

const FIELDSET_ROOT_CONTEXT = Symbol('fieldset-root');

export type LegendIdUpdate =
	string | undefined | ((current: string | undefined) => string | undefined);

/**
 * One fieldset's shared state.
 * `disabled` is the ancestor flag OR this root's own prop, read live so nested
 * roots stay disabled through SSR and later updates.
 * `setLegendId` accepts functional updates so an older legend's cleanup cannot
 * clear a newer registration.
 */
export class FieldsetRootContextValue {
	legendId = $state<string | undefined>(undefined);
	readonly parent: FieldsetRootContextValue | undefined;
	readonly readDisabledProp: () => boolean;

	constructor(parent: FieldsetRootContextValue | undefined, readDisabledProp: () => boolean) {
		this.parent = parent;
		this.readDisabledProp = readDisabledProp;
	}

	get disabled(): boolean {
		return Boolean(this.parent?.disabled) || this.readDisabledProp();
	}

	setLegendId = (next: LegendIdUpdate) => {
		this.legendId = typeof next === 'function' ? next(this.legendId) : next;
	};
}

export function setFieldsetRootContext(context: FieldsetRootContextValue) {
	setContext(FIELDSET_ROOT_CONTEXT, context);
}

export function useFieldsetRootContext(optional: true): FieldsetRootContextValue | undefined;
export function useFieldsetRootContext(optional?: false): FieldsetRootContextValue;
export function useFieldsetRootContext(optional = false) {
	if (!hasContext(FIELDSET_ROOT_CONTEXT)) {
		if (optional) return undefined;
		throw new Error(
			'Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.'
		);
	}
	return getContext<FieldsetRootContextValue>(FIELDSET_ROOT_CONTEXT);
}
