<!--
	Contains a list of navigation menu items. Renders a `<ul>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/list/NavigationMenuList.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A nested list is not a composite of its own. Its triggers join the composite of the content
	around it, and the arrow keys reach that composite.
-->
<script lang="ts">
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { setNavigationMenuComposite, useNavigationMenuRoot } from './context.svelte.js';
	import NavigationMenuListInteractions from './NavigationMenuListInteractions.svelte';
	import type { NavigationMenuListProps, NavigationMenuListState } from './types.js';

	let { render, children, ...elementProps }: NavigationMenuListProps = $props();

	const root = useNavigationMenuRoot();
	const reading = useDirection();
	const composite = root.nested
		? null
		: new CompositeRoot({
				orientation: () => root.orientation,
				loopFocus: () => false,
				direction: () => reading.direction,
				keys: 'arrows',
				stopPropagation: true,
				keydown: 'root'
			});
	if (composite) setNavigationMenuComposite(composite);

	function handleKeyDown(event: KeyboardEvent) {
		composite?.keydown(event);
		// The composite does not stop a key at the end of the list. The list still keeps it.
		const horizontal = root.orientation === 'horizontal';
		if (
			(horizontal && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) ||
			(!horizontal && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
		) {
			event.stopPropagation();
		}
	}

	const state: NavigationMenuListState = $derived({ open: root.open });
	const hostProps = $derived(
		mergeProps(
			root.activeTrigger ? root.dismissFloating : {},
			root.nested ? {} : { onkeydown: handleKeyDown },
			getStateAttributesProps(state),
			elementProps
		)
	);
</script>

{#if root.activeTrigger}
	{#key root.activeTrigger}
		<NavigationMenuListInteractions {root} store={root.activeTrigger} />
	{/key}
{/if}
{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<ul {...hostProps}>{@render children?.()}</ul>
{/if}
