<!--
	The form control to label and validate. Renders an `<input>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/control/FieldControl.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { useFormContext } from '../form/context.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from './context.svelte.js';
	import { useLabelableContext } from './labelable.svelte.js';
	import type { FieldControlProps, FieldControlState } from './types.js';

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

	const controllable = createControllableValue<string | number | null | undefined>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue,
		onChange(next) {
			if (next == null) return;
			notifyControlled(String(next));
		}
	});
	const isControlled = $derived(controllable.controlled);
	const serialized = $derived(controllable.value != null ? String(controllable.value) : undefined);
	const disabled = $derived(Boolean(field.disabled || disabledProp));
	const name = $derived(field.name ?? nameProp ?? undefined);
	const controlId = $derived(labelable.controlId || idProp || fallbackId);

	let inputEl = $state<HTMLInputElement | null>(null);
	let hadExplicitId = false;
	let seeded = false;
	let blurCommitId = 0;

	function notifyControlled(current: string) {
		form.clearErrors(name);
		field.setDirty(current !== String(field.validityData.initialValue ?? ''));
		field.change(current);
	}

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
		const linked = isControlled;
		const current = linked ? serialized : undefined;
		const controlName = nameProp;
		const id = controlId;
		const active = !disabled;

		if (element && !linked && !seeded) {
			seeded = true;
			if (defaultValue != null && element.value === '') element.value = String(defaultValue);
		}

		const domValueNow = element?.value;
		const filledSource = linked ? current : domValueNow;
		if (filledSource !== undefined) field.setFilled(filledSource !== '');

		if (!active) {
			field.registerControl(controlSource, undefined);
			return () => field.registerControl(controlSource, undefined);
		}

		field.registerControl(controlSource, {
			id,
			name: controlName ?? undefined,
			value: linked ? current : undefined,
			element,
			getValue: () => element?.value
		});
		return () => field.registerControl(controlSource, undefined);
	});

	$effect(() => {
		if (!autofocus || !inputEl) return;
		const view = inputEl.ownerDocument.defaultView ?? window;
		if (view.document.activeElement === inputEl) field.setFocused(true);
	});

	function domValue() {
		if (controllable.value == null) return '';
		return String(controllable.value);
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		const inputValue = event.currentTarget.value;
		const details = createChangeEventDetails(REASONS.none, event);
		onValueChange?.(inputValue, details);

		if (!isControlled) {
			field.setDirty(inputValue !== String(field.validityData.initialValue ?? ''));
			field.setFilled(inputValue !== '');
		}

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
		...(controllable.value != null ? { value: domValue() } : {}),
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
