<!--
	Represents the checkbox itself. Renders a `<span>` and a hidden checkbox beside it.
	Derived from Base UI v1.8.0 packages/react/src/checkbox/root/CheckboxRoot.tsx,
	the non-composite paths of packages/react/src/internals/use-button/useButton.ts,
	and the native-label fallback of useAriaLabelledBy.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, validation, and Form error clearing are not ported.
	An optional CheckboxGroup context supplies the shared value. When that group
	sets `allValues`, `parent` toggles the set and other checkboxes register with it.
-->
<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import { currentHost, dispatchClick, isLink } from '../internal/click.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { visuallyHidden, visuallyHiddenInput } from '../internal/visuallyHidden.js';
	import { checkboxRootAttributes } from './attributes.js';
	import { setCheckboxContext } from './context.js';
	import { useCheckboxGroupContext } from './group-context.js';
	import { findAssociatedLabel } from '../internal/associated-label.js';
	import { getDefaultFormSubmitter } from './submitter.js';
	import type {
		CheckboxHostProps,
		CheckboxRootChangeEventDetails,
		CheckboxRootProps,
		CheckboxRootState
	} from './types.js';

	const uid = $props.id();
	const rootKey = createAttachmentKey();
	const group = useCheckboxGroupContext();

	let {
		checked = $bindable(undefined),
		defaultChecked = false,
		disabled = false,
		readOnly = false,
		required = false,
		indeterminate = false,
		parent = false,
		nativeButton = false,
		name,
		value,
		uncheckedValue,
		form,
		id,
		onCheckedChange,
		onclick,
		onmousedown,
		onpointerdown,
		onkeydown,
		onkeyup,
		'aria-labelledby': ariaLabelledBy,
		render,
		children,
		...elementProps
	}: CheckboxRootProps = $props();

	const generatedRootId = $derived('base-ui-' + uid);
	const generatedControlId = $derived(`base-ui-${uid}-control`);
	const controlId = $derived(id ?? generatedControlId);
	const hiddenInputId = $derived(nativeButton ? undefined : controlId);
	const rootId = $derived(nativeButton ? controlId : generatedRootId);

	const controllable = createControllableValue<boolean, CheckboxRootChangeEventDetails>({
		getProp: () => checked,
		setProp: (next) => {
			checked = next;
		},
		getDefault: () => defaultChecked
	});
	const checkedState = $derived(controllable.value === true);

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
	const isDisabled = $derived(Boolean(group?.disabled) || disabled);
	const inputName = $derived(parent ? undefined : name);

	const checkboxState: CheckboxRootState = $derived({
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
	let fallbackLabelId = $state<string | undefined>(undefined);

	function registerRoot(element: HTMLElement) {
		rootNode = element;
		return () => {
			if (rootNode === element) rootNode = null;
		};
	}

	const inputStyle = $derived(toCssStyle(inputName ? visuallyHiddenInput : visuallyHidden));
	const showUnchecked = $derived(
		!isChecked && group === undefined && Boolean(inputName) && uncheckedValue !== undefined
	);
	const submittedValue = $derived.by(() => {
		if (value === undefined) return {};
		// Inside a group an unticked checkbox submits an empty value attribute.
		if (group) return { value: (isChecked && value) || '' };
		return { value };
	});

	// A click clears `indeterminate` before the listener runs. Put it back after `checked` updates.
	$effect(() => {
		const input = inputNode;
		if (!input) return;
		const next = isChecked;
		if (input.checked !== next) input.checked = next;
		input.indeterminate = isIndeterminate;
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
			if (details.isCanceled) event.preventDefault();
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

		controllable.set(nextChecked, details);
	}

	function handleInputFocus() {
		rootNode?.focus();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (isDisabled) {
			event.preventDefault();
			return;
		}

		onclick?.(event);
		if (event.defaultPrevented || readOnly) return;

		event.preventDefault();
		if (!inputNode) return;
		dispatchClick(inputNode, event);
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (!isDisabled) onmousedown?.(event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (isDisabled) {
			event.preventDefault();
			return;
		}
		onpointerdown?.(event);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (isDisabled) return;

		onkeydown?.(event);

		// Enter does not tick the checkbox. It submits the form unless a later listener cancels it.
		if (event.key === 'Enter') {
			if (event.defaultPrevented) return;
			const host = event.currentTarget;
			const formToSubmit = inputNode?.form ?? null;
			let preventedAfter = false;
			const originalPreventDefault = event.preventDefault.bind(event);
			event.preventDefault = () => {
				preventedAfter = true;
				originalPreventDefault();
			};
			originalPreventDefault();
			const view = host.ownerDocument.defaultView ?? window;
			view.queueMicrotask(() => {
				event.preventDefault = originalPreventDefault;
				if (!preventedAfter) getDefaultFormSubmitter(formToSubmit)?.click();
			});
			return;
		}

		if (event.defaultPrevented) return;

		const current = currentHost(event);
		if (!current) return;

		const buttonElement = current instanceof HTMLButtonElement;
		const link = isLink(current, nativeButton);
		const shouldClick = nativeButton ? buttonElement : !link;
		const isSpace = event.key === ' ';

		if (!shouldClick || nativeButton || !isSpace) {
			if (link && isSpace) event.preventDefault();
			return;
		}

		event.preventDefault();
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (isDisabled) return;

		onkeyup?.(event);
		if (event.defaultPrevented || nativeButton || event.key !== ' ') return;

		const current = currentHost(event);
		if (!current) return;
		dispatchClick(current, event);
	}

	$effect(() => {
		if (nativeButton || ariaLabelledBy) {
			fallbackLabelId = undefined;
			return;
		}

		const input = inputNode;
		const sourceId = hiddenInputId;
		if (!input) {
			fallbackLabelId = undefined;
			return;
		}

		const label = findAssociatedLabel(input);
		if (!label) {
			fallbackLabelId = undefined;
			return;
		}

		if (!label.id && sourceId) label.id = `${sourceId}-label`;
		fallbackLabelId = label.id || undefined;
	});

	const hostProps: CheckboxHostProps & Record<symbol, Attachment<HTMLElement>> = $derived.by(() => {
		const labelledBy = ariaLabelledBy ?? fallbackLabelId;
		const controls = parent ? group?.parent?.controls : undefined;
		return {
			...checkboxRootAttributes(checkboxState),
			...(nativeButton ? { type: 'button' as const } : {}),
			tabindex: !nativeButton && isDisabled ? -1 : 0,
			...(!nativeButton && isDisabled ? { 'aria-disabled': true as const } : {}),
			...(nativeButton && isDisabled ? { disabled: true } : {}),
			...(parent ? { 'data-parent': '' } : {}),
			id: rootId,
			role: 'checkbox',
			'aria-checked': isIndeterminate ? 'mixed' : isChecked,
			...(readOnly ? { 'aria-readonly': true as const } : {}),
			...(required ? { 'aria-required': true as const } : {}),
			...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
			...elementProps,
			...(controls ? { 'aria-controls': controls } : {}),
			onclick: handleClick,
			onmousedown: handleMouseDown,
			onpointerdown: handlePointerDown,
			onkeydown: handleKeyDown,
			onkeyup: handleKeyUp,
			[rootKey]: registerRoot
		};
	});
</script>

{#if render}
	{@render render(hostProps, checkboxState, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
{#if showUnchecked}
	<input type="hidden" {form} name={inputName} value={uncheckedValue} disabled={isDisabled} />
{/if}
<input
	bind:this={inputNode}
	type="checkbox"
	checked={isChecked}
	disabled={isDisabled}
	{form}
	id={hiddenInputId}
	name={inputName}
	{required}
	style={inputStyle}
	tabindex="-1"
	aria-hidden="true"
	{...submittedValue}
	onclick={handleInputClick}
	onfocus={handleInputFocus}
/>
