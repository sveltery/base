<!--
	Provides a shared state to a series of checkboxes. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/checkbox-group/CheckboxGroup.tsx
	and packages/react/src/checkbox-group/useCheckboxGroupParent.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Inside a Field, the group is the field's control. The checkboxes are the existing Checkbox parts.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { areArraysEqual } from '@sveltery/utils';
	import { setCheckboxGroupContext } from '../checkbox/group-context.js';
	import { fieldValidityMapping } from '../field/attributes.js';
	import { useFieldContext } from '../field/context.svelte.js';
	import { LabelableId, findLabelableContext } from '../field/labelable.svelte.js';
	import { useFormContext } from '../form/context.js';
	import { attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { CheckboxGroupParent } from './parent.svelte.js';
	import type {
		CheckboxGroupChangeEventDetails,
		CheckboxGroupProps,
		CheckboxGroupState
	} from './types.js';

	const uid = $props.id();
	const controlKey = createAttachmentKey();

	let {
		value = $bindable(),
		defaultValue,
		allValues,
		disabled: disabledProp = false,
		onValueChange,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: CheckboxGroupProps = $props();

	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = defaultValue;

	const EMPTY: string[] = [];

	const field = useFieldContext();
	const formContext = useFormContext();
	const labelable = findLabelableContext();
	const disabled = $derived(field.disabled || disabledProp);

	// The group takes its name from `aria-labelledby`, so Field.Label must not point `for`
	// at one checkbox inside it.
	new LabelableId(labelable, { id: () => null, fallback: () => `base-ui-${uid}` });

	function currentValue() {
		return Array.isArray(value) ? value : EMPTY;
	}

	function setValue(next: string[], details: CheckboxGroupChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		value = next;
	}

	const parentModel = new CheckboxGroupParent({
		readValue: () => currentValue(),
		readAllValues: () => allValues ?? [],
		commit: setValue
	});

	const registration = attachFieldControl(field, {
		enabled: () => Boolean(field.name) && !disabled,
		id: () => elementProps.id ?? `base-ui-${uid}`,
		name: () => field.name,
		getValue: () => currentValue()
	});

	$effect(() => {
		field.setFilled(currentValue().length > 0);
	});

	useValueChanged(
		() => currentValue(),
		(next) => {
			formContext.clearErrors(field.name);
			const initial = field.validityData.initialValue;
			field.setDirty(!areArraysEqual(next, Array.isArray(initial) ? initial : EMPTY));
			field.change(next);
		}
	);

	setCheckboxGroupContext({
		get value() {
			return currentValue();
		},
		get disabled() {
			return disabled;
		},
		get parent() {
			return allValues === undefined ? undefined : parentModel;
		},
		labelable,
		setValue
	});

	const groupState: CheckboxGroupState = $derived({
		...field.state,
		disabled
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived.by(() => {
			const describedBy = labelable?.describedBy(ariaDescribedBy ?? undefined);
			return {
				...getStateAttributesProps(groupState, fieldValidityMapping),
				role: 'group',
				...(labelable?.labelId ? { 'aria-labelledby': labelable.labelId } : {}),
				...elementProps,
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				[controlKey]: registration
			};
		});
</script>

{#if render}
	{@render render(hostProps, groupState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
