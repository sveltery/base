<!--
	An individual OTP character input. Renders an `<input>` element.
	Derived from Base UI v1.8.0 packages/react/src/otp-field/input/OTPFieldInput.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The slot index comes from DOM order. Arrow direction follows `useDirection()`.
-->
<script lang="ts">
	import { DEV } from 'esm-env';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { devWarn } from '../collapsible/warn.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		createChangeEventDetails,
		createGenericEventDetails,
		REASONS
	} from '../internal/event-details.js';
	import { inputStateAttributes } from './attributes.js';
	import { useOTPFieldContext } from './context.svelte.js';
	import { stopEvent } from './dom.js';
	import { normalizeOTPValueWithDetails, removeOTPCharacter, replaceOTPValue } from './otp.js';
	import type { OTPFieldInputProps, OTPFieldInputState } from './types.js';

	let {
		render,
		children,
		type,
		'aria-label': ariaLabelProp,
		'aria-labelledby': ariaLabelledByProp,
		onmousedown,
		onfocus,
		onblur,
		oninput,
		onkeydown,
		onpaste,
		...elementProps
	}: OTPFieldInputProps = $props();

	const model = useOTPFieldContext();
	const reading = useDirection();
	let el = $state<HTMLInputElement | null>(null);
	const renderIndex = model.slots.claim();

	const index = $derived.by(() => {
		if (!el) return renderIndex;
		const registered = model.slots.elements.indexOf(el);
		return registered >= 0 ? registered : renderIndex;
	});
	const slotValue = $derived(model.value[index] ?? '');
	const inputState: OTPFieldInputState = $derived({
		...model.state,
		value: slotValue,
		index,
		filled: slotValue !== ''
	});
	const ariaLabel = $derived(index === 0 ? undefined : ariaLabelProp);
	const inheritedLabel = $derived(ariaLabelledByProp ?? model.inputAriaLabelledBy);

	function remember(node: HTMLElement) {
		if (!(node instanceof HTMLInputElement)) return;
		el = node;
		const stop = model.slots.register(node);
		return () => {
			if (el === node) el = null;
			stop();
		};
	}

	$effect(() => {
		if (!DEV || index !== 0 || ariaLabelProp == null) return;
		const labels = el?.labels;
		if (!el || (labels && labels.length > 0)) return;
		devWarn(
			'<OTPField.Input> ignores `aria-label` on the first input. Use a `<label>` or `<Field.Label>` to label the OTP field.'
		);
	});

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onmousedown?.(event);
		if (event.defaultPrevented || model.disabled) return;
		event.preventDefault();
		model.focusInput(index);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onfocus?.(event);
		if (event.defaultPrevented || model.disabled) return;
		model.handleInputFocus(index, event);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event);
		if (event.defaultPrevented) return;
		model.handleInputBlur(event);
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		if (event.defaultPrevented || model.disabled || model.readOnly) return;

		const rawValue = event.currentTarget.value;
		const [nextDigits, didRejectCharacters] = normalizeOTPValueWithDetails(
			rawValue,
			model.length,
			model.validationType,
			model.normalize
		);

		if (didRejectCharacters) {
			model.reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputChange, event));
		}

		if (nextDigits === '') {
			if (rawValue === '') {
				model.setValue(
					removeOTPCharacter(model.value, index),
					createChangeEventDetails(REASONS.inputClear, event)
				);
			} else if (slotValue !== '') {
				event.currentTarget.value = slotValue;
				event.currentTarget.select();
			}
			return;
		}

		const nextValue = replaceOTPValue(
			model.value,
			index,
			nextDigits,
			model.length,
			model.validationType,
			model.normalize
		);
		const committedValue = model.setValue(
			nextValue,
			createChangeEventDetails(REASONS.inputChange, event)
		);
		const shown = committedValue ?? model.value;
		event.currentTarget.value = shown[index] ?? '';
		if (committedValue != null) {
			model.queueFocusInput(Math.min(index + nextDigits.length, model.length - 1), committedValue);
		}
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || model.disabled) return;

		const firstIndex = 0;
		const lastIndex = Math.max(model.length - 1, firstIndex);
		const endTargetIndex = Math.min(model.value.length, lastIndex);
		const hasBoundaryModifier = (event.ctrlKey || event.metaKey) && !event.altKey;
		const rtl = reading.direction === 'rtl';
		const previousKey = rtl ? 'ArrowRight' : 'ArrowLeft';
		const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';

		if (event.key === previousKey) {
			stopEvent(event);
			model.focusInput(hasBoundaryModifier ? firstIndex : Math.max(firstIndex, index - 1));
			return;
		}

		if (event.key === nextKey) {
			stopEvent(event);
			model.focusInput(hasBoundaryModifier ? endTargetIndex : Math.min(lastIndex, index + 1));
			return;
		}

		if (event.key === 'Home' || event.key === 'ArrowUp') {
			stopEvent(event);
			model.focusInput(firstIndex);
			return;
		}

		if (event.key === 'End' || event.key === 'ArrowDown') {
			stopEvent(event);
			model.focusInput(endTargetIndex);
			return;
		}

		if (model.readOnly) return;

		function setKeyboardValue(nextValue: string, targetIndex: number) {
			const committedValue = model.setValue(
				nextValue,
				createChangeEventDetails(REASONS.keyboard, event)
			);
			if (committedValue != null) model.queueFocusInput(targetIndex, committedValue);
		}

		if (event.key === 'Backspace' && hasBoundaryModifier) {
			stopEvent(event);
			setKeyboardValue('', firstIndex);
			return;
		}

		if (event.key === 'Delete') {
			stopEvent(event);
			setKeyboardValue(removeOTPCharacter(model.value, index), index);
			return;
		}

		const inputValue = event.currentTarget.value;
		const fullSelection =
			event.currentTarget.selectionStart === 0 &&
			event.currentTarget.selectionEnd === inputValue.length;

		if (event.key.length === 1 && fullSelection && slotValue === event.key) {
			stopEvent(event);
			if (index < model.length - 1) model.focusInput(index + 1);
			return;
		}

		if (event.key === 'Backspace') {
			stopEvent(event);
			const targetIndex = Math.max(firstIndex, index - 1);
			const deleteIndex = slotValue === '' ? targetIndex : index;
			setKeyboardValue(removeOTPCharacter(model.value, deleteIndex), targetIndex);
		}
	}

	function handlePaste(event: ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onpaste?.(event);
		if (event.defaultPrevented || model.disabled || model.readOnly) return;

		let rawValue: string;
		try {
			rawValue = event.clipboardData?.getData('text/plain') ?? '';
		} catch {
			devWarn('<OTPField.Input> could not read clipboard text during paste handling.');
			return;
		}

		event.preventDefault();

		const [nextDigits, didRejectCharacters] = normalizeOTPValueWithDetails(
			rawValue,
			model.length,
			model.validationType,
			model.normalize
		);

		if (didRejectCharacters) {
			model.reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputPaste, event));
		}

		if (nextDigits === '') return;

		const committedValue = model.setValue(
			replaceOTPValue(
				model.value,
				index,
				nextDigits,
				model.length,
				model.validationType,
				model.normalize
			),
			createChangeEventDetails(REASONS.inputPaste, event)
		);

		if (committedValue != null) {
			model.queueFocusInput(Math.min(index + nextDigits.length, model.length - 1), committedValue);
		}
	}

	const hostProps: HTMLInputAttributes = $derived({
		...elementProps,
		...getStateAttributesProps(inputState, inputStateAttributes),
		id: model.getInputId(index),
		value: slotValue,
		type: type ?? (model.mask ? 'password' : 'text'),
		inputmode: model.inputMode,
		autocomplete: index === 0 ? model.autoComplete : 'off',
		autocorrect: 'off',
		spellcheck: false,
		enterkeyhint: index === model.length - 1 ? 'done' : 'next',
		maxlength: index === 0 ? model.length : undefined,
		tabindex: model.activeIndex === index ? 0 : -1,
		disabled: model.disabled || undefined,
		form: model.formId,
		pattern: model.pattern,
		readonly: model.readOnly || undefined,
		required: model.required || undefined,
		...(ariaLabel == null && inheritedLabel ? { 'aria-labelledby': inheritedLabel } : {}),
		...(model.invalid && !model.disabled ? { 'aria-invalid': true as const } : {}),
		...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
		onmousedown: handleMouseDown,
		onfocus: handleFocus,
		onblur: handleBlur,
		oninput: handleInput,
		onkeydown: handleKeyDown,
		onpaste: handlePaste,
		[model.slots.attachmentKey]: remember
	});
</script>

{#if render}
	{@render render(hostProps, inputState, children)}
{:else}
	<input {...hostProps} bind:this={el} />
{/if}
