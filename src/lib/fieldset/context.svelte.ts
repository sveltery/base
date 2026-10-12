// Derived from Base UI v1.8.0 packages/react/src/fieldset/root/FieldsetRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { defineContext } from '../internal/context.js';

/**
 * One fieldset's shared state.
 * `disabled` is the ancestor flag OR this root's own prop, read live so nested
 * roots stay disabled through SSR and later updates.
 * `setLegendId` assigns the next id. Cleanup clears it only when it is still current.
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

	setLegendId = (next: string | undefined) => {
		this.legendId = next;
	};
}

export const [useFieldsetRootContext, setFieldsetRootContext, findFieldsetRootContext] =
	defineContext<FieldsetRootContextValue>(
		'Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.'
	);
