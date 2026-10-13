<!--
	A search field that filters the menu items. Requires the menu to be wrapped in
	`Menu.FilterProvider`. Renders an `<input>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/input/MenuInput.tsx and
	packages/react/src/filter-dropdown/input/FilterDropdownInput.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The input shows the query. A Svelte input keeps text the query rejected, so the input writes the
	query back after each edit, as React's controlled input does.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import {
		REASONS,
		activeElement,
		createChangeEventDetails,
		ownerDocument,
		platform
	} from '@sveltery/utils';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		handleMenuFilterKeyDown,
		isRefocusingOwner,
		markConsumerPrevention,
		refocusOwner
	} from './filter-keydown.js';
	import { useMenuFilterPart } from './filter-part.js';
	import type { MenuInputProps, MenuInputState } from './types.js';

	let { id, disabled = false, render, ...elementProps }: MenuInputProps = $props();

	const { root, filter } = useMenuFilterPart('Input');
	const store = root.store;
	const direction = useDirection();
	const uid = $props.id();
	const ownKey = createAttachmentKey();

	// IME text is not committed until the composition ends, so filtering waits for it.
	let composingValue = $state<string | null>(null);
	let composing = false;

	const keys = {
		store,
		get orientation() {
			return root.orientation;
		},
		get rtl() {
			return direction.direction === 'rtl';
		}
	};

	function syncDisplayed(input: HTMLInputElement) {
		if (composingValue === null && input.value !== filter.query) input.value = filter.query;
	}

	function commitValue(input: HTMLInputElement, event: Event) {
		// The input keeps focus until the popup unmounts. An edit made while it animates out would
		// land after the close cleared the query and carry over into the next open.
		if (store.open) {
			const value = input.value;
			const reason = value === '' ? REASONS.inputClear : REASONS.inputChange;
			filter.onValueChange(value, createChangeEventDetails(reason, event));
		}
		syncDisplayed(input);
	}

	function attachOwner(node: HTMLInputElement) {
		store.focusOwner = node;
		store.inputFocused = activeElement(ownerDocument(node)) === node;
		return () => {
			if (store.focusOwner !== node) return;
			store.focusOwner = null;
			store.inputFocused = false;
		};
	}

	const navigationProps = $derived.by(() => {
		const {
			onkeydown: _onkeydown,
			'aria-activedescendant': _activeDescendant,
			...rest
		} = store.inputProps;
		return rest;
	});

	const activeItemId = $derived(store.highlightedItem?.id || undefined);
	const partState: MenuInputState = $derived({
		highlighted: filter.inputFocusVisible && (!filter.keyboardModality || activeItemId == null)
	});

	const ownProps = {
		oncompositionstart(event: CompositionEvent) {
			// Some Android keyboards treat all typing as one composition.
			if (platform.os.android) return;
			composing = true;
			composingValue = (event.currentTarget as HTMLInputElement).value;
		},
		oncompositionend(event: CompositionEvent) {
			if (!composing) return;
			composing = false;
			composingValue = null;
			commitValue(event.currentTarget as HTMLInputElement, event);
		},
		oninput(event: Event) {
			const input = event.currentTarget as HTMLInputElement;
			if (composing) {
				composingValue = input.value;
				return;
			}
			commitValue(input, event);
		},
		onpointerdown() {
			filter.keyboardModality = false;
		},
		onmouseenter(event: MouseEvent) {
			filter.keyboardModality = false;
			// Take focus so typing filters at once.
			if (store.open) refocusOwner(event.currentTarget as HTMLElement);
		},
		onfocus(event: FocusEvent) {
			filter.inputFocusVisible = true;
			// Focus that returns from an item, which a screen reader following
			// `aria-activedescendant` focused, means the user moved back to the input.
			if (filter.autoHighlight === 'always' || isRefocusingOwner()) return;
			const from = event.relatedTarget as HTMLElement | null;
			if (from !== null && store.items.elements.includes(from)) filter.setActiveIndex(null);
		},
		onblur() {
			filter.inputFocusVisible = false;
		}
	};

	const menuProps = {
		onkeydown(event: KeyboardEvent) {
			filter.keyboardModality = true;
			handleMenuFilterKeyDown(keys, event, filter.value !== '');
		},
		onfocus() {
			store.inputFocused = true;
		},
		onblur() {
			store.inputFocused = false;
		}
	};

	const consumerProps = $derived.by(() => {
		const { onkeydown, ...rest } = elementProps;
		if (typeof onkeydown !== 'function') return elementProps;
		return { ...rest, onkeydown: markConsumerPrevention(onkeydown) };
	});

	const hostProps = $derived(
		mergeProps(
			navigationProps,
			{
				id: id ?? `base-ui-${uid}`,
				type: 'text',
				disabled: store.disabled || disabled,
				'aria-activedescendant': activeItemId,
				role: 'searchbox',
				inputmode: 'search',
				autocomplete: 'off',
				spellcheck: 'false',
				autocorrect: 'off',
				autocapitalize: 'none',
				'aria-controls': filter.listId,
				value: composingValue ?? filter.query,
				...getStateAttributesProps(partState),
				[ownKey]: attachOwner
			},
			ownProps,
			menuProps,
			consumerProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, undefined)}
{:else}
	<input {...hostProps} />
{/if}
