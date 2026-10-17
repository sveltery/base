<!--
	Represents the radio button itself.
	Renders a `<span>` element and a hidden `<input>` beside.
	Derived from Base UI v1.9.0 packages/react/src/radio/root/RadioRoot.tsx
	and the native-label fallback of useAriaLabelledBy.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	An optional group context supplies the shared value. When that context includes
	roving focus, this root registers as a composite item.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { ACTIVE_COMPOSITE_ITEM } from '../internal/composite-root.svelte.js';
	import { dispatchClick } from '../internal/click.js';
	import { toCssStyle } from '../internal/css-style.js';
	import {
		createChangeEventDetails,
		REASONS,
		visuallyHidden,
		visuallyHiddenInput
	} from '@sveltery/utils';
	import { radioRootAttributes } from './attributes.js';
	import { setRadioContext } from './context.js';
	import { useRadioGroupContext } from './group-context.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useFieldItemContext } from '../field/item-context.js';
	import {
		AriaLabelledBy,
		LabelableId,
		useLabelableContext
	} from '../internal/labelable-provider.svelte.js';
	import { chain } from '../internal/mergeProps.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import { serializeValue } from '../internal/serializeValue.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import type { RadioHostProps, RadioRootProps, RadioRootState } from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();
	const group = useRadioGroupContext();
	const field = useFieldContext();
	const fieldItem = useFieldItemContext();
	const labelable = useLabelableContext();

	let {
		value,
		disabled: disabledProp,
		readonly: readOnlyProp,
		required: requiredProp,
		nativeButton = false,
		id,
		onclick,
		onkeydown,
		onfocus,
		onblur,
		'aria-labelledby': ariaLabelledByProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: RadioRootProps = $props();

	const generatedRootId = $derived(`base-ui-${uid}`);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	// Radios that share their group's labelable scope leave the Field's id to the group.
	const controlId = new LabelableId(labelable, {
		id: () => id ?? undefined,
		fallback: () => generatedControlId,
		enabled: () => !group || group.labelable !== labelable
	});
	const hiddenInputId = $derived(nativeButton ? undefined : controlId.current);
	const rootId = $derived(nativeButton ? controlId.current : generatedRootId);

	const checked = $derived(group !== undefined ? group.checkedValue === value : value === '');
	const disabled = $derived(
		field.disabled || fieldItem.disabled || Boolean(group?.disabled) || (disabledProp ?? false)
	);
	const renderClaim = group?.roving?.claim(untrack(() => disabled));
	const readOnly = $derived(Boolean(group?.readOnly) || (readOnlyProp ?? false));
	const required = $derived(Boolean(group?.required) || (requiredProp ?? false));
	const serialized = $derived(value !== undefined ? serializeValue(value) : undefined);
	const fieldName = $derived(group?.name);
	const fieldForm = $derived(group?.form);

	const radioState: RadioRootState = $derived({
		...field.state,
		checked,
		disabled,
		readOnly,
		required
	});

	setRadioContext({
		get checked() {
			return checked;
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

	let rootNode = $state<HTMLElement | null>(null);
	let inputNode = $state<HTMLInputElement | null>(null);
	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => rootNode
	});
	const ariaLabelledBy = new AriaLabelledBy(labelable, {
		explicit: () => ariaLabelledByProp ?? undefined,
		input: () => (nativeButton ? null : inputNode),
		labelId: () => (hiddenInputId ? `${hiddenInputId}-label` : undefined),
		ariaLabel: () => elementProps['aria-label']
	});
	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	const invalid = $derived(group !== undefined && field.valid === false && !disabled);

	// The group is the field's control. Each radio input joins its validity.
	$effect(() => {
		const input = inputNode;
		const element = rootNode;
		if (!input || !group) return;
		return field.registerInput(input, { element, value: undefined });
	});
	// The click that checks the input. React's radio `onChange` is that click,
	// so modifier keys on the activation are visible to `onValueChange`.
	let activationEvent: Event | undefined;

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		const remove = group?.roving?.register(element, () => ({ value, disabled }), renderClaim);
		return () => {
			remove?.();
			if (rootNode === element) rootNode = null;
		};
	}

	const inputStyle = $derived(toCssStyle(fieldName ? visuallyHiddenInput : visuallyHidden));
	function selectedNow() {
		return group !== undefined ? group.checkedValue === value : value === '';
	}

	function syncInput() {
		const input = inputNode;
		if (!input) return;
		const next = selectedNow();
		if (input.checked !== next) input.checked = next;
	}

	$effect(() => {
		const input = inputNode;
		const next = checked;
		if (!input) return;
		input.checked = next;
	});

	$effect(() => group?.registerInputSync?.(syncInput));

	function syncGroupInputs() {
		if (group?.syncInputs) group.syncInputs();
		else syncInput();
	}

	// The group restores its value. This catches a selection the owner kept.
	restoreOnReset(() => inputNode, { settle: syncInput });

	function handleInputClick(event: MouseEvent) {
		// Clicks dispatched on the input from the root and from focus are an
		// implementation detail and must not reach ancestors.
		event.stopPropagation();
		activationEvent = event;
	}

	function handleInputChange(event: Event) {
		const source = activationEvent ?? event;
		activationEvent = undefined;
		if (event.defaultPrevented || disabled || readOnly || value === undefined) {
			syncGroupInputs();
			return;
		}

		const details = createChangeEventDetails(REASONS.none, source);
		group?.setCheckedValue(value, details);
		if (!details.isCanceled) field.setTouched(true);
		syncGroupInputs();
	}

	function handleInputFocus() {
		rootNode?.focus();
	}

	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		event.preventDefault();
		if (!inputNode) return;
		dispatchClick(inputNode, event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		focusOwner.set(true);
		if (event.currentTarget instanceof HTMLElement) group?.roving?.highlight(event.currentTarget);
		// Read the group's touched flag live. Arrow keys set it in the capture
		// phase of this same turn, before a derived value would refresh.
		if (disabled || readOnly || !group?.touched) return;
		inputNode?.click();
		group?.setTouched(false);
	}

	function handleBlur() {
		// The group releases the Field when focus leaves it, so moves between its radios
		// do not churn the focused state.
		if (!group) focusOwner.set(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Radio only activates with Space. Enter never becomes a click.
		if (event.key === 'Enter') event.preventDefault();
	}

	const hostProps: RadioHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy.current;
		return button.props({
			...radioRootAttributes(radioState),
			...(group?.roving && renderClaim
				? {
						tabindex: group.roving.tabIndex(rootNode, renderClaim, {
							disabled,
							selected: checked,
							hasSelection: group.checkedValue !== undefined
						})
					}
				: {}),
			id: rootId,
			role: 'radio',
			'aria-checked': checked,
			...(checked ? { [ACTIVE_COMPOSITE_ITEM]: '' } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...(describedBy ? { 'aria-describedby': describedBy } : {}),
			...(invalid ? { 'aria-invalid': true as const } : {}),
			...elementProps,
			onclick: handleClick,
			onkeydown: chain(handleKeyDown, onkeydown),
			onfocus: chain(handleFocus, onfocus),
			onblur: chain(handleBlur, onblur),
			[rootKey]: registerRoot
		}) as RadioHostProps & Record<symbol, Attachment<HTMLElement>>;
	});
</script>

{#if render}
	{@render render(hostProps, radioState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
<input
	bind:this={inputNode}
	type="radio"
	{checked}
	defaultChecked={group !== undefined && value !== undefined && group.defaultValue === value}
	{disabled}
	form={fieldForm}
	id={hiddenInputId}
	name={fieldName}
	readonly={readOnly}
	{required}
	style={inputStyle}
	tabindex="-1"
	aria-hidden="true"
	{...serialized !== undefined ? { value: serialized } : {}}
	onclick={handleInputClick}
	onchange={handleInputChange}
	onfocus={handleInputFocus}
/>
