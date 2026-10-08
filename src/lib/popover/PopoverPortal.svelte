<!--
	A portal element that moves the popup to a different part of the DOM.
	By default, the portal element is appended to `<body>`.
	Derived from Base UI v1.8.0 packages/react/src/popover/portal/PopoverPortal.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { FloatingPortal } from '../internal/floating-ui/index.js';
	import { setPopoverPortal, usePopoverRoot } from './context.svelte.js';
	import type { PopoverPortalProps } from './types.js';

	let { keepMounted = false, container = undefined, children }: PopoverPortalProps = $props();

	const store = usePopoverRoot();
	const shouldRender = $derived(store.mounted || keepMounted);

	setPopoverPortal();
</script>

{#if shouldRender}
	<FloatingPortal {store} container={container as HTMLElement | null | undefined}>
		{@render children?.()}
	</FloatingPortal>
{/if}
