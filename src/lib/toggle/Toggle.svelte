<!--
	A two-state button that can be on or off. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/toggle/Toggle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import type { ToggleProps, ToggleState } from './types.js';

	let {
		pressed = $bindable(false),
		disabled = false,
		onPressedChange,
		onclick,
		render,
		children,
		// Toggle never participates in forms and cannot change its button type.
		form: _form,
		type: _type,
		...elementProps
	}: ToggleProps = $props();

	const state: ToggleState = $derived({ pressed, disabled });

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented || disabled) {
			return;
		}

		const details = createChangeEventDetails(REASONS.none, event);
		onPressedChange?.(!pressed, details);
		if (details.isCanceled) {
			return;
		}
		pressed = !pressed;
	}

	const hostProps: HTMLButtonAttributes = $derived({
		type: 'button',
		...elementProps,
		...getStateAttributesProps(state),
		'aria-pressed': pressed,
		disabled,
		onclick: handleClick
	});
</script>

{#if render}
	{@render render(hostProps, state)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
