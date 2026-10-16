<!--
	A button component that can be used to trigger actions.
	Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/button/Button.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import type { ButtonHostProps, ButtonProps, ButtonState } from './types.js';

	let {
		disabled: disabledProp,
		focusableWhenDisabled = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: ButtonProps = $props();
	const disabled = $derived(disabledProp ?? false);

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
