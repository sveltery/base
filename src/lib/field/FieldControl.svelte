<!--
	The form control to label and validate.
	Renders an `<input>` element.

	You can omit this part and use any Base UI input component instead. For example,
	[Input](https://base.sveltery.dev/components/input), [Checkbox](https://base.sveltery.dev/components/checkbox),
	or [Select](https://base.sveltery.dev/components/select), among others, will work with Field out of the box.
	Derived from Base UI v1.9.0 packages/react/src/field/control/FieldControl.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { flushSync, untrack } from 'svelte';
	import { ScopedTimeout, createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import { BROWSER } from 'esm-env';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { useFormContext } from '../internal/form-context.js';
	import { chain } from '../internal/mergeProps.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { nativeType } from '../form/source.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import type { FieldControlProps, FieldControlState } from './types.js';

	type ValueElement = HTMLElement & { value: string; form?: HTMLFormElement | null };

	const uid = $props.id();
	const elementKey = createAttachmentKey();
	const valueKey = createAttachmentKey();

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

	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = defaultValue;

	const form = useFormContext();
	const fallbackId = `base-ui-${uid}`;
	// Outside Field.Root these are the shared inert field and labelable scope. Registration
	// and validation no-op, and the control keeps its own id.
	const field = useFieldContext();
	const commitTimer = new ScopedTimeout();
	const labelable = useLabelableContext();

	useValueChanged(
		() => value,
		(next) => notifyChanged(textValue(next))
	);
	const registeredValue = $derived(value != null ? textValue(value) : undefined);
	const disabled = $derived(Boolean(field.disabled || disabledProp));
	const name = $derived(field.name ?? nameProp ?? undefined);
	const controlId = new LabelableId(labelable, {
		id: () => idProp ?? undefined,
		fallback: () => fallbackId
	});

	let inputEl = $state<ValueElement | null>(null);

	function notifyChanged(text: string) {
		form.clearErrors(name);
		field.setDirty(text !== String(field.validityData.initialValue ?? ''));
		field.setFilled(text !== '');
		field.change(text);
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
		const element = inputEl;
		const currentValue = untrack(() => registeredValue);
		if (currentValue !== undefined) field.setFilled(currentValue !== '');
		else if (element) field.setFilled(element.value !== '');
	});

	// An unedited input shows a new `defaultValue`, as in HTML, so read its filled state back.
	useValueChanged(
		() => defaultValue,
		() => {
			if (inputEl) field.setFilled(inputEl.value !== '');
		}
	);

	const registration = attachFieldControl(field, {
		enabled: () => !disabled,
		id: () => controlId.current,
		name: () => nameProp ?? undefined,
		getValue: () => readElement(inputEl) ?? textValue(value)
	});

	// The browser has put the input back to its `defaultValue`. Read it, like `bind:value`.
	restoreOnReset(() => inputEl, {
		restore: () => {
			const next = inputEl?.value;
			if (next !== undefined && next !== textValue(value)) value = next;
		}
	});

	function publish(node: HTMLInputElement) {
		const stopRemember = remember(node);
		const stopRegistration = registration(node);
		// Not `oninput`: Svelte delegates that to the root, after listeners on the form. A form
		// library that reads the value from the form's `input` event needs it written before.
		const stopInput = on(node, 'input', (event) => chain(handleInput, oninput)(event));
		return () => {
			stopInput();
			stopRegistration?.();
			stopRemember();
		};
	}

	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => inputEl
	});

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const inputValue = event.currentTarget.value;
		const details = createChangeEventDetails(REASONS.none, event);
		onValueChange?.(inputValue, details);

		// The component holds one value, so a canceled change puts the input back to it.
		if (details.isCanceled) {
			event.currentTarget.value = textValue(value);
			return;
		}

		value = inputValue;
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		field.setTouched(true);
		focusOwner.set(false);

		if (field.validationMode !== 'onBlur') return;
		// `onblur` may have written `bind:value` without flushing. Commit that value.
		flushSync();
		field.commit(inputEl?.value ?? event.currentTarget.value);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.currentTarget.tagName !== 'INPUT' || event.key !== 'Enter') return;

		field.setTouched(true);
		const ownerForm = event.currentTarget.form;
		if (ownerForm && ownerForm === form.element && !event.defaultPrevented) {
			const input = event.currentTarget;
			const submitCount = form.submitCount;
			// Submit increments the count and validates. If Enter never submits,
			// this still commits the value the input has when the timer fires.
			commitTimer.start(0, () => {
				if (form.submitCount !== submitCount) return;
				field.commit(input.value);
			});
			return;
		}
		field.commit(event.currentTarget.value);
	}

	// A bound field's source supplies the encoded name, `type` and value. Base owns `aria-invalid`.
	const bound = $derived.by(() => {
		const binding = field.binding;
		if (!binding) return undefined;
		const props = binding.as(nativeType(field.controlType ?? 'text'), defaultValue ?? undefined);
		// Copy the getters, not their values. Reading `aria-invalid` would track every issue, and
		// `value` is written by `syncValue`.
		const descriptors = Object.getOwnPropertyDescriptors(props);
		delete descriptors['aria-invalid'];
		delete descriptors.value;
		return {
			props: Object.defineProperties({}, descriptors) as Record<string, unknown>,
			value: () => (props as Record<string, unknown>).value
		};
	});

	/** The value the element shows: the source's when bound, else `value`. */
	const shownValue = $derived.by(() => {
		if (bound) {
			const boundValue = bound.value();
			return boundValue === undefined ? undefined : textValue(boundValue as string);
		}
		return value != null ? textValue(value) : undefined;
	});

	// Assigning `value` makes the browser forget that the user typed it, which turns off
	// `minlength` and `maxlength` checks, so the client writes it only when it differs, like
	// `bind:value`. The server renders it as the `value` attribute. A value that goes away
	// clears the element, as removing a spread `value` does.
	let hadValue = false;
	function syncValue(node: HTMLElement) {
		const next = shownValue ?? (hadValue ? '' : undefined);
		hadValue = shownValue !== undefined;
		if (next !== undefined && isValueElement(node) && node.value !== next) node.value = next;
	}

	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	const hostProps: HTMLInputAttributes = $derived({
		...elementProps,
		...getStateAttributesProps(controlState, fieldValidityMapping),
		id: controlId.current,
		disabled: disabled || undefined,
		name,
		autofocus,
		...(labelable.labelId ? { 'aria-labelledby': labelable.labelId } : {}),
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		...(controlState.valid === false && !field.disabled && !disabled
			? { 'aria-invalid': true as const }
			: {}),
		...(defaultValue != null ? { defaultValue: textValue(defaultValue) } : {}),
		...(!BROWSER && shownValue !== undefined ? { value: shownValue } : {}),
		...bound?.props,
		onfocus: chain(() => focusOwner.set(true), onfocus),
		onblur: chain(handleBlur, onblur),
		onkeydown: chain(handleKeyDown, onkeydown),
		[elementKey]: publish,
		[valueKey]: syncValue
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, controlState, children)}
{:else}
	<input {...hostProps} />
{/if}
