<!--
	A native input element that integrates with Toolbar keyboard navigation.
	Renders an `<input>` element.
	Derived from Base UI v1.9.0 packages/react/src/toolbar/input/ToolbarInput.tsx
	and packages/react/src/utils/useFocusableWhenDisabled.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { CompositeHandlers } from '../internal/composite-root.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToolbarGroupContext, useToolbarRootContext } from './context.svelte.js';
	import { ToolbarItem } from './item-registration.svelte.js';
	import type { ToolbarInputHostProps, ToolbarInputProps, ToolbarInputState } from './types.js';

	const toolbar = useToolbarRootContext();
	const group = useToolbarGroupContext();

	let {
		disabled,
		focusableWhenDisabled = true,
		onclick,
		onpointerdown,
		onkeydown,
		onfocus,
		render,
		...elementProps
	}: ToolbarInputProps = $props();

	const disabledState = $derived(
		toolbar.disabled || (group?.disabled ?? false) || (disabled ?? false)
	);
	const inputState: ToolbarInputState = $derived({
		disabled: disabledState,
		orientation: toolbar.orientation,
		focusable: focusableWhenDisabled
	});

	const item = new ToolbarItem(toolbar.roving, () => ({
		disabled: disabledState && !focusableWhenDisabled
	}));

	function preventWhenDisabled(event: Event) {
		if (disabledState) event.preventDefault();
	}

	const hostProps: ToolbarInputHostProps & Record<symbol, Attachment<HTMLElement>> = $derived({
		...elementProps,
		...getStateAttributesProps(inputState),
		'aria-disabled': disabledState || undefined,
		// The consumer sees the event before the disabled prevent, as in upstream mergeProps.
		onclick: (event) => {
			onclick?.(event);
			preventWhenDisabled(event);
		},
		onpointerdown: (event) => {
			onpointerdown?.(event);
			preventWhenDisabled(event);
		},
		onkeydown: (event) => {
			// A focusable disabled input lets Tab leave and blocks every other key's default.
			// The toolbar root still moves on arrows.
			if (disabledState && focusableWhenDisabled && event.key !== 'Tab') event.preventDefault();
			onkeydown?.(event);
		},
		...item.hosted(
			{ onfocus: onfocus as CompositeHandlers['onfocus'] },
			{ disabled: disabledState && !focusableWhenDisabled }
		)
	} as ToolbarInputHostProps & Record<symbol, Attachment<HTMLElement>>);
</script>

{#if render}
	{@render render(hostProps, inputState)}
{:else}
	<input {...hostProps} />
{/if}
