<!--
	A link in a toolbar. Renders an `<a>`.
	Derived from Base UI v1.8.0 packages/react/src/toolbar/link/ToolbarLink.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToolbarRootContext } from './context.svelte.js';
	import { registerToolbarItem } from './item-registration.svelte.js';
	import type { ToolbarLinkHostProps, ToolbarLinkProps, ToolbarLinkState } from './types.js';

	const toolbar = useToolbarRootContext();

	let { onfocus, render, children, ...elementProps }: ToolbarLinkProps = $props();

	const item = registerToolbarItem(toolbar.roving);

	const linkState: ToolbarLinkState = $derived({ orientation: toolbar.orientation });

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event as FocusEvent & { currentTarget: EventTarget & HTMLAnchorElement });
	}

	const hostProps: ToolbarLinkHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(
		() => {
			const hosted = item.hosted({ onfocus: handleFocus });
			return {
				...getStateAttributesProps(linkState),
				...elementProps,
				...hosted
			} as ToolbarLinkHostProps & Record<symbol, Attachment<HTMLElement>>;
		}
	);
</script>

{#if render}
	{@render render(hostProps, linkState)}
{:else}
	<a {...hostProps}>{@render children?.()}</a>
{/if}
