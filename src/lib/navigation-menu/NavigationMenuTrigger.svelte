<!--
	Opens the navigation menu popup when hovered or clicked, revealing the associated content.
	Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { FocusGuard } from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { pressableTriggerOpenStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { compositeItem } from './composite-item.svelte.js';
	import { NAVIGATION_MENU_TRIGGER_IDENTIFIER, OWNER_VISUALLY_HIDDEN_STYLE } from './constants.js';
	import {
		useNavigationMenuComposite,
		useNavigationMenuItem,
		useNavigationMenuRoot
	} from './context.svelte.js';
	import { NavigationMenuTriggerController } from './trigger.svelte.js';
	import type { NavigationMenuTriggerProps, NavigationMenuTriggerState } from './types.js';

	let {
		disabled = false,
		nativeButton = true,
		render,
		children,
		...elementProps
	}: NavigationMenuTriggerProps = $props();

	const uid = $props.id();
	const root = useNavigationMenuRoot();
	const item = useNavigationMenuItem();
	const reading = useDirection();
	const composite = compositeItem(useNavigationMenuComposite());

	const trigger = new NavigationMenuTriggerController(root, {
		itemValue: () => item.value,
		disabled: () => disabled,
		direction: () => reading.direction,
		floatingId: `base-ui-${uid}`
	});
	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled: true
	}));

	const elementKey = createAttachmentKey();
	const hoverKey = createAttachmentKey();
	const compositeKey = createAttachmentKey();

	function bindBeforeOutside(node: HTMLElement) {
		root.guards.beforeOutside = node;
		return () => {
			if (root.guards.beforeOutside === node) root.guards.beforeOutside = null;
		};
	}

	function bindAfterOutside(node: HTMLElement) {
		root.guards.afterOutside = node;
		return () => {
			if (root.guards.afterOutside === node) root.guards.afterOutside = null;
		};
	}

	const state: NavigationMenuTriggerState = $derived({ open: trigger.isActiveItem, disabled });

	const hostProps = $derived(
		button.props(
			mergeProps(
				{ onfocus: composite.onfocus, [compositeKey]: composite.attach },
				trigger.click.reference,
				trigger.hover.reference,
				root.dismissReference,
				{
					tabindex: 0,
					'aria-expanded': trigger.isActiveItem,
					'aria-controls': trigger.isActiveItem ? root.popupElement?.id : undefined,
					[NAVIGATION_MENU_TRIGGER_IDENTIFIER]: '',
					...getStateAttributesProps(state, pressableTriggerOpenStateMapping),
					...trigger.handlers,
					[elementKey]: trigger.attachElement,
					[hoverKey]: trigger.hover.attachReference
				},
				elementProps
			)
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
{#if trigger.isActiveItem}
	<FocusGuard attach={bindBeforeOutside} onfocusin={trigger.focusBeforeOutside} />
	<span aria-owns={root.viewportElement?.id} style={OWNER_VISUALLY_HIDDEN_STYLE}></span>
	<FocusGuard attach={bindAfterOutside} onfocusin={trigger.focusAfterOutside} />
{/if}
