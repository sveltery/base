<!--
	A button that opens the dialog. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/trigger/DialogTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Button behavior comes from Button. The trigger does not reimplement it.
-->
<script lang="ts" generics="Payload = unknown">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/Button.svelte';
	import { CLICK_TRIGGER_IDENTIFIER } from '../internal/floating-ui/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
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
	if (!dialogRoot && !handle) {
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
	const state: DialogTriggerState = $derived({ disabled, open: openedByThis });

	function activeStore() {
		return (
			(handle?.store as DialogStore<Payload> | null) ??
			(dialogRoot as DialogStore<Payload> | undefined)
		);
	}

	const register = $derived.by(() => {
		const current = store;
		const id = triggerId;
		const remembered = payload;
		return (node: HTMLElement) => {
			const map = current?.triggers ?? handle?.fallbackTriggers;
			if (!map) return;
			map.add(id, node);
			if (current) current.triggerCount = current.triggers.size;
			if (remembered !== undefined) handle?.payloads.set(id, remembered);
			if (
				current &&
				current.open &&
				current.activeTriggerId == null &&
				current.triggers.size === 1
			) {
				current.activeTriggerId = id;
				current.activeTriggerElement = node;
			}
			if (current && current.activeTriggerId === id) current.activeTriggerElement = node;
			return () => {
				if (map.getById(id) === node) map.delete(id);
				if (current) current.triggerCount = current.triggers.size;
			};
		};
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		const current = activeStore();
		if (!current) return;
		if (!current.open && payload !== undefined) current.payload = payload;
		noteOpenClick(current, event);
		current.clickReference?.onclick?.(event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		const current = activeStore();
		if (!current) return;
		noteOpenPointer(current, event);
		current.clickReference?.onpointerdown?.(event);
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onmousedown?.(event);
		if (event.defaultPrevented) return;
		activeStore()?.clickReference?.onmousedown?.(event);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		const current = activeStore();
		current?.clickReference?.onkeydown?.(event);
		current?.dismissOnKeyDown?.(event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
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

{#snippet content()}
	{@render children?.()}
{/snippet}

{#snippet host(props: HTMLAttributes<HTMLElement>, _buttonState: { disabled: boolean })}
	{#if render}
		{@render render(props, state, content)}
	{:else}
		<button {...props} {@attach register}>{@render content()}</button>
	{/if}
{/snippet}

<Button
	{disabled}
	{nativeButton}
	onclick={handleClick}
	onpointerdown={handlePointerDown}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	render={host}
	{...described}
/>
