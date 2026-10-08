<!--
	A container for the dialog contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/popup/DialogPopup.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Focus trapping is FloatingFocusManager. Touch opens focus the popup itself.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { FloatingFocusManager } from '../internal/floating-ui/index.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { COMPOSITE_KEYS, dialogStateAttributesMapping, nestedDialogsVar } from './attributes.js';
	import { useDialogPortalContext, useDialogRootContext } from './context.svelte.js';
	import type {
		DialogPopupProps,
		DialogPopupState,
		FocusTarget,
		InteractionType
	} from './types.js';

	let {
		initialFocus = undefined,
		finalFocus = undefined,
		render,
		children,
		...elementProps
	}: DialogPopupProps = $props();

	const store = useDialogRootContext();
	useDialogPortalContext();
	const attachmentKey = createAttachmentKey();

	const state: DialogPopupState = $derived({
		open: store.open,
		nested: store.nested,
		transitionStatus: store.transitionStatus,
		nestedDialogOpen: store.nestedDialogOpen
	});

	function ownPopup(node: HTMLElement) {
		store.popupElement = node;
		store.floatingElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
			if (store.floatingElement === node) store.floatingElement = null;
		};
	}

	function resolveFinal(interaction: InteractionType) {
		if (finalFocus === undefined || finalFocus === true) return undefined;
		if (finalFocus === false) return false;
		if (finalFocus instanceof HTMLElement) return finalFocus;
		const result = finalFocus(interaction);
		if (result instanceof HTMLElement) return result;
		if (result === false || result === undefined) return false;
		return store.activeTriggerElement instanceof HTMLElement
			? store.activeTriggerElement
			: undefined;
	}

	store.resolveFinalFocus = resolveFinal;
	store.readSuppressReturnFocus = () => finalFocus !== undefined && finalFocus !== true;

	const resolvedInitial = $derived.by(() => {
		if (!store.open) return true as boolean | HTMLElement;
		return resolveInitial(initialFocus, store.openMethod ?? '', store.popupElement);
	});

	function onKeyDown(event: KeyboardEvent) {
		store.dismissOnKeyDown?.(event);
		if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
	}

	const hostProps = $derived(
		mergeProps(elementProps, FOCUSABLE_POPUP_PROPS, {
			id: store.floatingId,
			role: store.role,
			...(store.titleElementId ? { 'aria-labelledby': store.titleElementId } : {}),
			...(store.descriptionElementId ? { 'aria-describedby': store.descriptionElementId } : {}),
			hidden: !store.mounted,
			style: `${nestedDialogsVar}: ${store.nestedOpenDialogCount}`,
			onkeydown: onKeyDown,
			...getStateAttributesProps(state, dialogStateAttributesMapping),
			...(render ? { [attachmentKey]: ownPopup } : {})
		})
	);

	useOpenChangeComplete(() => ({
		enabled: store.mounted && store.open,
		open: store.open,
		element: store.popupElement,
		onComplete() {
			if (store.open) store.notifyOpenChangeComplete(true);
		}
	}));

	function resolveInitial(
		value: FocusTarget | undefined,
		interaction: InteractionType,
		popup: HTMLElement | null
	): boolean | HTMLElement {
		if (value === false) return false;
		if (value instanceof HTMLElement) return value;
		if (typeof value === 'function') {
			const result = value(interaction);
			if (result === false || result === undefined) return false;
			if (result instanceof HTMLElement) return result;
		}
		if (interaction === 'touch' && popup) return popup;
		return true;
	}
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

<FloatingFocusManager
	{store}
	disabled={!store.mounted}
	initialFocus={resolvedInitial}
	returnFocus={!store.readSuppressReturnFocus()}
	modal={store.modal !== false}
	closeOnFocusOut={!store.disablePointerDismissal}
>
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<div {...hostProps} {@attach ownPopup}>{@render content()}</div>
	{/if}
</FloatingFocusManager>
