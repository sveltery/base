<!--
	The form control to label and validate. Renders an `<input>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/control/FieldControl.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { useFormContext } from '../form/context.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from './context.svelte.js';
	import { useLabelableContext } from './labelable.svelte.js';
	import type { FieldControlProps, FieldControlState } from './types.js';

	const VALUE_UNSET = Symbol('field-control-value');
	const uid = $props.id();
	const elementKey = createAttachmentKey();
	const controlSource = Symbol();

	let {
		id: idProp,
		name: nameProp,
		value = $bindable(VALUE_UNSET as unknown as string | number | null | undefined),
		defaultValue,
		disabled: disabledProp = false,
		onValueChange,
		autofocus = false,
		render,
		children: _children,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		'aria-describedby': ariaDescribedBy,
		...elementProps
	}: FieldControlProps = $props();

	const field = useFieldContext();
	const labelable = useLabelableContext();
	const form = useFormContext();
	const fallbackId = `base-ui-${uid}`;

	const isControlled = $derived(!Object.is(value, VALUE_UNSET));
	const serialized = $derived(isControlled && value != null ? String(value) : undefined);
	const disabled = $derived(Boolean(field.disabled || disabledProp));
	const name = $derived(field.name ?? nameProp ?? undefined);
	const controlId = $derived(labelable.controlId || idProp || fallbackId);

	let inputEl = $state<HTMLInputElement | null>(null);
	let hadExplicitId = false;
	let seeded = false;
	let sawControlledValue = false;
	let previousSerialized: string | undefined;

	$effect(() => {
		if (!isControlled) return;
		const current = serialized;
		if (!sawControlledValue) {
			sawControlledValue = true;
			previousSerialized = current;
			return;
		}
		if (current === undefined || current === previousSerialized) {
			previousSerialized = current;
			return;
		}
		previousSerialized = current;
		form.clearErrors(name);
		field.setDirty(current !== String(field.validityData.initialValue ?? ''));
		field.change(current);
	});
	let blurCommitId = 0;

	const controlState: FieldControlState = $derived({
		...field.state,
		disabled
	});

	function remember(node: HTMLElement) {
		if (node instanceof HTMLInputElement) inputEl = node;
		return () => {
			if (inputEl === node) inputEl = null;
		};
	}

	$effect(() => {
		const explicit = idProp;
		if (explicit !== undefined) {
			hadExplicitId = true;
			labelable.registerControlId(controlSource, explicit);
			return;
		}
		if (hadExplicitId) {
			labelable.registerControlId(controlSource, fallbackId);
			return;
		}
		labelable.registerControlId(controlSource, undefined);
		labelable.resetControlId();
	});

	$effect(() => {
		return () => {
			labelable.registerControlId(controlSource, undefined);
		};
	});

	$effect(() => {
		const element = inputEl;
		const linked = isControlled;
		const current = serialized;
		const controlName = nameProp;
		const id = controlId;
		const active = !disabled;

		if (element && !linked && !seeded) {
			seeded = true;
			if (defaultValue != null && element.value === '') element.value = String(defaultValue);
		}

		const domValue = element?.value;
		const filledSource = linked ? current : domValue;
		if (filledSource !== undefined) field.setFilled(filledSource !== '');

		if (!active) {
			field.registerControl(controlSource, undefined);
			return;
		}

		field.registerControl(controlSource, {
			id,
			name: controlName ?? undefined,
			value: linked ? current : undefined,
			element,
			getValue: () => element?.value
		});
	});

	$effect(() => {
		return () => field.registerControl(controlSource, undefined);
	});

	$effect(() => {
		if (!autofocus || !inputEl) return;
		const view = inputEl.ownerDocument.defaultView ?? window;
		if (view.document.activeElement === inputEl) field.setFocused(true);
	});

	function domValue() {
		if (!isControlled || value == null || Object.is(value, VALUE_UNSET)) return '';
		return String(value);
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		const inputValue = event.currentTarget.value;
		const details = createChangeEventDetails(REASONS.none, event);
		onValueChange?.(inputValue, details);

		if (isControlled) {
			if (details.isCanceled) event.currentTarget.value = domValue();
			else value = inputValue;
			return;
		}

		field.setDirty(inputValue !== String(field.validityData.initialValue ?? ''));
		field.setFilled(inputValue !== '');

		if (!event.defaultPrevented && !details.isCanceled) {
			form.clearErrors(name);
			field.change(inputValue);
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onfocus?.(event);
		field.setFocused(true);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event);
		field.setTouched(true);
		field.setFocused(false);

		if (field.validationMode !== 'onBlur') return;
		const inputValue = event.currentTarget.value;
		field.commit(inputValue);

		if (!isControlled) return;
		const token = ++blurCommitId;
		queueMicrotask(() => {
			if (token !== blurCommitId) return;
			const nextValue = inputEl?.value;
			if (
				nextValue !== undefined &&
				nextValue !== inputValue &&
				nextValue !== String(field.validityData.initialValue ?? '')
			) {
				field.commit(nextValue);
			}
		});
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.currentTarget.tagName !== 'INPUT' || event.key !== 'Enter') return;

		field.setTouched(true);
		const inputValue = event.currentTarget.value;
		const ownerForm = event.currentTarget.form;
		if (ownerForm && ownerForm === form.element && !event.defaultPrevented) {
			const input = event.currentTarget;
			const submitCount = form.submitCount;
			setTimeout(() => {
				if (form.submitCount === submitCount) field.commit(input.value);
			}, 0);
			return;
		}
		field.commit(inputValue);
	}

	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	const hostProps: HTMLInputAttributes = $derived({
		...elementProps,
		...getStateAttributesProps(controlState, fieldValidityMapping),
		id: controlId ?? undefined,
		disabled: disabled || undefined,
		name,
		autofocus,
		...(labelable.labelId ? { 'aria-labelledby': labelable.labelId } : {}),
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		...(controlState.valid === false && !field.disabled && !disabled
			? { 'aria-invalid': true as const }
			: {}),
		...(isControlled ? { value: domValue() } : {}),
		oninput: handleInput,
		onfocus: handleFocus,
		onblur: handleBlur,
		onkeydown: handleKeyDown,
		...(render ? { [elementKey]: remember } : {})
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, controlState)}
{:else}
	<input {...hostProps} bind:this={inputEl} />
{/if}
