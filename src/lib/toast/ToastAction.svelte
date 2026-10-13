<!--
	Performs an action when clicked. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/action/ToastAction.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The toast's `actionProps` override the part's own props, and its `children` win.
	Renders nothing without content.
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToastRoot } from './context.js';
	import ToastText from './ToastText.svelte';
	import type { ToastActionProps, ToastActionState } from './types.js';
	import { isRenderable } from './utils.js';

	let {
		disabled = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: ToastActionProps = $props();

	const rootContext = useToastRoot();
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	const actionProps = $derived(rootContext.toast.actionProps);
	const actionChildren = $derived(actionProps?.children);
	// Upstream `actionProps.children ?? children`: a present toast value wins even when empty.
	const shouldRender = $derived(
		actionChildren != null ? isRenderable(actionChildren) : children != null
	);

	const state: ToastActionState = $derived({ type: rootContext.toast.type });

	const hostProps: HTMLButtonAttributes = $derived.by(() => {
		const { children: _children, ...toastButtonProps } = actionProps ?? {};
		return button.props(
			mergeProps({ ...getStateAttributesProps(state) }, elementProps, toastButtonProps)
		);
	});
</script>

{#snippet content()}
	{#if actionChildren != null}<ToastText value={actionChildren} />{:else}{@render children?.()}{/if}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<button {...hostProps}>{@render content()}</button>
	{/if}
{/if}
