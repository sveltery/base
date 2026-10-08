<!--
	Provides shared state to a series of radio buttons. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/radio-group/RadioGroup.tsx
	and the linear composite path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration and inputRef are not ported. The radios are the existing Radio parts.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import GroupFrame from '../internal/GroupFrame.svelte';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { isSkipped } from '../internal/composite-skip.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { useFieldContext } from '../field/context.svelte.js';
	import { useFormContext } from '../form/context.js';
	import { useFieldsetRootContext } from '../fieldset/context.svelte.js';
	import { setRadioGroupContext } from '../radio/group-context.js';
	import type { RadioRootChangeEventDetails } from '../radio/types.js';
	import type { RadioGroupProps, RadioGroupState } from './types.js';

	let {
		value = $bindable(),
		defaultValue,
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

	let touched = $state(false);

	const reading = useDirection();
	const formContext = useFormContext();
	const field = useFieldContext(true);
	const fieldset = useFieldsetRootContext(true);

	const controllable = createControllableValue<unknown>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue,
		onChange(next) {
			formContext.clearErrors(name);
			if (!field) return;
			field.setDirty(next !== field.validityData.initialValue);
			field.setFilled(next != null);
			field.change(next);
		}
	});

	const roving = new CompositeRoot({
		orientation: () => 'both',
		direction: () => reading.direction,
		isItemDisabled: (element) =>
			isSkipped(element) || element.getAttribute('aria-disabled') === 'true',
		isItemSelected: (element) => {
			const current = controllable.value;
			const meta = roving.meta(element);
			return current !== undefined && meta.value === current && meta.disabled !== true;
		},
		keys: 'arrows',
		modifiers: 'shift-ok',
		homeEnd: false,
		stopPropagation: true,
		replacement: 'index',
		keydown: 'root'
	});

	function setCheckedValue(next: unknown, details: RadioRootChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		if (Object.is(next, controllable.value)) return;
		controllable.set(next);
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
			return controllable.value;
		},
		get touched() {
			return touched;
		},
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
				onfocus,
				onblur: (event) => {
					onblur?.(event);
					touched = false;
				},
				onkeydown: handleKeyDown,
				onkeydowncapture: arrowsTouched
			};
		});
</script>

<GroupFrame {hostProps} state={groupState} {render} {children} />
