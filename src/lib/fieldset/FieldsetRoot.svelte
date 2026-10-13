<!--
	Groups a shared legend with related controls. Renders a `<fieldset>` element.
	Derived from Base UI v1.9.0 packages/react/src/fieldset/root/FieldsetRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		FieldsetRootContextValue,
		setFieldsetRootContext,
		findFieldsetRootContext
	} from './context.svelte.js';
	import type { FieldsetRootProps, FieldsetRootState } from './types.js';

	const parent = findFieldsetRootContext();

	let {
		disabled: disabledProp = false,
		render,
		children,
		...elementProps
	}: FieldsetRootProps = $props();

	const fieldset = new FieldsetRootContextValue(parent, () => disabledProp);
	setFieldsetRootContext(fieldset);

	const state: FieldsetRootState = $derived({
		disabled: fieldset.disabled
	});

	const hostProps: HTMLFieldsetAttributes = $derived({
		...elementProps,
		...getStateAttributesProps(state),
		'aria-labelledby': fieldset.legendId,
		disabled: fieldset.disabled
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<fieldset {...hostProps}>{@render children?.()}</fieldset>
{/if}
