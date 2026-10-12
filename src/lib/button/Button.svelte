<!--
	A button that triggers an action. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/button/Button.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import type { ButtonHostProps, ButtonProps, ButtonState } from './types.js';

	let {
		disabled = false,
		focusableWhenDisabled = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: ButtonProps = $props();

	const state: ButtonState = $derived({ disabled });
	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled
	}));

	const hostProps: HTMLButtonAttributes = $derived(
		button.props({ ...elementProps, ...getStateAttributesProps(state) })
	);
</script>

{#if render}
	{@render render(hostProps as ButtonHostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
