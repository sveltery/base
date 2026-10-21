<!--
	Provides shared state to a series of radio buttons. Renders a `<fieldset>` element, so a
	Fieldset.Legend inside names the group and `disabled` disables every radio natively.
	Derived from Base UI v1.9.0 packages/react/src/radio-group/RadioGroup.tsx
	and the linear composite path it mounts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Inside a Field, the group is the field's control. `inputRef` is not ported.
	The radios are the existing Radio parts.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { contains, ownerDocument } from '@sveltery/utils';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { isSkipped } from '../internal/composite-skip.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { chain } from '../internal/mergeProps.js';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { fieldValidityMapping } from '../field/attributes.js';
	import { isEligibleInput } from '../field/validity.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import {
		FieldsetRootContextValue,
		findFieldsetRootContext,
		setFieldsetRootContext
	} from '../fieldset/context.svelte.js';
	import { setRadioGroupContext } from '../radio/group-context.js';
	import type { RadioGroupProps, RadioGroupState } from './types.js';

	const uid = $props.id();
	const controlKey = createAttachmentKey();
	const rootKey = createAttachmentKey();

	let {
		value = $bindable(),
		defaultValue,
		disabled: disabledProp,
		readonly: readOnlyProp,
		required: requiredProp,
		name: nameProp,
		form: formProp,
		onfocusout,
		onkeydown,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: RadioGroupProps = $props();
	const readOnly = $derived(readOnlyProp ?? false);
	const required = $derived(requiredProp ?? false);
	const form = $derived(formProp ?? undefined);

	const field = useFieldContext();
	const roving: CompositeRoot = new CompositeRoot({
		orientation: () => 'both',
		direction: () => reading.direction,
		isItemDisabled: (element) =>
			isSkipped(element) || element.getAttribute('aria-disabled') === 'true',
		isItemSelected: (element): boolean => {
			const current = checkedValue;
			const meta = roving.meta(element) ?? {};
			return current !== undefined && meta.value === current && meta.disabled !== true;
		},
		keys: 'arrows',
		modifiers: 'shift-ok',
		homeEnd: false,
		stopPropagation: true,
		replacement: 'index',
		keydown: 'root'
	});

	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = defaultValue;

	let touched = $state(false);

	const reading = useDirection();
	const formContext = useFormContext();
	const labelable = useLabelableContext();
	const disabled = $derived(field.disabled || (disabledProp ?? false));
	const name = $derived(field.name ?? nameProp ?? undefined);
	// Radios that share a name get single selection and arrow keys from the browser, also
	// without JavaScript. A remote form throws on a named input it does not know, so an unnamed
	// group there keeps no name and relies on this group's roving focus.
	const generatedName = `base-ui-${uid}-radio`;
	const radioName = $derived(
		formContext.remote ? (nameProp ?? undefined) : (name ?? generatedName)
	);

	const fieldset = new FieldsetRootContextValue(findFieldsetRootContext(), () =>
		Boolean(disabledProp)
	);
	setFieldsetRootContext(fieldset);

	// The group takes its name from `aria-labelledby`, so Field.Label must not point `for`
	// at one radio inside it.
	new LabelableId(labelable, { id: () => null });

	const selection = new WrittenReference<unknown>(
		() => value,
		(next) => {
			value = next;
		}
	);
	const checkedValue = $derived(selection.current);

	const registration = attachFieldControl(field, {
		enabled: () => !disabled,
		id: () => elementProps.id ?? `base-ui-${uid}`,
		name: () => nameProp ?? undefined,
		getValue: () => checkedValue ?? null,
		getFormValue: submittedValue
	});

	// What native FormData sends: the checked value while its input is enabled and in this form.
	function submittedValue() {
		const formElement = formContext.element;
		if (!formElement) return checkedValue ?? null;
		for (const input of field.registeredInputs.keys()) {
			if (input.checked && isEligibleInput(input, formElement)) return checkedValue ?? null;
		}
		return null;
	}

	new FieldValueSync(field, formContext, {
		value: () => checkedValue,
		name: () => name,
		filled: (value) => value != null
	});

	let rootNode = $state<HTMLElement | null>(null);
	// Each radio input carries `form`, so the group resets with the form it names.
	function resetForm() {
		if (!form) return rootNode;
		const named = ownerDocument(rootNode).getElementById(form);
		return named instanceof HTMLFormElement ? named : null;
	}
	restoreOnReset(resetForm, {
		restore: () => {
			if (!Object.is(checkedValue, defaultValue)) selection.set(defaultValue);
		}
	});

	function rememberRoot(node: HTMLElement) {
		rootNode = node;
		return () => {
			if (rootNode === node) rootNode = null;
		};
	}

	setRadioGroupContext({
		roving,
		get disabled() {
			return disabled;
		},
		get readOnly() {
			return readOnly;
		},
		get required() {
			return required;
		},
		get name() {
			return radioName;
		},
		get form() {
			return form;
		},
		get checkedValue() {
			return checkedValue;
		},
		get defaultValue() {
			return defaultValue;
		},
		get touched() {
			return touched;
		},
		labelable,
		setCheckedValue(next) {
			if (!Object.is(next, checkedValue)) selection.set(next);
		},
		setTouched(next) {
			touched = next;
		}
	});

	function arrowsTouched(event: KeyboardEvent) {
		if (!event.key.startsWith('Arrow')) return;
		// Shift still selects. Ctrl, Alt, and Meta do not move, so they must not
		// leave the group armed for the next focus.
		touched = !(event.altKey || event.ctrlKey || event.metaKey);
	}

	function handleFocusOut(
		event: FocusEvent & { currentTarget: EventTarget & HTMLFieldSetElement }
	) {
		if (contains(event.currentTarget, event.relatedTarget)) return;
		touched = false;
		field.setTouched(true);
		field.setFocused(false);
		if (field.validationMode === 'onBlur') field.commit(checkedValue);
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLFieldSetElement }
	) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		roving.keydown(event);
	}

	const groupState: RadioGroupState = $derived({
		...field.state,
		disabled,
		readOnly,
		required
	});

	const hostProps: HTMLFieldsetAttributes & Record<symbol, Attachment<HTMLElement>> = $derived.by(
		() => {
			const labelledBy = fieldset.legendId ?? labelable.labelId;
			const describedBy = labelable.describedBy(ariaDescribedBy ?? undefined);
			return {
				...getStateAttributesProps(groupState, fieldValidityMapping),
				role: 'radiogroup',
				...(readOnly ? { 'aria-readonly': true as const } : {}),
				...(required ? { 'aria-required': true as const } : {}),
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				...elementProps,
				disabled: disabledProp || undefined,
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				...(field.valid === false && !disabled ? { 'aria-invalid': true as const } : {}),
				onfocusout: chain(handleFocusOut, onfocusout),
				onkeydown: handleKeyDown,
				onkeydowncapture: arrowsTouched,
				[controlKey]: registration,
				[rootKey]: rememberRoot,
				...roving.rootProps
			};
		}
	);
</script>

{#if render}
	{@render render(hostProps, groupState, children)}
{:else}
	<fieldset {...hostProps}>{@render children?.()}</fieldset>
{/if}
