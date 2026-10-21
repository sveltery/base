<!--
	Provides a shared state to a series of checkboxes. Renders a `<fieldset>` element, so a
	Fieldset.Legend inside names the group and `disabled` disables every box natively.
	Derived from Base UI v1.8.0 packages/react/src/checkbox-group/CheckboxGroup.tsx
	and packages/react/src/checkbox-group/useCheckboxGroupParent.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Inside a Field, the group is the field's control. The checkboxes are the existing Checkbox parts.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { SvelteSet } from 'svelte/reactivity';
	import { areArraysEqual } from '@sveltery/utils';
	import { setCheckboxGroupContext } from '../checkbox/group-context.js';
	import { fieldValidityMapping } from '../field/attributes.js';
	import { isEligibleInput } from '../field/validity.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		FieldsetRootContextValue,
		findFieldsetRootContext,
		setFieldsetRootContext
	} from '../fieldset/context.svelte.js';
	import type { CheckboxGroupChangeDetails } from '../checkbox/group-context.js';
	import { CheckboxGroupParent } from './parent.svelte.js';
	import type { CheckboxGroupProps, CheckboxGroupState } from './types.js';

	const uid = $props.id();
	const controlKey = createAttachmentKey();
	const rootKey = createAttachmentKey();

	let {
		value = $bindable(),
		defaultValue,
		allValues,
		name: nameProp,
		disabled: disabledProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: CheckboxGroupProps = $props();

	const EMPTY: string[] = [];

	const field = useFieldContext();
	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = defaultValue;
	const formContext = useFormContext();
	const labelable = useLabelableContext();
	const disabled = $derived(field.disabled || (disabledProp ?? false));

	// The group takes its name from `aria-labelledby`, so Field.Label must not point `for`
	// at one checkbox inside it.
	new LabelableId(labelable, { id: () => null });

	function currentValue() {
		return Array.isArray(value) ? value : EMPTY;
	}

	// What native FormData sends: checked values of enabled inputs in this form.
	function submittedValue() {
		const formElement = formContext.element;
		if (!formElement) return currentValue();
		const successful = [...field.registeredInputs]
			.filter(([input]) => input.checked && isEligibleInput(input, formElement))
			.map(([, registration]) => registration.value);
		return currentValue().filter((item) => successful.includes(item));
	}

	function setValue(next: string[], details: CheckboxGroupChangeDetails) {
		if (details.isCanceled) return;
		value = next;
	}

	const fieldset = new FieldsetRootContextValue(findFieldsetRootContext(), () =>
		Boolean(disabledProp)
	);
	setFieldsetRootContext(fieldset);

	const parentModel = new CheckboxGroupParent({
		readValue: () => currentValue(),
		readAllValues: () => allValues ?? [],
		commit: setValue
	});

	const registration = attachFieldControl(field, {
		enabled: () => Boolean(field.name) && !disabled,
		id: () => elementProps.id ?? `base-ui-${uid}`,
		name: () => field.name,
		getValue: () => currentValue(),
		getFormValue: submittedValue
	});

	new FieldValueSync(field, formContext, {
		value: currentValue,
		name: () => field.name,
		filled: (next) => next.length > 0,
		equals: (next, initial) => areArraysEqual(next, Array.isArray(initial) ? initial : EMPTY)
	});

	let rootNode = $state<HTMLElement | null>(null);
	const inputs = new SvelteSet<HTMLInputElement>();
	// A child input's `form` attribute decides which form resets the group.
	restoreOnReset(() => inputs.values().next().value ?? rootNode, {
		restore: () => {
			const next = defaultValue ? [...defaultValue] : [];
			if (!areArraysEqual(currentValue(), next)) value = next;
		}
	});

	function rememberRoot(node: HTMLElement) {
		rootNode = node;
		return () => {
			if (rootNode === node) rootNode = null;
		};
	}

	setCheckboxGroupContext({
		get value() {
			return currentValue();
		},
		get defaultValue() {
			return defaultValue;
		},
		get disabled() {
			return disabled;
		},
		get name() {
			return nameProp;
		},
		get parent() {
			return allValues === undefined ? undefined : parentModel;
		},
		labelable,
		inputs,
		registerInput(input) {
			inputs.add(input);
			return () => inputs.delete(input);
		},
		setValue,
		adopt(item) {
			if (!currentValue().includes(item)) value = [...currentValue(), item];
		}
	});

	const groupState: CheckboxGroupState = $derived({
		...field.state,
		disabled
	});

	const hostProps: HTMLFieldsetAttributes & Record<symbol, Attachment<HTMLElement>> = $derived.by(
		() => {
			const describedBy = labelable.describedBy(ariaDescribedBy ?? undefined);
			const labelledBy = fieldset.legendId ?? labelable.labelId;
			return {
				...getStateAttributesProps(groupState, fieldValidityMapping),
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				...elementProps,
				disabled: disabledProp || undefined,
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				[controlKey]: registration,
				[rootKey]: rememberRoot
			};
		}
	);
</script>

{#if render}
	{@render render(hostProps, groupState, children)}
{:else}
	<fieldset {...hostProps}>{@render children?.()}</fieldset>
{/if}
