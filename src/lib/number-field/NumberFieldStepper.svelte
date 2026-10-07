<!--
	Shared increment and decrement button.
	Derived from Base UI v1.8.0 packages/react/src/number-field/root/useNumberFieldStepperButton.ts,
	packages/react/src/internals/use-button/useButton.ts, and
	packages/react/src/utils/useFocusableWhenDisabled.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	There is no ref. `focusableWhenDisabled` stays on, so read-only uses `aria-disabled`
	and a real `disabled` attribute only when the button itself is disabled.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createGenericEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { useNumberFieldContext } from './context.svelte.js';
	import { createPressAndHold, isTouchLikePointerType } from './press-and-hold.svelte.js';
	import { mergeCssStyle } from '../internal/css-style.js';
	import type {
		EventWithOptionalKeyState,
		NumberFieldStepperProps,
		NumberFieldStepperState
	} from './types.js';

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
		onmousedown,
		onmouseenter,
		onmouseleave,
		onmouseup,
		ontouchstart,
		ontouchend,
		onkeydown,
		onkeyup,
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

	const press = createPressAndHold({
		getDisabled: () => disabled || model.options.getReadOnly(),
		getElement: () => model.inputElement,
		tick(triggerEvent) {
			return model.incrementValue(model.getStepAmount(triggerEvent as EventWithOptionalKeyState), {
				direction: increment ? 1 : -1,
				event: triggerEvent,
				reason: pressReason
			});
		},
		onStop(nativeEvent) {
			model.commit(
				model.lastChangedValue ?? model.baseValue,
				createGenericEventDetails(pressReason, nativeEvent)
			);
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
		if (committed !== previous) {
			model.commit(committed, createGenericEventDetails(pressReason, event));
		}
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (unavailable) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
		if (event.defaultPrevented || press.shouldSkipClick(event)) return;
		stepFromClick(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (unavailable) {
			event.preventDefault();
			return;
		}
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

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (unavailable) return;
		onmousedown?.(event);
	}

	function handleMouseEnter(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onmouseenter?.(event);
		if (event.defaultPrevented) return;
		press.onMouseEnter(event);
	}

	function handleMouseLeave(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onmouseleave?.(event);
		if (event.defaultPrevented) return;
		press.onMouseLeave();
	}

	function handleMouseUp(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onmouseup?.(event);
		if (event.defaultPrevented) return;
		press.onMouseUp();
	}

	function handleTouchStart(
		event: TouchEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		ontouchstart?.(event);
		if (event.defaultPrevented) return;
		press.onTouchStart();
	}

	function handleTouchEnd(event: TouchEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		ontouchend?.(event);
		if (event.defaultPrevented) return;
		press.onTouchEnd();
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (unavailable) {
			if (event.key !== 'Tab') event.preventDefault();
			return;
		}
		onkeydown?.(event);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (unavailable) return;
		onkeyup?.(event);
	}

	const hostProps: HTMLButtonAttributes = $derived({
		...(nativeButton ? { type: 'button' as const } : { role: 'button' as const }),
		'aria-label': increment ? 'Increase' : 'Decrease',
		'aria-controls': model.options.getId(),
		...(nativeButton
			? { 'aria-disabled': unavailable }
			: unavailable
				? { 'aria-disabled': true as const }
				: {}),
		...(nativeButton && disabled ? { disabled: true } : {}),
		tabindex: -1,
		style: mergeCssStyle(SELECT_NONE, style),
		...getStateAttributesProps(state, numberFieldStateAttributes),
		...elementProps,
		onclick: handleClick,
		onpointerdown: handlePointerDown,
		onpointerup: handlePointerUp,
		onpointermove: handlePointerMove,
		onmousedown: handleMouseDown,
		onmouseenter: handleMouseEnter,
		onmouseleave: handleMouseLeave,
		onmouseup: handleMouseUp,
		ontouchstart: handleTouchStart,
		ontouchend: handleTouchEnd,
		onkeydown: handleKeyDown,
		onkeyup: handleKeyUp,
		[releaseKey]: press.attach
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<button {...hostProps}>{@render content()}</button>
{/if}
