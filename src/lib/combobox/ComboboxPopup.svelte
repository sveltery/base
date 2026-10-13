<!--
	A container for the list. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/popup/ComboboxPopup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	With the input outside the popup, focus stays on the input, so the focus manager is not
	modal and outside content is not hidden from assistive technology.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { FloatingFocusManager } from '@sveltery/floating-ui-svelte';
	import { contains, getTarget, type OpenInteractionType } from '@sveltery/utils';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import ComboboxInternalDismissButton from './ComboboxInternalDismissButton.svelte';
	import { useComboboxPositioner, useComboboxRoot } from './context.svelte.js';
	import { getComboboxPopupId } from './filter.js';
	import type { ComboboxPopupProps, ComboboxPopupState } from './types.js';

	let {
		initialFocus = undefined,
		finalFocus = undefined,
		id: idProp,
		render,
		children,
		...elementProps
	}: ComboboxPopupProps = $props();

	const store = useComboboxRoot();
	const positioning = useComboboxPositioner();
	const bindKey = createAttachmentKey();

	const inputInsidePopup = $derived(store.inputInsidePopup);
	const popupId = $derived(
		idProp ?? (inputInsidePopup ? getComboboxPopupId(store.root.id) : undefined)
	);
	const focusManagerModal = $derived(!inputInsidePopup || store.root.modal);

	$effect.pre(() => {
		// A `render` snippet can set its own id on the element.
		store.popupId = store.popupElement?.id || popupId;
		return () => {
			store.popupId = undefined;
		};
	});

	useOpenChangeComplete(() => ({
		enabled: store.open,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpenChangeComplete(true);
		}
	}));

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
		};
	}

	/** On touch the popup takes focus, so Android does not open the virtual keyboard. */
	function defaultInitialFocus(interactionType: OpenInteractionType) {
		return interactionType === 'touch' ? store.popupElement : store.inputElement;
	}

	const partState: ComboboxPopupState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		transitionStatus: store.transitionStatus,
		empty: store.listEmpty
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			store.popupProps,
			{
				id: popupId,
				role: inputInsidePopup ? ('dialog' as const) : ('presentation' as const),
				onfocus(event: FocusEvent) {
					const target = getTarget(event) as Element | null;
					if (
						store.openMethod !== 'touch' &&
						(contains(store.listElement, target) || target === event.currentTarget)
					) {
						store.inputElement?.focus();
					}
				},
				style: toCssStyle(store.transitionStatus === 'starting' ? { transition: 'none' } : {}),
				...getStateAttributesProps(partState, popupTransitionStateMapping),
				[bindKey]: bindPopup
			},
			elementProps
		)
	);
</script>

<FloatingFocusManager
	{store}
	disabled={!store.mounted}
	modal={inputInsidePopup && store.root.modal}
	initialFocus={initialFocus === undefined
		? inputInsidePopup
			? defaultInitialFocus
			: false
		: (initialFocus as never)}
	returnFocus={finalFocus == null ? inputInsidePopup : (finalFocus as never)}
>
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
	{#if focusManagerModal}
		<ComboboxInternalDismissButton />
	{/if}
</FloatingFocusManager>
