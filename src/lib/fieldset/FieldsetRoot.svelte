<!--
	Groups a shared legend with related controls. Renders a `<fieldset>` element.
	Derived from Base UI v1.8.0 packages/react/src/fieldset/root/FieldsetRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		FieldsetRootContextValue,
		setFieldsetRootContext,
		useFieldsetRootContext
	} from './context.svelte.js';
	import type { FieldsetRootProps, FieldsetRootState } from './types.js';

	const parent = useFieldsetRootContext(true);

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
