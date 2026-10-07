<!--
	A two-state button that can be on or off. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/toggle/Toggle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToggleGroupContext } from '../toggle-group/context.svelte.js';
	import { warnMissingToggleValue } from '../toggle-group/warn.js';
	import type { ToggleProps, ToggleState } from './types.js';

	const uid = $props.id();
	const group = useToggleGroupContext();
	const slot = group ? group.roving.claim() : 0;

	let {
		pressed = $bindable(false),
		disabled = false,
		value: valueProp,
		onPressedChange,
		onclick,
		onfocus,
		onkeydown,
		render,
		children,
		// Toggle never participates in forms and cannot change its button type.
		form: _form,
		type: _type,
		...elementProps
	}: ToggleProps = $props();

	// "" is treated as omitted, matching useBaseUiId(valueProp || undefined).
	const resolvedValue = $derived(valueProp ? valueProp : `base-ui-${uid}`);
	const disabledState = $derived(disabled || (group?.disabled ?? false));
	const pressedState = $derived(group ? group.values.includes(resolvedValue) : pressed);
	const toggleState: ToggleState = $derived({ pressed: pressedState, disabled: disabledState });

	let node = $state<HTMLButtonElement | null>(null);

	function register(element: HTMLButtonElement) {
		node = element;
		const remove = group?.roving.register(element);
		return () => {
			remove?.();
			if (node === element) node = null;
		};
	}

	$effect(() => {
		if (!group?.valueProvided || valueProp !== undefined) return;
		warnMissingToggleValue();
	});

	$effect(() => {
		if (!group) return;
		group.roving.sync(disabledState);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented || disabledState) return;

		const nextPressed = !pressedState;
		const details = createChangeEventDetails(REASONS.none, event);
		// onPressedChange runs before the group commits so canceling here vetoes both.
		onPressedChange?.(nextPressed, details);
		if (details.isCanceled) return;

		if (group) {
			group.setGroupValue(resolvedValue, nextPressed, details);
			return;
		}

		pressed = nextPressed;
	}

	const hostProps: HTMLButtonAttributes & Record<symbol, Attachment<HTMLButtonElement>> =
		$derived.by(() => {
			const roving = group?.roving.host(slot, node, register, { onfocus, onkeydown });
			const attachmentKey = group?.roving.keyForAttachment();
			return {
				type: 'button',
				...(roving
					? { tabindex: roving.tabindex, 'aria-disabled': disabledState ? 'true' : 'false' }
					: {}),
				...elementProps,
				...getStateAttributesProps(toggleState),
				'aria-pressed': pressedState,
				disabled: disabledState,
				onclick: handleClick,
				...(roving && attachmentKey
					? {
							onfocus: roving.onfocus,
							onkeydown: roving.onkeydown,
							[attachmentKey]: roving[attachmentKey]
						}
					: {})
			};
		});
</script>

{#if render}
	{@render render(hostProps, toggleState)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
