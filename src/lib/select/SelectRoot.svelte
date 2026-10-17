<!--
	Groups all parts of the select.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/select/root/SelectRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`actionsRef` is the exported `close` and `unmount`. Bind the root with `bind:this`.
	`inputRef` is not ported. In `multiple` mode one hidden `<select multiple>` submits the values.
-->
<script lang="ts" generics="Value = unknown, Multiple extends boolean | undefined = false">
	import {
		ClickInteraction,
		DismissInteraction,
		ListNavigation,
		Typeahead
	} from '@sveltery/floating-ui-svelte';
	import {
		createChangeEventDetails,
		REASONS,
		visuallyHidden,
		visuallyHiddenInput
	} from '@sveltery/utils';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import {
		defaultItemEquality,
		type ItemEqualityComparer
	} from '../internal/listbox/itemEquality.js';
	import { stringifyAsLabel, stringifyAsValue } from '../internal/listbox/resolveValueLabel.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { dispatchingValueEvent, queueValueEvent } from '../internal/value-events.js';
	import { setSelectRoot } from './context.svelte.js';
	import { queueSelectEvents, sameStrings } from '../internal/listbox/native-select.js';
	import { SelectStore } from './store.svelte.js';
	import type { SelectChangeEventDetails, SelectRootProps, SelectValueOf } from './types.js';

	const uid = $props.id();

	let {
		value = $bindable(),
		defaultValue,
		onValueChange,
		open = $bindable(false),
		onOpenChange,
		onOpenChangeComplete,
		name: nameProp,
		form: formId,
		autocomplete,
		id: idProp,
		required = false,
		readonly: readOnly = false,
		disabled: disabledProp = false,
		multiple: multipleProp,
		highlightItemOnHover = true,
		modal = true,
		items,
		itemToStringLabel,
		itemToStringValue,
		isItemEqualToValue,
		children
	}: SelectRootProps<Value, Multiple> = $props();

	type SelectValue = SelectValueOf<Value, Multiple>;

	const EMPTY: readonly unknown[] = [];
	const multiple = $derived(multipleProp === true);
	const comparer = $derived((isItemEqualToValue ?? defaultItemEquality) as ItemEqualityComparer);
	const emptyValue = () => (multiple ? [] : null) as SelectValue;

	const field = useFieldContext();
	const formContext = useFormContext();
	const labelable = useLabelableContext();

	// Svelte proxies an object or array written to the prop. Items compare the written one.
	const selection = new WrittenReference<SelectValue | undefined>(
		() => value,
		(next) => {
			value = next;
		}
	);

	const current: SelectValue = $derived(selection.current ?? emptyValue());
	const disabled = $derived(field.disabled || disabledProp);
	const name = $derived(field.name ?? nameProp);
	const controlId = new LabelableId(labelable, {
		id: () => idProp,
		fallback: () => `base-ui-${uid}`
	});

	let hiddenInput = $state<HTMLInputElement | null>(null);
	let valuesSelect = $state<HTMLSelectElement | null>(null);

	function serialize(item: unknown) {
		return stringifyAsValue(item, itemToStringValue as never);
	}

	/** What the form sees: each value serialized. */
	const fieldStringValue = $derived(
		multiple && Array.isArray(current) ? current.map(serialize) : serialize(current)
	);
	const serializedValues = $derived(
		multiple && Array.isArray(current) ? current.map(serialize) : (EMPTY as string[])
	);
	const serializedDefaults = $derived(
		multiple && Array.isArray(defaultValue) ? defaultValue.map(serialize) : (EMPTY as string[])
	);
	/** Every value the hidden select may hold: the current ones and those a reset restores. */
	const submitOptions = $derived([...new Set([...serializedValues, ...serializedDefaults])]);

	// An option's `selected` attribute is what a native reset restores, so it marks the defaults.
	// The current values are the options' live selectedness, set once Svelte has rendered them.
	$effect(() => {
		const values = serializedValues;
		void serializedDefaults;
		if (!valuesSelect) return;
		for (const option of valuesSelect.options) option.selected = values.includes(option.value);
	});

	function commitValue(next: unknown, details: SelectChangeEventDetails) {
		onValueChange?.(next as SelectValue, details);
		if (details.isCanceled) return;
		selection.set(next as SelectValue);
		if (multiple) {
			queueSelectEvents(valuesSelect);
		} else if (details.event.target !== hiddenInput) {
			queueValueEvent(hiddenInput, 'input');
			queueValueEvent(hiddenInput, 'change');
		}
	}

	const store: SelectStore = new SelectStore({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: `base-ui-${uid}`,
		// Getters, so a reader tracks only the fields it reads.
		root: {
			get id() {
				return controlId.current;
			},
			get value() {
				return current;
			},
			get multiple() {
				return multiple;
			},
			get disabled() {
				return disabled;
			},
			get readOnly() {
				return readOnly;
			},
			get required() {
				return required;
			},
			get modal() {
				return modal;
			},
			get highlightItemOnHover() {
				return highlightItemOnHover;
			},
			get items() {
				return items;
			},
			get itemToStringLabel() {
				return itemToStringLabel as ((item: never) => string) | undefined;
			},
			get itemToStringValue() {
				return itemToStringValue as ((item: never) => string) | undefined;
			},
			get isItemEqualToValue() {
				return comparer;
			}
		},
		commitValue,
		onDismissedOutside: () => {
			field.setTouched(true);
			field.setFocused(false);
			if (field.validationMode === 'onBlur') field.commit(current);
		},
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		readTriggerProps: () => triggerProps,
		readPopupProps: () => popupProps,
		readPopupTypeahead: () => typeahead.floating,
		readItemProps: () => itemProps
	});
	// `defaultValue` is the initial value of an empty binding, as in HTML.
	// svelte-ignore state_referenced_locally
	if (value === undefined) selection.set(defaultValue ?? emptyValue());

	// svelte-ignore state_referenced_locally
	store.initialValue = current;
	setSelectRoot(store);

	// `readonly` locks the value, not the interaction: the popup still opens so the options and
	// the selection can be seen. Items and the autofill handler block the commit.
	const click = new ClickInteraction(store, () => ({ enabled: !disabled, event: 'mousedown' }));
	const dismiss = new DismissInteraction(store);
	const listNavigation = new ListNavigation(store, () => ({
		enabled: !disabled,
		items: () => store.items.elements,
		activeIndex: store.activeIndex,
		selectedIndex: store.selectedIndex,
		disabledIndices: EMPTY as number[],
		onNavigate(next) {
			// Keep the highlight while the popup animates out.
			if (next === null && !store.open) return;
			store.activeIndex = next;
		},
		focusItemOnHover: highlightItemOnHover
	}));
	const typeahead = new Typeahead(store, () => ({
		// On an open popup typeahead only moves the highlight. On the closed trigger it commits.
		enabled: !disabled && (store.open || (!readOnly && !multiple)),
		labels: () => store.labels(),
		activeIndex: store.activeIndex,
		selectedIndex: store.selectedIndex,
		// Disabled items are skipped, as a click cannot select them. Read from item metadata
		// so items mounted hidden for closed typeahead are not dropped as invisible.
		disabledIndices: (index) => {
			const element = store.items.elements[index];
			return element ? (store.items.meta(element)?.disabled ?? false) : false;
		},
		onMatch(index) {
			if (store.open) store.activeIndex = index;
			else store.setValue(store.values[index], createChangeEventDetails(REASONS.none));
		},
		onTyping(typing) {
			store.typing = typing;
		}
	}));

	const triggerProps = $derived(
		mergeProps(typeahead.reference, listNavigation.reference, dismiss.reference, click.reference)
	);
	const popupProps = $derived(
		mergeProps({ ...FOCUSABLE_POPUP_PROPS }, listNavigation.floating, dismiss.floating)
	);
	const itemProps = $derived(listNavigation.item);

	watchFieldControl(field, {
		enabled: () => !disabled,
		id: () => controlId.current,
		name: () => nameProp,
		element: () => store.triggerElement,
		getValue: () => fieldStringValue
	});

	$effect(() => {
		field.setFilled(store.hasSelectedValue);
	});

	useValueChanged(
		() => current,
		(next) => {
			formContext.clearErrors(name);
			const initial = field.validityData.initialValue;
			const serialized = fieldStringValue;
			field.setDirty(
				Array.isArray(serialized) && Array.isArray(initial)
					? !sameStrings(serialized, initial)
					: serialized !== initial
			);
			field.change(next);
		}
	);

	// The hidden input is the constraint element. Form focuses the trigger.
	$effect(() => {
		const input = hiddenInput;
		if (!input) return;
		return field.registerInput(input, { element: store.triggerElement, value: undefined });
	});

	restoreOnReset(() => hiddenInput, {
		restore: () => {
			const next = (defaultValue ?? emptyValue()) as SelectValue;
			if (!Object.is(current, next)) selection.set(next);
		}
	});

	const submitName = $derived(name);
	const hiddenInputName = $derived(multiple ? undefined : submitName);
	const describedBy = $derived(labelable.describedBy(undefined));
	const invalid = $derived(field.state.valid === false && !disabled);

	function focusTrigger() {
		store.triggerElement?.focus({ focusVisible: true } as FocusOptions);
	}

	/** Browser autofill writes a scalar into the hidden input. */
	function handleAutofill(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (dispatchingValueEvent()) return;
		const input = event.currentTarget;
		if (event.defaultPrevented || disabled || readOnly) {
			input.value = multiple ? '' : serialize(current);
			return;
		}
		const nextValue = input.value;
		const details = createChangeEventDetails(REASONS.none, event);

		store.forceMount = true;
		queueMicrotask(() => {
			// Autofill only writes one value.
			if (multiple) return;
			const lower = nextValue.toLowerCase();
			const values = store.values;
			let index = values.findIndex(
				(candidate) =>
					serialize(candidate).toLowerCase() === lower ||
					stringifyAsLabel(candidate, itemToStringLabel as never).toLowerCase() === lower
			);
			if (index === -1) {
				// Browsers can fill the rendered text of a primitive value, like `US` for "United States".
				const labels = store.labels();
				index = labels.findIndex((label) => label != null && label.toLowerCase() === lower);
			}
			const match = values[index];
			if (match != null) store.setValue(match, details);
			if (input.value !== serialize(current)) input.value = serialize(current);
		});
	}

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.()}
<input
	bind:this={hiddenInput}
	id={hiddenInputName == null ? `${controlId.current}-hidden-input` : undefined}
	form={formId}
	name={hiddenInputName}
	{autocomplete}
	value={multiple ? '' : serialize(current)}
	defaultValue={multiple ? '' : serialize(defaultValue ?? null)}
	{disabled}
	required={required && !(multiple && store.hasSelectedValue)}
	readonly={readOnly}
	style={toCssStyle(hiddenInputName ? visuallyHiddenInput : visuallyHidden)}
	tabindex="-1"
	aria-hidden="true"
	aria-invalid={invalid || undefined}
	aria-describedby={describedBy}
	onfocus={focusTrigger}
	oninput={handleAutofill}
/>
{#if multiple && submitName}
	<select
		bind:this={valuesSelect}
		multiple
		hidden
		tabindex="-1"
		aria-hidden="true"
		name={submitName}
		form={formId}
		{disabled}
	>
		{#each submitOptions as serialized (serialized)}
			<option value={serialized} selected={serializedDefaults.includes(serialized)}
				>{serialized}</option
			>
		{/each}
	</select>
{/if}
