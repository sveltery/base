<!--
	Used to display a custom message based on the field's validity.
	Requires `children` to be a function that accepts field validity state as an argument.
	Derived from Base UI v1.9.0 packages/react/src/field/validity/FieldValidity.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { needFieldContext } from '../internal/field-root-context.js';
	import { useFormContext } from '../internal/form-context.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import type { FieldValidityProps, FieldValidityState } from './types.js';
	import { getShownFieldValidityData } from './validity.js';

	let { children }: FieldValidityProps = $props();

	const field = needFieldContext();
	const form = useFormContext();
	const combined = $derived(
		getShownFieldValidityData(field.validityData, field.invalid, field.externalErrors)
	);
	const invalid = $derived(combined.state.valid === false);
	const transition = new TransitionStatus(() => invalid);

	const validityState: FieldValidityState = $derived({
		error: combined.error,
		errors: combined.errors,
		value: combined.value ?? field.remoteValue ?? null,
		initialValue: combined.initialValue,
		validity: combined.state,
		issues: [...field.issues],
		submitted: form.submitted,
		pending: form.pending,
		transitionStatus: transition.transitionStatus
	});
</script>

{@render children?.(validityState)}
