<!--
	Provides shared state to a series of radio buttons. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/radio-group/RadioGroup.tsx
	and the linear composite path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration and inputRef are not ported. The radios are the existing Radio parts.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useFormContext } from '../form/context.js';
	import { useFieldsetRootContext } from '../fieldset/context.svelte.js';
	import { setRadioGroupContext } from '../radio/group-context.js';
	import type { RadioRootChangeEventDetails } from '../radio/types.js';
	import { RadioGroupRoving } from './roving-focus.svelte.js';
	import type { RadioGroupProps, RadioGroupState } from './types.js';

	let {
		value = $bindable(),
		disabled = false,
		readOnly = false,
		required = false,
		name,
		form,
		onValueChange,
		onfocus,
		onblur,
		onkeydown,
		render,
		children,
		...elementProps
	}: RadioGroupProps = $props();

	// Copied so a child read during render sees the initial props on the server,
	// before effects run. Later parent updates flow through the pre effect.
	let disabledState = $state(untrack(() => Boolean(disabled)));
	let readOnlyState = $state(untrack(() => Boolean(readOnly)));
	let requiredState = $state(untrack(() => Boolean(required)));
	let nameState = $state(untrack(() => name));
	let formId = $state(untrack(() => form));
	// Raw state keeps object identity. A proxied value would fail === in Radio.
	let checkedValue = $state.raw(untrack(() => value));
	let touched = $state(false);

	let writes = 0;
	let seenWrites = 0;
	let seenValue = value;

	const roving = new RadioGroupRoving();
	const formContext = useFormContext();
	const fieldset = useFieldsetRootContext(true);
	const arrowKey = createAttachmentKey();

	function commit(next: unknown) {
		writes += 1;
		value = next;
		checkedValue = next;
	}

	function setCheckedValue(next: unknown, details: RadioRootChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		commit(next);
	}

	setRadioGroupContext({
		roving,
		get disabled() {
			return disabledState;
		},
		get readOnly() {
			return readOnlyState;
		},
		get required() {
			return requiredState;
		},
		get name() {
			return nameState;
		},
		get form() {
			return formId;
		},
		get checkedValue() {
			return checkedValue;
		},
		get touched() {
			return touched;
		},
		setCheckedValue,
		setTouched(next) {
			touched = next;
		},
		registerInput() {}
	});

	$effect.pre(() => {
		disabledState = Boolean(disabled);
		readOnlyState = Boolean(readOnly);
		requiredState = Boolean(required);
		nameState = name;
		formId = form;

		const incoming = value;
		if (writes !== seenWrites) {
			seenWrites = writes;
			seenValue = incoming;
			return;
		}
		if (Object.is(incoming, seenValue)) return;
		seenValue = incoming;
		checkedValue = incoming;
	});

	let sawChecked = false;
	let previousChecked: unknown = value;

	$effect(() => {
		const current = checkedValue;
		const fieldName = nameState;
		if (!sawChecked) {
			sawChecked = true;
			previousChecked = current;
			return;
		}
		if (Object.is(current, previousChecked)) return;
		previousChecked = current;
		formContext.clearErrors(fieldName);
	});

	function watchArrows(element: HTMLElement) {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key.startsWith('Arrow')) touched = true;
		}
		element.addEventListener('keydown', onKeyDown, true);
		return () => element.removeEventListener('keydown', onKeyDown, true);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocus?.(event);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onblur?.(event);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		roving.keydown(event);
	}

	const groupState: RadioGroupState = $derived({
		disabled: disabledState,
		readOnly: readOnlyState,
		required: requiredState
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived.by(() => {
			const explicitLabel = elementProps['aria-labelledby'];
			const labelledBy = explicitLabel ?? fieldset?.legendId;
			return {
				...getStateAttributesProps(groupState),
				role: 'radiogroup',
				...(disabledState ? { 'aria-disabled': true as const } : {}),
				...(readOnlyState ? { 'aria-readonly': true as const } : {}),
				...(requiredState ? { 'aria-required': true as const } : {}),
				...elementProps,
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				onfocus: handleFocus,
				onblur: handleBlur,
				onkeydown: handleKeyDown,
				[arrowKey]: watchArrows
			};
		});
</script>

{#if render}
	{@render render(hostProps, groupState)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
