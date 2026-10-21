<!--
	Represents the checkbox itself.
	Renders a `<span>` box with a real `<input type="checkbox">` laid over it.
	Derived from Base UI v1.9.0 packages/react/src/checkbox/root/CheckboxRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Native input props and handlers go to the input, so it works without JavaScript and fires
	real `input` and `change` events. `class`, `style` and `host` go to the box.
	An optional CheckboxGroup context supplies the shared value. When that group
	sets `allValues`, `parent` toggles the set and other checkboxes register with it.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { checkboxRootAttributes } from './attributes.js';
	import { setCheckboxContext } from './context.js';
	import { useCheckboxGroupContext } from './group-context.js';
	import { chain } from '../internal/mergeProps.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { queueValueEvent } from '../internal/value-events.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useFieldItemContext } from '../field/item-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import { overlayInputStyle } from '../internal/overlay-input.js';
	import type { CheckboxBoxProps, CheckboxRootProps, CheckboxRootState } from './types.js';

	const uid = $props.id();
	const group = useCheckboxGroupContext();
	const field = useFieldContext();
	const fieldItem = useFieldItemContext();
	const formContext = useFormContext();
	const labelable = useLabelableContext();

	let {
		checked = $bindable(),
		defaultChecked = false,
		disabled: disabledProp,
		readonly: readOnlyProp,
		required: requiredProp,
		indeterminate = false,
		parent = false,
		name: nameProp,
		value: valueProp,
		uncheckedValue,
		form,
		id,
		type: _type,
		class: className,
		style,
		host,
		onclick,
		onfocus,
		onblur,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...inputProps
	}: CheckboxRootProps = $props();
	const disabled = $derived(disabledProp ?? false);
	const readOnly = $derived(readOnlyProp ?? false);
	const required = $derived(requiredProp ?? false);

	// Without a spread, a checkbox in a named Field of a remote form names itself from the field.
	const bound = $derived(
		nameProp === undefined && !parent
			? field.bindRemote('checkbox', group ? valueProp : undefined)
			: undefined
	);
	const value = $derived(valueProp ?? (bound?.value as string | undefined));

	// `defaultChecked` is the initial value of an empty binding, as in HTML. A spread's `checked`
	// is the remote form's value.
	const checkedGiven = checked !== undefined;
	// svelte-ignore state_referenced_locally
	if (checked === undefined) checked = (bound?.checked as boolean | undefined) ?? defaultChecked;

	const generatedControlId = `base-ui-${uid}-control`;
	// Checkboxes that share their group's labelable scope leave the Field's id to the group.
	const controlId = new LabelableId(labelable, {
		id: () => id || undefined,
		fallback: () => generatedControlId,
		enabled: () => !group || group.labelable !== labelable
	});
	const inputId = $derived(id || controlId.current || generatedControlId);
	// The control's own name wins: a remote form encodes the value type and its id in it.
	const name = $derived(
		nameProp ??
			(bound?.name as string | undefined) ??
			group?.name ??
			(formContext.remote ? undefined : field.name)
	);

	const checkedState = $derived(checked === true);

	// `value` identifies the checkbox in a group. `name` is the fallback, matching upstream.
	const identified = $derived(value !== undefined ? value : name);
	// A grouped box ticked by its own `checked`, such as a remote form spread, joins the group.
	// svelte-ignore state_referenced_locally
	if (group && !parent && checkedGiven && checked && identified !== undefined) {
		group.adopt(identified);
	}
	const isChecked = $derived.by(() => {
		if (parent && group?.parent) return group.parent.checked;
		if (group && identified !== undefined && !parent) return group.value.includes(identified);
		return checkedState;
	});
	const isIndeterminate = $derived.by(() => {
		if (parent && group?.parent) return group.parent.indeterminate || indeterminate;
		return indeterminate;
	});
	const isDisabled = $derived(
		field.disabled || fieldItem.disabled || Boolean(group?.disabled) || disabled
	);
	const inputName = $derived(parent ? undefined : name);

	const checkboxState: CheckboxRootState = $derived({
		...field.state,
		checked: isChecked,
		disabled: isDisabled,
		readOnly,
		required,
		indeterminate: isIndeterminate
	});

	setCheckboxContext({
		get checked() {
			return isChecked;
		},
		get disabled() {
			return isDisabled;
		},
		get readOnly() {
			return readOnly;
		},
		get required() {
			return required;
		},
		get indeterminate() {
			return isIndeterminate;
		}
	});

	let inputNode = $state<HTMLInputElement | null>(null);
	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	const invalid = $derived(field.valid === false && !isDisabled);
	const labelledBy = $derived(
		ariaLabelledByProp ?? (inputProps['aria-label']?.trim() ? undefined : labelable.labelId)
	);

	// Inside a group, the group is the field's control and owns its value.
	const fieldControl = attachFieldControl(field, {
		enabled: () => !group && !isDisabled,
		id: () => inputId,
		name: () => nameProp ?? undefined,
		getValue: () => checkedState
	});

	if (!group) {
		new FieldValueSync(field, formContext, {
			value: () => checkedState,
			name: () => name,
			filled: (value) => value
		});
	}

	$effect(() => {
		const input = inputNode;
		if (!input || parent) return;
		return field.registerInput(input, {
			element: input,
			value: group ? identified : undefined
		});
	});

	$effect(() => {
		if (group && inputNode && !parent) return group.registerInput(inputNode);
	});

	function registerInput(element: HTMLElement) {
		inputNode = element as HTMLInputElement;
		const release = fieldControl(element);
		return () => {
			release?.();
			if (inputNode === element) inputNode = null;
		};
	}

	const hasUncheckedValue = $derived(
		group === undefined && Boolean(inputName) && uncheckedValue !== undefined
	);
	let uncheckedNode = $state<HTMLInputElement | null>(null);

	// The group or the parent checkbox owns a grouped checkbox's value and restores it.
	const resetsToChecked = $derived.by(() => {
		if (!group) return defaultChecked;
		return identified !== undefined && !parent && Boolean(group.defaultValue?.includes(identified));
	});

	function syncInput(input: HTMLInputElement) {
		if (input.checked !== isChecked) input.checked = isChecked;
		input.indeterminate = isIndeterminate;
		if (uncheckedNode) uncheckedNode.checked = !isChecked;
	}

	// A click clears `indeterminate` before the listener runs. Put it back after `checked` updates.
	$effect(() => {
		if (inputNode) syncInput(inputNode);
	});

	restoreOnReset(() => inputNode, {
		restore: group
			? undefined
			: () => {
					if (checked !== defaultChecked) checked = defaultChecked;
				},
		// A reset can leave the input out of step with state that did not change, such as a
		// parent checkbox or a `checked` the owner holds.
		settle: () => {
			if (inputNode) syncInput(inputNode);
		}
	});

	$effect(() => {
		const model = group?.parent;
		const key = identified;
		if (!model || key === undefined) return;
		model.setDisabled(key, isDisabled);
		return () => model.clearDisabled(key);
	});

	$effect(() => {
		const model = group?.parent;
		const key = identified;
		if (!model || parent || key === undefined || !inputNode) return;
		return model.registerChildId(key, inputId);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (readOnly || isDisabled) {
			event.preventDefault();
			return;
		}

		const nextChecked = event.currentTarget.checked;
		const details = createChangeEventDetails(REASONS.none, event);
		const key = identified;
		if (group?.parent && parent) {
			group.parent.toggle(details);
			// The children change from code, so they fire the events a click on each would.
			for (const input of group.inputs) {
				queueValueEvent(input, 'input');
				queueValueEvent(input, 'change');
			}
			return;
		}

		if (group?.parent && key !== undefined && !parent) {
			group.parent.toggleChild(key, nextChecked, details);
			return;
		}

		if (group && key !== undefined && !parent) {
			const next = nextChecked ? [...group.value, key] : group.value.filter((item) => item !== key);
			group.setValue(next, details);
			return;
		}

		checked = nextChecked;
	}

	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => isDisabled,
		target: () => inputNode
	});

	function handleFocus() {
		focusOwner.set(true);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		field.setTouched(true);
		focusOwner.set(false);
		if (field.validationMode === 'onBlur') {
			field.commit(group ? group.value : event.currentTarget.checked);
		}
	}

	const boxProps: CheckboxBoxProps = $derived({
		...checkboxRootAttributes(checkboxState),
		...(parent ? { 'data-parent': '' } : {}),
		...host,
		class: className,
		style: style ? `position: relative; ${style}` : 'position: relative'
	});
	const controls = $derived(parent ? group?.parent?.controls : undefined);
</script>

{#snippet content()}
	<input
		{...inputProps}
		type="checkbox"
		id={inputId}
		name={inputName}
		{value}
		checked={isChecked}
		defaultChecked={resetsToChecked}
		disabled={isDisabled}
		{form}
		{required}
		style={overlayInputStyle}
		aria-readonly={readOnly || undefined}
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		aria-invalid={invalid || undefined}
		aria-controls={controls}
		onclick={handleClick}
		onfocus={chain(handleFocus, onfocus)}
		onblur={chain(handleBlur, onblur)}
		{@attach registerInput}
	/>
	{#if hasUncheckedValue}
		<!-- Submits `uncheckedValue`. A native reset restores it with the checkbox above, so
		FormData never holds both values. -->
		<input
			bind:this={uncheckedNode}
			type="checkbox"
			hidden
			style="display: none !important"
			checked={!isChecked}
			defaultChecked={!resetsToChecked}
			disabled={isDisabled}
			{form}
			name={inputName}
			value={uncheckedValue}
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(boxProps, checkboxState, content)}
{:else}
	<span {...boxProps}>{@render content()}</span>
{/if}
