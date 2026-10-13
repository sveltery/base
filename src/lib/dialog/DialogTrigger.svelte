<!--
	A button that opens the dialog. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/trigger/DialogTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). The payload forwarding follows v1.9.0
	packages/react/src/utils/popups/popupStoreUtils.ts `useTriggerDataForwarding`
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Button behavior comes from Button. The trigger does not reimplement it.
-->
<script lang="ts" generics="Payload = unknown">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { CLICK_TRIGGER_IDENTIFIER } from '@sveltery/floating-ui-svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { registerTrigger } from '../internal/popups/index.js';
	import DialogAction from './DialogAction.svelte';
	import { findDialogRoot } from './context.svelte.js';
	import type { DialogStore } from './store.svelte.js';
	import type { DialogTriggerProps, DialogTriggerState } from './types.js';

	let {
		disabled = false,
		nativeButton = true,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		payload,
		handle,
		id: idProp,
		render,
		children,
		...elementProps
	}: DialogTriggerProps<Payload> = $props();

	const dialogRoot = findDialogRoot();
	const readHandle = () => handle;
	if (!dialogRoot && !readHandle()) {
		throw new Error(
			'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.'
		);
	}

	const uid = $props.id();
	const triggerId = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();
	const store = $derived((handle?.store as DialogStore<unknown> | null) ?? dialogRoot?.store);

	// Upstream useImplicitActiveTrigger: a dialog opened without a trigger press, such as through
	// `bind:open`, belongs to its only trigger. Not one opened deliberately without a trigger.
	const ownsPopup = $derived(
		!!store &&
			(store.activeTriggerId === triggerId ||
				(store.activeTriggerId == null && !store.openedWithoutTrigger && store.triggerCount === 1))
	);
	const openedByThis = $derived(ownsPopup && !!store?.open);
	const controls = $derived((openedByThis && store?.popupElement?.id) || undefined);
	const state: DialogTriggerState = $derived({ disabled: disabled === true, open: openedByThis });

	// The active trigger supplies the payload while the popup is mounted, including one switched to
	// while open or named by `triggerId`. The only trigger supplies it only while open, so a closing
	// popup keeps its payload. A pre-effect sets it before the DOM updates, as upstream's layout
	// effect does.
	$effect.pre(() => {
		const current = store;
		if (current?.mounted && (current.activeTriggerId === triggerId || openedByThis)) {
			current.payload = payload;
		}
	});

	function clickHandlers(current: DialogStore<unknown> | null | undefined) {
		// A handled trigger inside another dialog belongs to its own store.
		return current?.click ?? dialogRoot?.click;
	}

	function register(node: HTMLElement) {
		const id = triggerId;
		// Track the owning store so a detached trigger leaves fallbackTriggers when its root attaches.
		const current = store;
		return untrack(() => {
			const triggers = current?.triggers ?? handle?.fallbackTriggers;
			if (!triggers) return;
			const detach = registerTrigger(triggers, () => id)(node);
			if (current?.open) {
				const active = current.domReferenceElement;
				const lone = active == null && !current.openedWithoutTrigger && current.triggers.size === 1;
				if (lone || active?.id === id) current.domReferenceElement = node;
			}
			return () => {
				if (typeof detach === 'function') detach();
			};
		});
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		clickHandlers(store)?.onclick?.(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		clickHandlers(store)?.onpointerdown?.(event);
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onmousedown?.(event);
		if (event.defaultPrevented) return;
		clickHandlers(store)?.onmousedown?.(event);
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		clickHandlers(store)?.onkeydown?.(event);
	}

	const described = $derived({
		id: triggerId,
		'aria-haspopup': 'dialog' as const,
		'aria-expanded': openedByThis,
		...(controls ? { 'aria-controls': controls } : {}),
		[CLICK_TRIGGER_IDENTIFIER]: '',
		...elementProps,
		...getStateAttributesProps({ open: openedByThis }, triggerOpenStateMapping),
		...(render ? { [attachmentKey]: register } : {})
	});
</script>

<DialogAction
	{disabled}
	{nativeButton}
	onclick={handleClick}
	onpointerdown={handlePointerDown}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{onkeyup}
	{render}
	{state}
	{children}
	{described}
	attach={register}
/>
