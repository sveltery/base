<!--
	Represents the checkbox itself. Renders a `<span>` and a hidden checkbox beside it.
	Derived from Base UI v1.8.0 packages/react/src/checkbox/root/CheckboxRoot.tsx
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	An optional CheckboxGroup context supplies the shared value. When that group
	sets `allValues`, `parent` toggles the set and other checkboxes register with it.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { dispatchClick } from '../internal/click.js';
	import { toCssStyle } from '../internal/css-style.js';
	import {
		createChangeEventDetails,
		REASONS,
		visuallyHidden,
		visuallyHiddenInput
	} from '@sveltery/utils';
	import { checkboxRootAttributes } from './attributes.js';
	import { setCheckboxContext } from './context.js';
	import { useCheckboxGroupContext } from './group-context.js';
	import { FieldValueSync, attachFieldControl } from '../internal/field-register-control.svelte.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { queueValueEvent } from '../internal/value-events.js';
	import { useFieldContext, useFieldItemContext } from '../field/context.svelte.js';
	import {
		BoundControl,
		boundInputProps,
		sourceBoolean,
		type BoundInputProps
	} from '../field/bound-control.svelte.js';
	import { AriaLabelledBy, LabelableId, findLabelableContext } from '../field/labelable.svelte.js';
	import { FieldFocusOwner } from '../field/focus-owner.svelte.js';
	import { useFormContext } from '../form/context.js';
	import { getDefaultFormSubmitter } from './submitter.js';
	import type { CheckboxHostProps, CheckboxRootProps, CheckboxRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();
	const group = useCheckboxGroupContext();
	const field = useFieldContext();
	const fieldItem = useFieldItemContext();
	const formContext = useFormContext();
	const labelable = findLabelableContext();

	let {
		checked = $bindable(),
		defaultChecked = false,
		disabled = false,
		readonly: readOnly = false,
		required = false,
		indeterminate = false,
		parent = false,
		nativeButton = false,
		name: nameProp,
		value,
		uncheckedValue,
		form,
		id,
		onCheckedChange,
		onclick,
		onkeydown,
		onfocus,
		onblur,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: CheckboxRootProps = $props();

	// In a group, the group binds the value.
	const bound = group
		? undefined
		: new BoundControl(field, {
				kind: 'checkbox',
				read: () => checked === true,
				write: (next) => {
					checked = next;
				},
				fromSource: sourceBoolean
			});

	// `defaultChecked` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (checked === undefined) checked = bound?.initial(defaultChecked) ?? defaultChecked;

	const generatedRootId = $derived('base-ui-' + uid);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	// Checkboxes that share their group's labelable scope leave the Field's id to the group.
	const controlId = new LabelableId(labelable, {
		id: () => id || undefined,
		fallback: () => generatedControlId,
		enabled: () => !group || group.labelable !== labelable
	});
	const hiddenInputId = $derived(nativeButton ? undefined : controlId.current);
	const rootId = $derived(nativeButton ? controlId.current : generatedRootId);
	const name = $derived(field.name ?? nameProp);

	const checkedState = $derived(checked === true);

	// `value` identifies the checkbox in a group. `name` is the fallback, matching upstream.
	const identified = $derived(value !== undefined ? value : name);
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
	// Inside a bound Field the source encodes the name, and a group item's value.
	const boundProps: BoundInputProps = $derived.by(() => {
		if (parent) return {};
		if (!group) return bound?.inputProps() ?? {};
		return identified === undefined ? {} : boundInputProps(field.binding, 'checkbox', identified);
	});
	const inputName = $derived(parent ? undefined : field.binding ? boundProps.name : name);

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
	let rootNode = $state<HTMLElement | null>(null);
	const ariaLabelledBy = new AriaLabelledBy(labelable, {
		explicit: () => ariaLabelledByProp ?? undefined,
		input: () => (nativeButton ? null : inputNode),
		labelId: () => (hiddenInputId ? `${hiddenInputId}-label` : undefined),
		ariaLabel: () => elementProps['aria-label']
	});
	const describedBy = $derived(labelable?.describedBy(ariaDescribedBy ?? undefined));
	const invalid = $derived(field.valid === false && !isDisabled);

	// Inside a group, the group is the field's control and owns its value.
	const fieldControl = attachFieldControl(field, {
		enabled: () => !group && !isDisabled,
		id: () => generatedRootId,
		name: () => nameProp,
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
		const element = rootNode;
		if (!input || parent) return;
		return field.registerInput(input, {
			element,
			value: group ? identified : undefined
		});
	});

	$effect(() => {
		if (group && inputNode && inputName) return group.registerInput(inputNode);
	});

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		const release = fieldControl(element);
		return () => {
			release?.();
			if (rootNode === element) rootNode = null;
		};
	}

	const inputStyle = $derived(toCssStyle(inputName ? visuallyHiddenInput : visuallyHidden));
	// A bound lone checkbox submits `on` or nothing, which the source decodes as a boolean.
	const hasUncheckedValue = $derived(
		group === undefined && !field.binding && Boolean(inputName) && uncheckedValue !== undefined
	);
	let uncheckedNode = $state<HTMLInputElement | null>(null);
	const submittedValue = $derived.by(() => {
		// The binding's props carry the option value and any attachment the source adds.
		if (field.binding) return boundProps;
		if (value === undefined) return {};
		// Inside a group an unticked checkbox submits an empty value attribute.
		if (group) return { value: (isChecked && value) || '' };
		return { value };
	});

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
		const node = rootNode;
		const childId = node?.id;
		if (!model || parent || key === undefined || !childId) return;
		return model.registerChildId(key, childId);
	});

	function handleInputClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		event.stopPropagation();
		if (event.defaultPrevented || readOnly || isDisabled) {
			if (!event.defaultPrevented) event.preventDefault();
			return;
		}

		const nextChecked = event.currentTarget.checked;
		const details = createChangeEventDetails(REASONS.none, event);
		onCheckedChange?.(nextChecked, details);
		if (details.isCanceled) {
			event.preventDefault();
			return;
		}

		const key = identified;
		if (group?.parent && parent) {
			group.parent.toggle(details);
			if (details.isCanceled) {
				event.preventDefault();
				return;
			}
			// The children change from code, so they fire the events a click on each would.
			for (const input of group.inputs) {
				queueValueEvent(input, 'input');
				queueValueEvent(input, 'change');
			}
			return;
		}

		if (group?.parent && key !== undefined && !parent) {
			group.parent.toggleChild(key, nextChecked, details);
			if (details.isCanceled) event.preventDefault();
			return;
		}

		if (group && key !== undefined && !parent) {
			const next = nextChecked ? [...group.value, key] : group.value.filter((item) => item !== key);
			group.setValue(next, details);
			if (details.isCanceled) event.preventDefault();
			return;
		}

		checked = nextChecked;
	}

	const button = new ButtonBehavior(() => ({ disabled: isDisabled, native: nativeButton }));
	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => isDisabled,
		target: () => rootNode
	});
	let enterHeld = false;

	function handleInputFocus() {
		rootNode?.focus();
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event);
		focusOwner.set(true);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onblur?.(event);
		const input = inputNode;
		if (!input) return;
		field.setTouched(true);
		focusOwner.set(false);
		if (field.validationMode === 'onBlur') field.commit(group ? group.value : input.checked);
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (enterHeld) {
			event.preventDefault();
			return;
		}

		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		event.preventDefault();
		if (!inputNode) return;
		dispatchClick(inputNode, event);
	}

	// Enter does not tick the checkbox. It submits the form unless a later listener cancels it,
	// so it bypasses the button keydown, which would turn a non-native Enter into a click.
	function handleEnter(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (isDisabled) return;
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		// A native button turns Enter into a click. That click is ignored until the key is up.
		if (nativeButton) enterHeld = true;
		const formToSubmit = inputNode?.form ?? null;
		const view = event.currentTarget.ownerDocument.defaultView ?? window;
		view.queueMicrotask(() => {
			if (!event.defaultPrevented) getDefaultFormSubmitter(formToSubmit)?.click();
		});
	}

	const hostProps: CheckboxHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy.current;
		const controls = parent ? group?.parent?.controls : undefined;
		const props = button.props({
			...checkboxRootAttributes(checkboxState),
			...(parent ? { 'data-parent': '' } : {}),
			id: rootId,
			role: 'checkbox',
			'aria-checked': isIndeterminate ? 'mixed' : isChecked,
			...(readOnly ? { 'aria-readonly': true as const } : {}),
			...(required ? { 'aria-required': true as const } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...(describedBy ? { 'aria-describedby': describedBy } : {}),
			...(invalid ? { 'aria-invalid': true as const } : {}),
			...elementProps,
			...(controls ? { 'aria-controls': controls } : {}),
			onclick: handleClick,
			onfocus: handleFocus,
			onblur: handleBlur,
			onkeydown,
			[rootKey]: registerRoot
		});
		return {
			...props,
			onkeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
				if (event.key === 'Enter') return handleEnter(event);
				// Keyup can land elsewhere when Enter moves focus. Any other key starts fresh.
				if (!isDisabled) enterHeld = false;
				props.onkeydown(event);
			},
			onkeyup(event: KeyboardEvent) {
				if (event.key === 'Enter') enterHeld = false;
				props.onkeyup(event);
			},
			onpointerdown(event: PointerEvent) {
				enterHeld = false;
				props.onpointerdown(event);
			},
			onfocusout(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
				enterHeld = false;
				props.onfocusout?.(event);
			}
		} as CheckboxHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, checkboxState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
<input
	bind:this={inputNode}
	type="checkbox"
	checked={isChecked}
	defaultChecked={resetsToChecked}
	disabled={isDisabled}
	{form}
	id={hiddenInputId}
	name={inputName}
	{required}
	style={inputStyle}
	tabindex="-1"
	aria-hidden="true"
	aria-describedby={describedBy}
	aria-invalid={invalid || undefined}
	{...submittedValue}
	onclick={handleInputClick}
	onfocus={handleInputFocus}
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
