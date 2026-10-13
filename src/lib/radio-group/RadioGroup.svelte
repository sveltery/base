<!--
	Provides shared state to a series of radio buttons. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/radio-group/RadioGroup.tsx
	and the linear composite path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Inside a Field, the group is the field's control. `inputRef` is not ported.
	The radios are the existing Radio parts.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { contains, ownerDocument } from '@sveltery/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { isSkipped } from '../internal/composite-skip.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { fieldValidityMapping } from '../field/attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { BoundControl } from '../field/bound-control.svelte.js';
	import { LabelableId, findLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { findFieldsetRootContext } from '../fieldset/context.svelte.js';
	import { setRadioGroupContext } from '../radio/group-context.js';
	import { serializeValue } from '../internal/serializeValue.js';
	import type { RadioRootChangeEventDetails } from '../radio/types.js';
	import type { RadioGroupProps, RadioGroupState } from './types.js';

	const uid = $props.id();
	const controlKey = createAttachmentKey();
	const rootKey = createAttachmentKey();

	let {
		value = $bindable(),
		defaultValue,
		disabled: disabledProp = false,
		readonly: readOnly = false,
		required = false,
		name: nameProp,
		form,
		onValueChange,
		onfocus,
		onblur,
		onkeydown,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: RadioGroupProps = $props();

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

	/**
	 * The radio whose serialized value a source holds, so a bound group keeps non-string values.
	 * Before the radios register, the source's value is kept as is.
	 */
	function optionFor(raw: unknown): unknown {
		for (const element of roving.elements) {
			const option = roving.meta(element)?.value;
			if (option !== undefined && serializeValue(option) === raw) return option;
		}
		return raw;
	}

	const bound = new BoundControl<unknown>(field, {
		kind: 'radio',
		read: () => checkedValue,
		write: (next) => selection.set(next),
		fromSource: optionFor
	});

	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = bound.initial(defaultValue);

	let touched = $state(false);

	const reading = useDirection();
	const formContext = useFormContext();
	const fieldset = findFieldsetRootContext();
	const labelable = findLabelableContext();
	const disabled = $derived(field.disabled || disabledProp);
	const name = $derived(field.name ?? nameProp);

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
		name: () => nameProp,
		getValue: () => checkedValue ?? null
	});

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

	function setCheckedValue(next: unknown, details: RadioRootChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		if (Object.is(next, checkedValue)) return;
		selection.set(next);
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
			return name;
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
		setCheckedValue,
		setTouched(next) {
			touched = next;
		}
	});

	function arrowsTouched(event: KeyboardEvent) {
		if (!event.key.startsWith('Arrow')) return;
		// Shift still selects. Ctrl, Alt, and Meta do not move, so they must not
		// leave the group armed for the next focus.
		touched = !(event.altKey || event.ctrlKey || event.metaKey);
		field.setFocused(true);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onblur?.(event);
		touched = false;
		if (contains(event.currentTarget, event.relatedTarget)) return;
		field.setTouched(true);
		field.setFocused(false);
		if (field.validationMode === 'onBlur') field.commit(checkedValue);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
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

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived.by(() => {
			const explicitLabel = elementProps['aria-labelledby'];
			const labelledBy = explicitLabel ?? labelable?.labelId ?? fieldset?.legendId;
			const describedBy = labelable?.describedBy(ariaDescribedBy ?? undefined);
			return {
				...getStateAttributesProps(groupState, fieldValidityMapping),
				role: 'radiogroup',
				...(disabled ? { 'aria-disabled': true as const } : {}),
				...(readOnly ? { 'aria-readonly': true as const } : {}),
				...(required ? { 'aria-required': true as const } : {}),
				...elementProps,
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				...(field.valid === false && !disabled ? { 'aria-invalid': true as const } : {}),
				onfocus: (event) => {
					onfocus?.(event);
					field.setFocused(true);
				},
				onblur: handleBlur,
				onkeydown: handleKeyDown,
				onkeydowncapture: arrowsTouched,
				[controlKey]: registration,
				[rootKey]: rememberRoot
			};
		});
</script>

{#if render}
	{@render render(hostProps, groupState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
