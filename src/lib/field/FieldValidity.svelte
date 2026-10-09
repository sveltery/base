<!--
	Renders a custom message from the field's validity.
	Derived from Base UI v1.8.0 packages/react/src/field/validity/FieldValidity.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { hasContext } from 'svelte';
	import { useFieldContext } from './context.svelte.js';
	import { FIELD_ROOT_PRESENT } from './root-present.js';
	import { FieldTransition } from './transition.svelte.js';
	import type { FieldValidityProps, FieldValidityState } from './types.js';
	import { getCombinedFieldValidityData } from './validity.js';

	let { children }: FieldValidityProps = $props();

	if (!hasContext(FIELD_ROOT_PRESENT)) {
		throw new Error(
			'Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.'
		);
	}
	const field = useFieldContext();
	const combined = $derived(getCombinedFieldValidityData(field.validityData, field.invalid));
	const invalid = $derived(combined.state.valid === false);
	const transition = new FieldTransition(() => invalid);

	const validityState: FieldValidityState = $derived({
		error: combined.error,
		errors: combined.errors,
		value: combined.value,
		initialValue: combined.initialValue,
		validity: combined.state,
		transitionStatus: transition.transitionStatus
	});
</script>

{@render children?.(validityState)}
