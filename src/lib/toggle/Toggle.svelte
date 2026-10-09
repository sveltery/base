<!--
	A two-state button that can be on or off. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/toggle/Toggle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToggleGroupContext } from '../toggle-group/context.svelte.js';
	import { warnMissingToggleValue } from '../toggle-group/warn.js';
	import type { ToggleProps, ToggleState } from './types.js';

	const uid = $props.id();
	const group = useToggleGroupContext();

	let {
		pressed = $bindable(undefined),
		defaultPressed = false,
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
	const controllable = createControllableValue<boolean>({
		getProp: () => pressed,
		setProp: (next) => {
			pressed = next;
		},
		getDefault: () => defaultPressed
	});
	const pressedState = $derived(
		group ? group.values.includes(resolvedValue) : controllable.value === true
	);
	const toggleState: ToggleState = $derived({ pressed: pressedState, disabled: disabledState });

	let node = $state<HTMLButtonElement | null>(null);
	const renderIndex = group
		? group.roving.claim(untrack(() => disabled || Boolean(group.disabled)))
		: 0;

	function register(element: HTMLElement) {
		node = element as HTMLButtonElement;
		const remove = group?.roving.register(
			element,
			() => ({
				value: resolvedValue,
				disabled: disabledState
			}),
			renderIndex
		);
		return () => {
			remove?.();
			if (node === element) node = null;
		};
	}

	$effect(() => {
		if (!group?.valueProvided || valueProp !== undefined) return;
		warnMissingToggleValue();
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

		controllable.set(nextPressed, details);
	}

	const hostProps: HTMLButtonAttributes & Record<symbol, Attachment<HTMLButtonElement>> =
		$derived.by(() => {
			const roving = group?.roving.item(node, register, { onfocus, onkeydown }, renderIndex, {
				disabled: disabledState
			});
			return {
				type: 'button',
				...(roving
					? { 'aria-disabled': disabledState ? ('true' as const) : ('false' as const) }
					: {}),
				...elementProps,
				...getStateAttributesProps(toggleState),
				'aria-pressed': pressedState,
				disabled: disabledState,
				onclick: handleClick,
				...roving
			};
		});
</script>

{#if render}
	{@render render(hostProps, toggleState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
