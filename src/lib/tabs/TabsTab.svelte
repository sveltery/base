<!--
	An individual interactive tab button that toggles the corresponding panel.
	Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/tab/TabsTab.tsx and the
	non-composite paths of packages/react/src/internals/use-button/useButton.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { currentHost, dispatchClick, forwardKeyUp, isLink } from '../internal/click.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { tabsStateAttributesMapping } from './attributes.js';
	import { useTabsListContext, useTabsRootContext } from './context.svelte.js';
	import type { TabsTabHostProps, TabsTabProps, TabsTabState } from './types.js';

	const uid = $props.id();

	let {
		value,
		disabled = false,
		nativeButton = true,
		id,
		onclick,
		onfocus,
		onpointerdown,
		onkeydown,
		onkeyup,
		render,
		children,
		form: _form,
		type: _type,
		...elementProps
	}: TabsTabProps = $props();

	const tabs = useTabsRootContext();
	const list = useTabsListContext();
	const slot = list.roving.claim(untrack(() => disabled));
	const generatedId = $derived(`base-ui-${uid}`);
	const tabId = $derived(id ?? generatedId);

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
		const removeRoving = list.roving.register(element, () => ({ value, disabled }), slot);
		const unregister = untrack(() => tabs.registerTab(element, value, disabled, tabId));
		const unobserve = list.observeTab(element);
		return () => {
			removeRoving();
			unregister();
			unobserve();
			if (node === element) node = null;
		};
	}

	$effect(() => {
		const element = node;
		if (!element) return;
		tabs.updateTab(element, value, disabled, tabId);
	});

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
		if (disabled) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
		if (event.defaultPrevented || active || event.button !== 0) return;
		activate(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event);
		const current = event.currentTarget;
		if (current instanceof HTMLElement) list.roving.highlight(current);
		if (event.defaultPrevented || active || disabled) return;
		if (list.activateOnFocus && (!pressing || mainButton)) activate(event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onpointerdown?.(event);
		if (event.defaultPrevented || active) return;

		pressing = true;
		mainButton = event.button === 0;
		const doc = event.currentTarget.ownerDocument;
		function end() {
			pressing = false;
			mainButton = false;
			doc.removeEventListener('pointerup', end);
			doc.removeEventListener('pointercancel', end);
		}
		doc.addEventListener('pointerup', end);
		doc.addEventListener('pointercancel', end);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (disabled) {
			// Arrow keys still move the tab stop. Enter and Space must not activate.
			if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
			return;
		}

		onkeydown?.(event);
		if (event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const link = isLink(current, nativeButton);
		const shouldClick = nativeButton ? current instanceof HTMLButtonElement : !link;
		const isEnter = event.key === 'Enter';
		const isSpace = event.key === ' ';

		if (!shouldClick || nativeButton || (!isSpace && !isEnter)) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
		if (isEnter) dispatchClick(current, event);
	}

	const hostProps: TabsTabHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const roving = list.roving.item(
			node,
			register,
			{
				onfocus: handleFocus,
				onkeydown: handleKeyDown
			},
			slot,
			{ selected: active, hasSelection: tabs.value != null }
		);
		const panelId = tabs.panelIdFor(value);
		const props = {
			...(nativeButton ? { type: 'button' as const } : {}),
			role: 'tab',
			id: tabId,
			'aria-selected': active,
			'aria-disabled': disabled,
			...(panelId ? { 'aria-controls': panelId } : {}),
			...elementProps,
			...getStateAttributesProps(tabState, tabsStateAttributesMapping),
			onclick: handleClick,
			onpointerdown: handlePointerDown,
			onkeyup: (event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) =>
				forwardKeyUp(event, disabled, onkeyup, nativeButton),
			...roving
		};
		return props as TabsTabHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, tabState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
