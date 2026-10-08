<!--
	A button that opens the dialog. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/trigger/DialogTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Button behavior comes from Button. The trigger does not reimplement it.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { CLICK_TRIGGER_IDENTIFIER } from '../internal/floating-ui/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { registerTrigger } from '../internal/popups/index.js';
	import DialogAction from './DialogAction.svelte';
	import { useDialogRoot } from './context.svelte.js';
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
	}: DialogTriggerProps = $props();

	const dialogRoot = useDialogRoot(true);
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

	const openedByThis = $derived(!!store && store.open && store.activeTriggerId === triggerId);
	const controls = $derived.by(() => {
		if (!store || !store.open) return undefined;
		const popup = store.popupElement;
		if (popup == null || popup.id === '') return undefined;
		if (store.activeTriggerId === triggerId) return popup.id;
		if (store.activeTriggerId == null && store.triggerCount === 1) return popup.id;
		return undefined;
	});
	const state: DialogTriggerState = $derived({ disabled: disabled === true, open: openedByThis });

	$effect(() => {
		const id = triggerId;
		const value = payload;
		const current = handle;
		if (!current || value === undefined) return;
		if (!current.setPayload(id, value)) return;
		return () => current.forgetPayload(id);
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
			const owner = {
				triggers,
				get triggerCount() {
					return current?.triggerCount ?? 0;
				},
				set triggerCount(next: number) {
					if (current) current.triggerCount = next;
				}
			};
			const detach = registerTrigger(owner, () => id)(node);
			if (current?.open) {
				const active = current.domReferenceElement;
				if ((active == null && current.triggers.size === 1) || active?.id === id) {
					current.domReferenceElement = node;
				}
			}
			return () => {
				if (typeof detach === 'function') detach();
			};
		});
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		const current = store;
		if (!current) return;
		if (!current.open && payload !== undefined) current.payload = payload;
		clickHandlers(current)?.onclick?.(event);
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
