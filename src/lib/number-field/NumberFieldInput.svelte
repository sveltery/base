<!--
	The native input control in the number field. Renders an `<input>` element.
	Derived from Base UI v1.8.0 packages/react/src/number-field/input/NumberFieldInput.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	This is not Field.Control. Upstream renders its own text input and registers it with Field.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { useFieldContext } from '../field/context.svelte.js';
	import { useLabelableContext } from '../field/labelable.svelte.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { useNumberFieldContext } from './context.svelte.js';
	import type { NumberFieldInputProps, NumberFieldInputState } from './types.js';

	const elementKey = createAttachmentKey();

	let {
		render,
		children,
		onfocus,
		onblur,
		oninput,
		onkeydown,
		onpaste,
		'aria-roledescription': ariaRoleDescription = 'Number field',
		'aria-describedby': ariaDescribedBy,
		...elementProps
	}: NumberFieldInputProps = $props();

	const model = useNumberFieldContext();
	const field = useFieldContext();
	const labelable = useLabelableContext(true);

	const state: NumberFieldInputState = $derived(model.state);
	const describedBy = $derived(labelable?.describedBy(ariaDescribedBy ?? undefined));
	const ariaInvalid = $derived(
		!state.disabled && (field.invalid || field.state.valid === false) ? true : undefined
	);

	function remember(node: HTMLElement) {
		if (node instanceof HTMLInputElement) model.inputElement = node;
		return () => {
			if (model.inputElement === node) model.inputElement = null;
		};
	}

	watchFieldControl(field, {
		enabled: () => !model.options.getDisabled(),
		id: () => model.options.getId(),
		name: () => model.options.getNameProp(),
		element: () => model.inputElement,
		getValue: () => model.options.getValue()
	});

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onfocus?.(event);
		if (event.defaultPrevented) return;
		model.handleFocus();
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event);
		if (event.defaultPrevented) return;
		model.handleBlur(event);
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		if (event.defaultPrevented) return;
		const accepted = model.applyInputText(event.currentTarget.value, event);
		if (!accepted) event.currentTarget.value = model.inputValue;
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		model.handleKeyDown(event);
	}

	function handlePaste(event: ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onpaste?.(event);
		if (event.defaultPrevented) return;
		model.handlePaste(event);
	}

	const hostProps: HTMLInputAttributes = $derived({
		...elementProps,
		...getStateAttributesProps(state, numberFieldStateAttributes),
		id: model.options.getId(),
		required: state.required || undefined,
		disabled: state.disabled || undefined,
		readonly: state.readOnly || undefined,
		inputmode: model.inputMode,
		value: model.inputValue,
		type: 'text',
		autocomplete: 'off',
		autocorrect: 'off',
		spellcheck: false,
		'aria-roledescription': ariaRoleDescription,
		...(ariaInvalid ? { 'aria-invalid': true as const } : {}),
		...(labelable?.labelId ? { 'aria-labelledby': labelable.labelId } : {}),
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		onfocus: handleFocus,
		onblur: handleBlur,
		oninput: handleInput,
		onkeydown: handleKeyDown,
		onpaste: handlePaste,
		[elementKey]: remember
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, state, children)}
{:else}
	<input {...hostProps} bind:this={model.inputElement} />
{/if}
