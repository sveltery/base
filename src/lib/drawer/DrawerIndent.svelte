<!--
	A wrapper element intended to contain your app's main UI.
	Applies `data-active` when any drawer within the nearest `<Drawer.Provider>` is open.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/indent/DrawerIndent.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		DrawerBackdropCssVars,
		DrawerPopupCssVars,
		drawerIndentStateAttributesMapping
	} from './attributes.js';
	import { findDrawerProvider } from './context.svelte.js';
	import type { DrawerDivProps, DrawerIndentProps, DrawerIndentState } from './types.js';

	let { render, children, ...elementProps }: DrawerIndentProps = $props();

	const provider = findDrawerProvider();
	const attachmentKey = createAttachmentKey();
	const state: DrawerIndentState = $derived({ active: provider?.active ?? false });

	// Written per property so a swipe's frequent updates skip the style attribute.
	function syncVisualState(node: HTMLElement) {
		if (!provider) return;
		$effect(() => {
			// A new `style` string replaces the inline style, so write the variables again after it.
			void elementProps.style;
			const progress = provider.swipeProgress;
			const height = provider.frontmostHeight;
			node.style.setProperty(
				DrawerBackdropCssVars.swipeProgress,
				progress <= 0 ? '0' : `${progress}`
			);
			if (height <= 0) node.style.removeProperty(DrawerPopupCssVars.height);
			else node.style.setProperty(DrawerPopupCssVars.height, `${height}px`);
		});
		return () => {
			node.style.setProperty(DrawerBackdropCssVars.swipeProgress, '0');
			node.style.removeProperty(DrawerPopupCssVars.height);
		};
	}

	const hostProps = $derived(
		mergeProps(
			{
				style: `${DrawerBackdropCssVars.swipeProgress}: 0`,
				...getStateAttributesProps(state, drawerIndentStateAttributesMapping),
				...(render ? { [attachmentKey]: syncVisualState } : {})
			},
			elementProps
		) as DrawerDivProps
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps} {@attach syncVisualState}>{@render children?.()}</div>
{/if}
