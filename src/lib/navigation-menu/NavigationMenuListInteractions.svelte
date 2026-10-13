<!--
	Dismiss and popup-hover handlers for the active trigger's floating store.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/list/NavigationMenuList.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Upstream swaps the store these hooks read when the active trigger changes. The list keys
	this part on that store instead.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { DismissInteraction, useHoverFloatingInteraction } from '@sveltery/floating-ui-svelte';
	import { closest, contains, getTarget } from '@sveltery/utils';
	import { NAVIGATION_MENU_TRIGGER_IDENTIFIER } from './constants.js';
	import type { NavigationMenuRootStore } from './root-store.svelte.js';
	import type { NavigationMenuTriggerFloating } from './trigger-floating.svelte.js';

	let {
		root,
		store,
		listElement
	}: {
		root: NavigationMenuRootStore;
		store: NavigationMenuTriggerFloating;
		listElement: HTMLElement | null;
	} = $props();

	const owner = untrack(() => store);

	useHoverFloatingInteraction(owner, () => ({
		enabled: root.positionerElement != null || root.viewportElement != null || root.value == null,
		closeDelay: root.closeDelay
	}));

	const dismiss = new DismissInteraction(owner, () => ({
		enabled: root.positionerElement != null || root.value == null,
		outsidePressEvent: 'intentional',
		// Upstream marks presses in the whole list subtree as inside, links and padding included.
		outsidePress: (event) => {
			const target = getTarget(event);
			return (
				!contains(listElement, target) &&
				closest(target, `[${NAVIGATION_MENU_TRIGGER_IDENTIFIER}]`) === null
			);
		}
	}));

	const reference = dismiss.reference;
	const floating = dismiss.floating;

	$effect(() => {
		root.dismissReference = reference;
		root.dismissFloating = floating;
		return () => {
			if (root.dismissReference === reference) root.dismissReference = {};
			if (root.dismissFloating === floating) root.dismissFloating = {};
		};
	});
</script>
