<!--
	Indicates whether the checkbox item is ticked. Renders a `<span>` element.
	Derived from Base UI v1.9.0
	packages/react/src/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import { useMenuCheckboxItem } from './context.svelte.js';
	import { itemMapping } from './item-mapping.js';
	import type { MenuItemIndicatorProps, MenuItemIndicatorState } from './types.js';

	let { keepMounted = false, render, children, ...elementProps }: MenuItemIndicatorProps = $props();

	const item = useMenuCheckboxItem();
	const bindKey = createAttachmentKey();
	const transition = new TransitionStatus(() => item.checked);
	let node = $state<HTMLElement | null>(null);
	transition.unmountAfterExit(() => node, true);

	function bindIndicator(element: HTMLElement) {
		node = element;
		return () => {
			if (node === element) node = null;
		};
	}

	const partState: MenuItemIndicatorState = $derived({
		checked: item.checked,
		disabled: item.disabled,
		highlighted: item.highlighted,
		transitionStatus: transition.transitionStatus
	});
	const hostProps = $derived(
		mergeProps(
			{
				'aria-hidden': true as const,
				...getStateAttributesProps(partState, itemMapping),
				[bindKey]: bindIndicator
			},
			elementProps
		)
	);
</script>

{#if keepMounted || transition.mounted}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<span {...hostProps}>{@render children?.()}</span>
	{/if}
{/if}
