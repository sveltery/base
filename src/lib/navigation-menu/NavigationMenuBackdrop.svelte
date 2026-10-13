<!--
	A backdrop for the navigation menu popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/backdrop/NavigationMenuBackdrop.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuBackdropProps, NavigationMenuBackdropState } from './types.js';

	let { render, children, ...elementProps }: NavigationMenuBackdropProps = $props();

	const root = useNavigationMenuRoot();
	const state: NavigationMenuBackdropState = $derived({
		open: root.open,
		transitionStatus: root.transitionStatus
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: root.mounted ? undefined : true,
				style: 'user-select: none; -webkit-user-select: none',
				...getStateAttributesProps(state, popupTransitionStateMapping)
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
