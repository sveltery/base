<!--
	A button in a toolbar. Renders a `<button>`.
	Derived from Base UI v1.8.0 packages/react/src/toolbar/button/ToolbarButton.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import type { CompositeHandlers } from '../internal/composite-root.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToolbarGroupContext, useToolbarRootContext } from './context.svelte.js';
	import { ToolbarItem } from './item-registration.svelte.js';
	import type { ToolbarButtonHostProps, ToolbarButtonProps, ToolbarButtonState } from './types.js';

	const toolbar = useToolbarRootContext();
	const group = useToolbarGroupContext();

	let {
		disabled,
		focusableWhenDisabled = true,
		nativeButton = true,
		onfocus,
		render,
		children,
		...elementProps
	}: ToolbarButtonProps = $props();

	const disabledState = $derived(
		toolbar.disabled || (group?.disabled ?? false) || (disabled ?? false)
	);
	const buttonState: ToolbarButtonState = $derived({
		disabled: disabledState,
		orientation: toolbar.orientation,
		focusable: focusableWhenDisabled
	});

	const item = new ToolbarItem(toolbar.roving, () => ({
		disabled: disabledState && !focusableWhenDisabled
	}));

	// Arrow keys still move from a disabled button: the toolbar root handles them.
	const button = new ButtonBehavior(() => ({
		disabled: disabledState,
		native: nativeButton,
		focusableWhenDisabled,
		composite: true
	}));

	const hostProps: ToolbarButtonHostProps & Record<symbol, Attachment<HTMLElement>> = $derived({
		...button.props({ ...elementProps, ...getStateAttributesProps(buttonState) }),
		...item.hosted(
			{ onfocus: onfocus as CompositeHandlers['onfocus'] },
			{ disabled: disabledState && !focusableWhenDisabled }
		)
	} as ToolbarButtonHostProps & Record<symbol, Attachment<HTMLElement>>);
</script>

{#if render}
	<!-- The render child gets `disabled` so a part such as Switch disables itself.
		The default button does not, so a focusable disabled button keeps hover events. -->
	{@render render({ ...hostProps, disabled: disabledState }, buttonState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
