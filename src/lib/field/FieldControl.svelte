<!--
	The form control to label and validate. Renders an `<input>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/control/FieldControl.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { flushSync, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { useFormContext } from '../form/context.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from './context.svelte.js';
	import { Labelable, useLabelableContext } from './labelable.svelte.js';
	import type { FieldControlProps, FieldControlState } from './types.js';

	type ValueElement = HTMLElement & { value: string; form?: HTMLFormElement | null };

	const uid = $props.id();
	const elementKey = createAttachmentKey();
	const controlSource = Symbol();

	let {
		id: idProp,
		name: nameProp,
		value = $bindable<string | number | null | undefined>(),
		defaultValue,
		disabled: disabledProp = false,
		onValueChange,
		autofocus = false,
		render,
		children,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		'aria-describedby': ariaDescribedBy,
		...elementProps
	}: FieldControlProps = $props();

	const form = useFormContext();
	const fallbackId = `base-ui-${uid}`;
	// Outside Field.Root this is the shared inert field. Registration and
	// validation no-op. A private labelable still supplies ids.
	const field = useFieldContext();
	const labelableFromContext = useLabelableContext(true);
	const labelable = labelableFromContext ?? new Labelable(undefined, () => fallbackId);

	const controllable = createControllableValue<string | number | null | undefined>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue,
		onChange(next) {
			notifyControlled(textValue(next));
		}
	});
	const isControlled = $derived(controllable.controlled);
	const registeredValue = $derived(
		controllable.controlled && controllable.value != null
			? textValue(controllable.value)
			: undefined
	);
	const disabled = $derived(Boolean(field.disabled || disabledProp));
	const name = $derived(field.name ?? nameProp ?? undefined);
	const controlId = $derived(labelable.controlId || idProp || fallbackId);

	let inputEl = $state<ValueElement | null>(null);
	let hadExplicitId = false;

	function notifyControlled(current: string) {
		form.clearErrors(name);
		field.setDirty(current !== String(field.validityData.initialValue ?? ''));
		field.setFilled(current !== '');
		field.change(current);
	}

	const controlState: FieldControlState = $derived({
		...field.state,
		disabled
	});

	function isValueElement(node: HTMLElement): node is ValueElement {
		return 'value' in node;
	}

	function textValue(value: string | number | null | undefined) {
		return value == null ? '' : String(value);
	}

	function readElement(element: ValueElement | null) {
		if (!element) return undefined;
		return textValue(element.value);
	}

	function remember(node: HTMLElement) {
		if (isValueElement(node)) inputEl = node;
		return () => {
			if (inputEl === node) inputEl = null;
		};
	}

	$effect(() => {
		const explicit = idProp;
		const fallback = fallbackId;
		untrack(() => {
			if (explicit !== undefined) {
				hadExplicitId = true;
				labelable.registerControlId(controlSource, explicit);
			} else if (hadExplicitId) {
				labelable.registerControlId(controlSource, fallback);
			} else {
				labelable.registerControlId(controlSource, undefined);
				labelable.resetControlId();
			}
		});
		return () => {
			untrack(() => labelable.registerControlId(controlSource, undefined));
		};
	});

	$effect(() => {
		const element = inputEl;
		const currentValue = untrack(() => registeredValue);
		if (currentValue !== undefined) field.setFilled(currentValue !== '');
		else if (element) field.setFilled(element.value !== '');
	});

	const registration = attachFieldControl(field, {
		enabled: () => !disabled,
		id: () => controlId,
		name: () => nameProp ?? undefined,
		getValue: () => readElement(inputEl) ?? textValue(controllable.value)
	});

	function publish(node: HTMLElement) {
		const stopRegistration = registration(node);
		const stopRemember = render ? remember(node) : undefined;
		if (!render && isValueElement(node)) inputEl = node;
		return () => {
			stopRegistration?.();
			stopRemember?.();
			if (inputEl === node) inputEl = null;
		};
	}

	$effect(() => {
		if (!autofocus || !inputEl) return;
		const view = inputEl.ownerDocument.defaultView ?? window;
		if (view.document.activeElement === inputEl) field.setFocused(true);
	});

	function domValue() {
		return textValue(controllable.value);
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		const inputValue = event.currentTarget.value;
		const details = createChangeEventDetails(REASONS.none, event);
		onValueChange?.(inputValue, details);

		if (details.isCanceled) {
			event.currentTarget.value = domValue();
			return;
		}

		if (!isControlled && event.defaultPrevented) return;

		controllable.set(inputValue);
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
		// `onblur` may have written `bind:value` without flushing. Commit that value.
		flushSync();
		field.commit(inputEl?.value ?? event.currentTarget.value);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.currentTarget.tagName !== 'INPUT' || event.key !== 'Enter') return;

		field.setTouched(true);
		const ownerForm = event.currentTarget.form;
		if (ownerForm && ownerForm === form.element && !event.defaultPrevented) {
			const input = event.currentTarget;
			const submitCount = form.submitCount;
			// Submit increments the count and validates. If Enter never submits,
			// this still commits the value the input has when the timer fires.
			setTimeout(() => {
				if (form.submitCount !== submitCount) return;
				field.commit(input.value);
			}, 0);
			return;
		}
		field.commit(event.currentTarget.value);
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
		...(controllable.value != null ? { value: domValue() } : {}),
		oninput: handleInput,
		onfocus: handleFocus,
		onblur: handleBlur,
		onkeydown: handleKeyDown,
		[elementKey]: publish
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, controlState, children)}
{:else}
	<input {...hostProps} />
{/if}
