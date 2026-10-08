<!--
	A button that opens the dialog. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/trigger/DialogTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Button behavior comes from Button. The trigger does not reimplement it.
-->
<script lang="ts" generics="Payload = unknown">
	import { createAttachmentKey } from 'svelte/attachments';
	import { CLICK_TRIGGER_IDENTIFIER } from '../internal/floating-ui/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { registerTrigger } from '../internal/popups/index.js';
	import DialogAction from './DialogAction.svelte';
	import { useDialogRootContext } from './context.svelte.js';
	import { noteOpenClick, noteOpenPointer } from './open-method.js';
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

	const dialogRoot = useDialogRootContext(true);
	const readHandle = () => handle;
	if (!dialogRoot && !readHandle()) {
		throw new Error(
			'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.'
		);
	}

	const uid = $props.id();
	const triggerId = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();
	const store = $derived(
		(handle?.store as DialogStore<Payload> | null) ??
			(dialogRoot as DialogStore<Payload> | undefined)
	);

	const openedByThis = $derived(!!store && store.open && store.activeTriggerId === triggerId);
	const controls = $derived.by(() => {
		if (!store || !store.open) return undefined;
		if (store.activeTriggerId === triggerId) return store.floatingId;
		if (store.activeTriggerId == null && store.triggerCount === 1) return store.floatingId;
		return undefined;
	});
	const state: DialogTriggerState = $derived({ disabled: disabled === true, open: openedByThis });

	function activeStore() {
		return (
			(handle?.store as DialogStore<Payload> | null) ??
			(dialogRoot as DialogStore<Payload> | undefined)
		);
	}

	function register(node: HTMLElement) {
		const current = activeStore();
		const id = triggerId;
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
		if (payload !== undefined) handle?.payloads.set(id, payload);
		const detach = registerTrigger(owner, () => id)(node);
		if (current?.open) {
			const active = current.domReferenceElement;
			if ((active == null && current.triggers.size === 1) || active?.id === id) {
				current.domReferenceElement = node;
			}
		}
		return () => {
			if (typeof detach === 'function') detach();
			handle?.payloads.delete(id);
		};
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		const current = activeStore();
		if (!current) return;
		if (!current.open && payload !== undefined) current.payload = payload;
		noteOpenClick(current, event);
		current.readClickReference()?.onclick?.(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		const current = activeStore();
		if (!current) return;
		noteOpenPointer(current, event);
		current.readClickReference()?.onpointerdown?.(event);
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onmousedown?.(event);
		if (event.defaultPrevented) return;
		activeStore()?.readClickReference()?.onmousedown?.(event);
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		activeStore()?.readClickReference()?.onkeydown?.(event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onkeyup?.(event);
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
	onkeyup={handleKeyUp}
	{render}
	{state}
	{children}
	{described}
	attach={register}
/>
