<!--
	An individual interactive tab button that toggles the corresponding panel.
	Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/tabs/tab/TabsTab.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { chain } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { tabsStateAttributesMapping } from './attributes.js';
	import { useTabsListContext, useTabsRootContext } from './context.svelte.js';
	import type { TabsTabHostProps, TabsTabProps, TabsTabState } from './types.js';

	const uid = $props.id();

	let {
		value,
		disabled: disabledProp,
		nativeButton = true,
		id,
		onclick,
		onfocus,
		onpointerdown,
		render,
		children,
		form: _form,
		type: _type,
		...elementProps
	}: TabsTabProps = $props();
	const disabled = $derived(disabledProp ?? false);

	const tabs = useTabsRootContext();
	const list = useTabsListContext();
	const claim = list.roving.claim();
	const generatedId = $derived(`base-ui-${uid}`);
	const tabId = $derived(id ?? generatedId);

	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled: true,
		composite: true
	}));

	let node: HTMLElement | null = $state(null);
	let pressing = false;
	let mainButton = false;

	const active = $derived(value === tabs.value);
	const tabState: TabsTabState = $derived({
		disabled,
		active,
		orientation: tabs.orientation,
		tabActivationDirection: tabs.tabActivationDirection
	});

	function register(element: HTMLElement) {
		node = element;
		const removeRoving = list.roving.register(element, () => ({ value, disabled }), claim);
		const unregister = untrack(() =>
			tabs.registerTab(element, () => ({ element, value, disabled, id: tabId }))
		);
		const unobserve = list.observeTab(element);
		return () => {
			removeRoving();
			unregister();
			unobserve();
			if (node === element) node = null;
		};
	}

	// An enabled selection takes the tab stop when focus is outside the list.
	// A disabled selection leaves the previous tab stop alone.
	$effect(() => {
		const element = node;
		if (!active || disabled || !element) return;
		const listElement = list.listElement;
		if (listElement) {
			const focused = listElement.ownerDocument.activeElement;
			if (focused && listElement.contains(focused)) return;
		}
		list.roving.highlight(element);
	});

	function activate(event: Event) {
		tabs.activate(value, event);
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented || active || event.button !== 0) return;
		activate(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		const current = event.currentTarget;
		if (current instanceof HTMLElement) list.roving.highlight(current);
		if (active || disabled) return;
		if (list.activateOnFocus && (!pressing || mainButton)) activate(event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointerdown?.(event);
		if (event.defaultPrevented || active) return;

		pressing = true;
		mainButton = event.button === 0;
		const doc = event.currentTarget.ownerDocument;
		// Not `on()`: it attaches pointer listeners a microtask late.
		const listening = new AbortController();
		function end() {
			pressing = false;
			mainButton = false;
			listening.abort();
		}
		doc.addEventListener('pointerup', end, { signal: listening.signal });
		doc.addEventListener('pointercancel', end, { signal: listening.signal });
	}

	const hostProps: TabsTabHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const panelId = tabs.panelIdFor(value);
		const props = button.props({
			role: 'tab',
			id: tabId,
			'aria-selected': active,
			'aria-disabled': disabled,
			...(panelId ? { 'aria-controls': panelId } : {}),
			...elementProps,
			...getStateAttributesProps(tabState, tabsStateAttributesMapping),
			onclick: handleClick,
			onpointerdown: handlePointerDown
		});
		const roving = list.roving.item(
			node,
			register,
			{
				onfocus: chain(handleFocus, onfocus),
				onkeydown(event) {
					// The roving handler skips a prevented keydown, so a disabled tab only blocks activation.
					if (!disabled) props.onkeydown(event);
					else if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
				}
			},
			claim,
			{ selected: active, hasSelection: tabs.value != null }
		);
		return {
			...props,
			tabindex: roving.tabindex,
			onfocus: roving.onfocus,
			onkeydown: roving.onkeydown,
			[list.roving.attachmentKey]: roving[list.roving.attachmentKey]
		} as TabsTabHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, tabState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
