<!--
	Represents the radio button itself.
	Renders a `<span>` box with a real `<input type="radio">` laid over it.
	Derived from Base UI v1.9.0 packages/react/src/radio/root/RadioRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Native input props and handlers go to the input, so it works without JavaScript and fires
	real `input` and `change` events. `class`, `style` and `host` go to the box.
	An optional group context supplies the shared value. When that context includes
	roving focus, the input registers as a composite item.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { ACTIVE_COMPOSITE_ITEM } from '../internal/composite-root.svelte.js';
	import { radioRootAttributes } from './attributes.js';
	import { setRadioContext } from './context.js';
	import { useRadioGroupContext } from './group-context.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useFieldItemContext } from '../field/item-context.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { chain } from '../internal/mergeProps.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import { serializeValue } from '../internal/serializeValue.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { forwardBoxClick, overlayInputStyle } from '../internal/overlay-input.js';
	import type { RadioBoxProps, RadioRootProps, RadioRootState } from './types.js';

	const uid = $props.id();
	const group = useRadioGroupContext();
	const field = useFieldContext();
	const fieldItem = useFieldItemContext();
	const formContext = useFormContext();
	const labelable = useLabelableContext();

	let {
		checked = $bindable(),
		defaultChecked = false,
		value,
		name: nameProp,
		disabled: disabledProp,
		readonly: readOnlyProp,
		required: requiredProp,
		form: formProp,
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
	}: RadioRootProps = $props();

	const serialized = $derived(value !== undefined ? serializeValue(value) : undefined);
	// Without a spread, a radio in a named Field of a remote form names itself from the field.
	const bound = $derived(
		nameProp === undefined && serialized !== undefined
			? field.bindRemote('radio', serialized)
			: undefined
	);

	// `defaultChecked` is the initial value of an empty binding, as in HTML. A spread's `checked`
	// is the remote form's value.
	// svelte-ignore state_referenced_locally
	if (checked === undefined) checked = (bound?.checked as boolean | undefined) ?? defaultChecked;
	// In a group, a radio that starts checked selects its value, as a remote form spread does.
	// svelte-ignore state_referenced_locally
	if (group && checked && value !== undefined) group.setCheckedValue(value);

	const generatedControlId = `base-ui-${uid}-control`;
	// Radios that share their group's labelable scope leave the Field's id to the group.
	const controlId = new LabelableId(labelable, {
		id: () => id || undefined,
		fallback: () => generatedControlId,
		enabled: () => !group || group.labelable !== labelable
	});
	const inputId = $derived(id || controlId.current || generatedControlId);

	const isChecked = $derived(group ? group.checkedValue === value : checked === true);
	const disabled = $derived(
		field.disabled || fieldItem.disabled || Boolean(group?.disabled) || (disabledProp ?? false)
	);
	const renderClaim = group?.roving?.claim(untrack(() => disabled));
	const readOnly = $derived(Boolean(group?.readOnly) || (readOnlyProp ?? false));
	const required = $derived(Boolean(group?.required) || (requiredProp ?? false));
	// The control's own name wins: a remote form encodes the value type and its id in it.
	const name = $derived(
		nameProp ??
			(bound?.name as string | undefined) ??
			(group ? group.name : formContext.remote ? undefined : field.name)
	);
	const form = $derived(formProp ?? group?.form);

	const radioState: RadioRootState = $derived({
		...field.state,
		checked: isChecked,
		disabled,
		readOnly,
		required
	});

	setRadioContext({
		get checked() {
			return isChecked;
		},
		get disabled() {
			return disabled;
		},
		get readOnly() {
			return readOnly;
		},
		get required() {
			return required;
		}
	});

	let inputNode = $state<HTMLInputElement | null>(null);
	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => inputNode
	});
	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	const labelledBy = $derived(
		ariaLabelledByProp ?? (inputProps['aria-label']?.trim() ? undefined : labelable.labelId)
	);

	// The group is the field's control. Each radio input joins its validity.
	$effect(() => {
		const input = inputNode;
		if (!input || !group) return;
		return field.registerInput(input, { element: input, value: undefined });
	});

	function registerInput(element: HTMLElement) {
		inputNode = element as HTMLInputElement;
		const remove = group?.roving?.register(element, () => ({ value, disabled }), renderClaim);
		return () => {
			remove?.();
			if (inputNode === element) inputNode = null;
		};
	}

	function syncInput() {
		if (inputNode && inputNode.checked !== isChecked) inputNode.checked = isChecked;
	}

	// The browser checks the clicked radio and, in a named group, unchecks the others.
	// Keep every input on the selected value, also when nothing in the browser changed it.
	$effect(syncInput);

	// The group restores its value. This catches a selection the owner kept.
	restoreOnReset(() => inputNode, {
		restore: group
			? undefined
			: () => {
					if (checked !== defaultChecked) checked = defaultChecked;
				},
		settle: syncInput
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		// A canceled click puts back the checked state the browser changed.
		if (readOnly || disabled || (group && value === undefined)) {
			event.preventDefault();
			return;
		}
		if (!group) {
			checked = true;
			return;
		}
		// A click on the checked radio changes nothing, as a native radio fires no change for it.
		if (Object.is(group.checkedValue, value)) return;
		group.setCheckedValue(value);
		field.setTouched(true);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		focusOwner.set(true);
		group?.roving?.highlight(event.currentTarget);
		// Read the group's touched flag live. Arrow keys set it in the capture
		// phase of this same turn, before a derived value would refresh.
		if (disabled || readOnly || !group?.touched) return;
		event.currentTarget.click();
		group.setTouched(false);
	}

	function handleBlur() {
		// The group releases the Field when focus leaves it, so moves between its radios
		// do not churn the focused state.
		if (!group) focusOwner.set(false);
	}

	const tabIndex = $derived(
		group?.roving && renderClaim
			? group.roving.tabIndex(inputNode, renderClaim, {
					disabled,
					selected: isChecked,
					hasSelection: group.checkedValue !== undefined
				})
			: inputProps.tabindex
	);
	const activeItem = $derived(isChecked ? { [ACTIVE_COMPOSITE_ITEM]: '' } : {});

	const boxProps: RadioBoxProps = $derived({
		...radioRootAttributes(radioState),
		...host,
		onclick: chain(forwardBoxClick(inputNode), host?.onclick),
		class: className,
		style: style ? `position: relative; ${style}` : 'position: relative'
	});
</script>

{#snippet content()}
	<input
		{...inputProps}
		{...activeItem}
		type="radio"
		id={inputId}
		{name}
		value={serialized}
		checked={isChecked}
		defaultChecked={group ? value !== undefined && group.defaultValue === value : defaultChecked}
		{disabled}
		{form}
		{required}
		style={overlayInputStyle}
		tabindex={tabIndex}
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		onclick={handleClick}
		onfocus={chain(handleFocus, onfocus)}
		onblur={chain(handleBlur, onblur)}
		{@attach registerInput}
	/>
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(boxProps, radioState, content)}
{:else}
	<span {...boxProps}>{@render content()}</span>
{/if}
