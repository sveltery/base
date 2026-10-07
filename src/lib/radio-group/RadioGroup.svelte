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

	let ownedValue = $state.raw(untrack(() => value));
	let touched = $state(false);

	function sameCommitted(live: unknown, owned: unknown) {
		if (Object.is(live, owned)) return true;
		if (live == null || owned == null) return false;
		if (typeof live !== 'object' || typeof owned !== 'object') return false;
		try {
			return JSON.stringify(live) === JSON.stringify(owned);
		} catch {
			return false;
		}
	}

	const roving = new RadioGroupRoving();
	const formContext = useFormContext();
	const fieldset = useFieldsetRootContext(true);
	const arrowKey = createAttachmentKey();

	function setCheckedValue(next: unknown, details: RadioRootChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		const current = sameCommitted(value, ownedValue) ? ownedValue : value;
		const changed = !Object.is(next, current);
		ownedValue = next;
		value = next;
		if (changed) formContext.clearErrors(name);
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
			return sameCommitted(value, ownedValue) ? ownedValue : value;
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
		disabled,
		readOnly,
		required
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLElement>> =
		$derived.by(() => {
			const explicitLabel = elementProps['aria-labelledby'];
			const labelledBy = explicitLabel ?? fieldset?.legendId;
			return {
				...getStateAttributesProps(groupState),
				role: 'radiogroup',
				...(disabled ? { 'aria-disabled': true as const } : {}),
				...(readOnly ? { 'aria-readonly': true as const } : {}),
				...(required ? { 'aria-required': true as const } : {}),
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
