<!--
	Shared increment and decrement button.
	Derived from Base UI v1.8.0 packages/react/src/number-field/root/useNumberFieldStepperButton.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	There is no ref. `focusableWhenDisabled` stays on, so read-only uses `aria-disabled`
	and a real `disabled` attribute only when the button itself is disabled.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { REASONS } from '@sveltery/utils';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { useNumberFieldContext } from './context.svelte.js';
	import { isTouchLikePointerType, PressAndHold } from '../internal/usePressAndHold.svelte.js';
	import { mergeCssStyle } from '../internal/css-style.js';
	import { chain } from '../internal/mergeProps.js';
	import type { NumberFieldStepperProps, NumberFieldStepperState } from './types.js';

	const SELECT_NONE = '-webkit-user-select: none; user-select: none';
	const releaseKey = createAttachmentKey();

	let {
		increment,
		disabled: disabledProp = false,
		nativeButton = true,
		render,
		children,
		style,
		onclick,
		onpointerdown,
		onpointerup,
		onpointermove,
		onmouseenter,
		onmouseleave,
		onmouseup,
		ontouchstart,
		ontouchend,
		...elementProps
	}: NumberFieldStepperProps & { increment: boolean } = $props();

	const model = useNumberFieldContext();
	const rootState = $derived(model.state);
	const atBoundary = $derived(
		rootState.value != null &&
			(increment
				? rootState.value >= model.maxWithDefault
				: rootState.value <= model.minWithDefault)
	);
	const disabled = $derived(disabledProp || rootState.disabled || atBoundary);
	const unavailable = $derived(disabled || rootState.readOnly);
	const pressReason = $derived(increment ? REASONS.incrementPress : REASONS.decrementPress);
	const button = new ButtonBehavior(() => ({
		disabled: unavailable,
		native: nativeButton,
		focusableWhenDisabled: true
	}));

	const press = new PressAndHold({
		getDisabled: () => disabled || model.options.getReadOnly(),
		getElement: () => model.inputElement,
		tick(triggerEvent) {
			return model.incrementValue(model.getStepAmount(triggerEvent), {
				direction: increment ? 1 : -1,
				event: triggerEvent,
				reason: pressReason
			});
		},
		onStop() {
			model.commit();
		}
	});

	const state: NumberFieldStepperState = $derived({ ...rootState, disabled });

	function stepFromClick(event: MouseEvent) {
		model.commitTypedValue(event, pressReason);
		const previous = model.baseValue;
		model.incrementValue(model.getStepAmount(event), {
			direction: increment ? 1 : -1,
			event,
			reason: pressReason
		});
		const committed = model.lastChangedValue ?? model.baseValue;
		if (committed !== previous) model.commit();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented || press.shouldSkipClick(event)) return;
		stepFromClick(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented || event.button) return;
		model.commitTypedValue(event, pressReason);
		model.lastChangedValue = null;
		if (!isTouchLikePointerType(event.pointerType)) model.focusInput();
		press.onPointerDown(event);
	}

	function handlePointerUp(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onpointerup?.(event);
		if (event.defaultPrevented) return;
		press.onPointerUp(event);
	}

	function handlePointerMove(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onpointermove?.(event);
		if (event.defaultPrevented) return;
		press.onPointerMove(event);
	}

	function handleMouseUp(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onmouseup?.(event);
		if (event.defaultPrevented) return;
		press.onMouseUp();
	}

	function handleTouchEnd(event: TouchEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		ontouchend?.(event);
		if (event.defaultPrevented) return;
		press.onTouchEnd();
	}

	const hostProps: HTMLButtonAttributes = $derived(
		button.props({
			'aria-label': increment ? 'Increase' : 'Decrease',
			'aria-controls': model.options.getId(),
			...(nativeButton && disabled ? { disabled: true } : {}),
			tabindex: -1,
			style: mergeCssStyle(SELECT_NONE, style),
			...getStateAttributesProps(state, numberFieldStateAttributes),
			...elementProps,
			onclick: handleClick,
			onpointerdown: handlePointerDown,
			onpointerup: handlePointerUp,
			onpointermove: handlePointerMove,
			onmouseenter: chain((event) => press.onMouseEnter(event), onmouseenter),
			onmouseleave: chain(() => press.onMouseLeave(), onmouseleave),
			onmouseup: handleMouseUp,
			ontouchstart: chain(() => press.onTouchStart(), ontouchstart),
			ontouchend: handleTouchEnd,
			[releaseKey]: press.attach
		})
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
