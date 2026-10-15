<!--
	A button that triggers an action. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/button/Button.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="Host extends HTMLElement = HTMLButtonElement">
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
	}: ButtonProps<Host> = $props();
	const disabled = $derived(disabledProp ?? false);

	const state: ButtonState = $derived({ disabled });
	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled
	}));

	const hostProps = $derived(
		button.props({ ...elementProps, ...getStateAttributesProps(state) }) as ButtonHostProps<Host>
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
