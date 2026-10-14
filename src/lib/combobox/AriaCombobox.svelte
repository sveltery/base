<!--
	The combobox core: selection, input value, filtering, list navigation and the form inputs.
	Renders no element of its own, only the hidden inputs a form submits and validates.
	Derived from Base UI v1.9.0 packages/react/src/combobox/root/AriaCombobox.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Combobox.Root wraps it with `selectionMode` 'single' or 'multiple'. Autocomplete wraps it
	with 'none'. `actionsRef` is the exported `close` and `unmount`. `inputRef` and
	`virtualized` are not ported. In `multiple` mode one hidden `<select multiple>` submits
	the values, as in Select.
-->
<script lang="ts">
	import { flushSync, onMount, untrack } from 'svelte';
	import {
		ClickInteraction,
		DismissInteraction,
		gridNavigation,
		ListNavigation,
		setFloatingTree
	} from '@sveltery/floating-ui-svelte';
	import {
		contains,
		createChangeEventDetails,
		getTarget,
		REASONS,
		visuallyHidden,
		visuallyHiddenInput
	} from '@sveltery/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { BoundControl } from '../field/bound-control.svelte.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { useDirection } from '../internal/direction-context.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { getHighlightReason } from '../internal/getHighlightReason.js';
	import { LabelableId, findLabelableContext } from '../internal/labelable-provider.svelte.js';
	import {
		defaultItemEquality,
		type ItemEqualityComparer
	} from '../internal/listbox/itemEquality.js';
	import { queueSelectEvents, sameStrings } from '../internal/listbox/native-select.js';
	import { stringifyAsValue } from '../internal/listbox/resolveValueLabel.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { dispatchingValueEvent, queueValueEvent } from '../internal/value-events.js';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { isItemCollection } from './collection.js';
	import { setComboboxRoot } from './context.svelte.js';
	import { ComboboxStore, type ComboboxAutoHighlight } from './store.svelte.js';
	import type { AriaComboboxProps, ComboboxChangeEventDetails } from './types.js';

	const uid = $props.id();

	let {
		selectionMode,
		selectedValue = $bindable(),
		defaultSelectedValue,
		onSelectedValueChange,
		inputValue = $bindable(),
		defaultInputValue,
		onInputValueChange,
		open = $bindable(false),
		onOpenChange,
		onOpenChangeComplete,
		onItemHighlighted,
		name: nameProp,
		form: formId,
		id: idProp,
		required = false,
		readonly: readOnly = false,
		disabled: disabledProp = false,
		openOnInputClick = true,
		autoHighlight = false,
		keepHighlight = false,
		highlightItemOnHover = true,
		loopFocus = true,
		grid = false,
		items,
		filteredItems,
		filter,
		filterQuery,
		itemToStringLabel,
		itemToStringValue,
		isItemEqualToValue,
		inline = false,
		fillInputOnItemPress = true,
		modal = false,
		limit = -1,
		autoComplete = 'list',
		formAutoComplete,
		locale,
		submitOnItemClick = false,
		children
	}: AriaComboboxProps = $props();

	const initialItems = untrack(() => items);
	if (initialItems != null && !Array.isArray(initialItems) && !isItemCollection(initialItems)) {
		throw new Error(
			'Base UI: the `items` prop received an object that is not a collection, so its items cannot be read. ' +
				'Pass an array of items, an array of groups with items, or the result of `createItems()`.'
		);
	}

	const EMPTY: readonly unknown[] = [];
	const multiple = $derived(selectionMode === 'multiple');
	const single = $derived(selectionMode === 'single');
	const comparer = $derived((isItemEqualToValue ?? defaultItemEquality) as ItemEqualityComparer);
	const autoHighlightMode: ComboboxAutoHighlight = $derived(
		autoHighlight === 'always' ? 'always' : autoHighlight ? 'input-change' : false
	);
	const emptyValue = () => (selectionMode === 'multiple' ? [] : null);
	// Without a selection the input text is the value, which Autocomplete always provides.
	// svelte-ignore state_referenced_locally
	const hasInputValue =
		selectionMode === 'none' || inputValue !== undefined || defaultInputValue !== undefined;

	// A popover nested in the popup joins this tree, so presses inside it are not outside presses.
	setFloatingTree();
	const field = useFieldContext();
	const formContext = useFormContext();
	const labelable = findLabelableContext();
	const direction = useDirection();

	// Svelte proxies an object or array written to the prop. Items compare the written one.
	const selection = new WrittenReference<unknown>(
		() => selectedValue,
		(next) => {
			selectedValue = next;
		}
	);

	const current: unknown = $derived(selection.current ?? emptyValue());
	const currentInput = $derived(inputValue ?? '');
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

	const fieldRawValue = $derived(selectionMode === 'none' ? currentInput : current);
	/** What the form sees: each value serialized. */
	const fieldStringValue = $derived.by(() => {
		if (selectionMode === 'none') return currentInput;
		if (Array.isArray(current)) return current.map(serialize);
		return serialize(current);
	});
	const serializedValues = $derived(
		multiple && Array.isArray(current) ? current.map(serialize) : (EMPTY as string[])
	);
	const serializedDefaults = $derived(
		multiple && Array.isArray(defaultSelectedValue)
			? defaultSelectedValue.map(serialize)
			: (EMPTY as string[])
	);
	const submitOptions = $derived([...new Set([...serializedValues, ...serializedDefaults])]);

	// An option's `selected` attribute is what a native reset restores, so it marks the defaults.
	$effect(() => {
		const values = serializedValues;
		void serializedDefaults;
		if (!valuesSelect) return;
		for (const option of valuesSelect.options) option.selected = values.includes(option.value);
	});

	function commitSelectedValue(next: unknown, details: ComboboxChangeEventDetails) {
		onSelectedValueChange?.(next as never, details);
		if (details.isCanceled) return;
		selection.set(next);
		if (multiple) {
			queueSelectEvents(valuesSelect);
		} else if (details.event.target !== hiddenInput) {
			queueValueEvent(hiddenInput, 'input');
			queueValueEvent(hiddenInput, 'change');
		}
	}

	function commitInputValue(next: string, details: ComboboxChangeEventDetails) {
		onInputValueChange?.(next, details);
		if (details.isCanceled) return;
		inputValue = next;
	}

	const store: ComboboxStore = new ComboboxStore({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: `base-ui-${uid}-list`,
		// Getters, so a reader tracks only the fields it reads.
		root: {
			get id() {
				return controlId.current;
			},
			get selectionMode() {
				return selectionMode;
			},
			get selectedValue() {
				return current;
			},
			get inputValue() {
				return currentInput;
			},
			get name() {
				return name;
			},
			get form() {
				return formId;
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
			get grid() {
				return grid;
			},
			get inline() {
				return inline;
			},
			get openOnInputClick() {
				return openOnInputClick;
			},
			get autoHighlight() {
				return autoHighlightMode;
			},
			get modal() {
				return modal;
			},
			get submitOnItemClick() {
				return submitOnItemClick;
			},
			get fillInputOnItemPress() {
				return fillInputOnItemPress;
			},
			get hasInputValue() {
				return hasInputValue;
			},
			get items() {
				return items as never;
			},
			get filteredItems() {
				return filteredItems as never;
			},
			get filter() {
				return filter as never;
			},
			get filterQuery() {
				return filterQuery;
			},
			get limit() {
				return limit;
			},
			get locale() {
				return locale;
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
		commitSelectedValue,
		commitInputValue,
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		onItemHighlighted: () => onItemHighlighted as never,
		onDismissedOutside: () => {
			field.setTouched(true);
			field.setFocused(false);
			if (field.validationMode === 'onBlur') field.commit(fieldRawValue);
		},
		requestSubmit: () => {
			const form = hiddenInput?.form ?? store.inputElement?.form;
			if (typeof form?.requestSubmit === 'function') form.requestSubmit();
		},
		readInputProps: () => inputProps,
		// The default value is what a native reset restores, before the restore phase runs.
		readInputFormProps: () =>
			inputOwnsFormValue
				? { name: submitName, defaultValue: serializedDefault, ...boundProps }
				: {},
		readPopupProps: () => popupProps,
		readListProps: () => listProps,
		readItemProps: () => itemProps
	});
	setComboboxRoot(store);

	/** The item value a source value names, so a bound combobox keeps non-string values. */
	function optionFor(raw: unknown): unknown {
		const key = serialize(raw);
		return store.values.find((item) => serialize(item) === key) ?? raw;
	}

	// svelte-ignore state_referenced_locally
	const bound = new BoundControl<unknown>(field, {
		kind:
			selectionMode === 'none'
				? 'text'
				: selectionMode === 'multiple'
					? 'select multiple'
					: 'select',
		read: () => fieldRawValue,
		write: (next) => {
			if (selectionMode === 'none') inputValue = String(next ?? '');
			else selection.set(next);
		},
		fromSource: (raw) => {
			if (selectionMode === 'none') return raw == null ? '' : String(raw);
			if (multiple) return Array.isArray(raw) ? raw.map(optionFor) : [];
			return raw == null ? null : optionFor(raw);
		},
		equals: (a, b) => (Array.isArray(a) && Array.isArray(b) ? sameStrings(a, b) : Object.is(a, b))
	});

	// `defaultSelectedValue` is the initial value of an empty binding, as in HTML.
	untrack(() => {
		if (selectionMode === 'none') {
			if (inputValue === undefined) inputValue = String(bound.initial(defaultInputValue ?? ''));
			return;
		}
		if (selectedValue === undefined)
			selection.set(bound.initial(defaultSelectedValue ?? emptyValue()));
		if (inputValue === undefined) {
			inputValue = hasInputValue
				? (defaultInputValue ?? '')
				: single
					? store.stringifyLabel(current)
					: '';
		}
		store.seedSelectedIndex();
	});
	// svelte-ignore state_referenced_locally
	const initialInputValue = currentInput;

	// `readonly` locks the value, not the interaction: the popup opens and can be browsed. Items,
	// the input's keys, the trigger's typeahead, the clear and remove parts and autofill block
	// the value changes.
	const click = new ClickInteraction(store, () => ({
		enabled: !disabled && openOnInputClick,
		event: 'mousedown-only',
		toggle: false,
		// A short delay on touch lets the viewport and virtual keyboard settle before positioning.
		touchOpenDelay: store.inputInsidePopup ? 0 : 100,
		reason: REASONS.inputPress
	}));

	const dismiss = new DismissInteraction(store, () => ({
		enabled: !disabled && !inline,
		outsidePressEvent: { mouse: 'sloppy', touch: 'intentional' },
		bubbles: inline ? true : undefined,
		outsidePress(event: MouseEvent | PointerEvent | TouchEvent) {
			const target = getTarget(event) as Element | null;
			return (
				!contains(store.triggerElement, target) &&
				!contains(store.clearElement, target) &&
				!contains(store.chipsElement, target) &&
				!contains(store.inputGroupElement, target)
			);
		}
	}));

	const listNavigation = new ListNavigation(store, () => ({
		enabled: !disabled,
		id: controlId.current,
		items: () => store.items.elements,
		activeIndex: store.activeIndex,
		selectedIndex: store.selectedIndex,
		virtual: true,
		loopFocus,
		allowEscape: loopFocus && !autoHighlightMode,
		focusItemOnOpen:
			store.queryChangedAfterOpen || (selectionMode === 'none' && !autoHighlightMode)
				? false
				: 'auto',
		focusItemOnHover: highlightItemOnHover,
		resetOnPointerLeave: !keepHighlight,
		orientation: grid ? 'horizontal' : undefined,
		rtl: direction.direction === 'rtl',
		disabledIndices: EMPTY as number[],
		grid: grid ? gridNavigation : undefined,
		onNavigate(next, event) {
			// Automatic navigation while closed is ignored, except the reset of an inline list.
			if (
				(!event && !store.open && !(inline && next === null)) ||
				store.transitionStatus === 'ending'
			) {
				return;
			}
			store.setIndices({ activeIndex: next, type: getHighlightReason(event), event });
		}
	}));

	const roleProps = $derived.by(() => {
		const input = store.inputElement;
		// Before hydration the input is unknown, so input semantics are assumed.
		const treatAsInput = input == null || input.tagName === 'INPUT';
		// An inline list is exposed for as long as it is rendered.
		const expanded = open || inline;
		const props: Record<string, unknown> = treatAsInput
			? { autocomplete: 'off', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'none' }
			: {};
		if (treatAsInput || expanded) {
			props.role = 'combobox';
			props['aria-expanded'] = expanded ? 'true' : 'false';
			props['aria-haspopup'] = grid ? 'grid' : 'listbox';
			props['aria-controls'] = expanded ? store.listElement?.id : undefined;
			props['aria-autocomplete'] = readOnly ? 'none' : autoComplete;
		}
		return props as HTMLAttributes<HTMLElement>;
	});

	const inputProps: HTMLAttributes<HTMLElement> = $derived.by(() => {
		const { onkeydown: navigationKeyDown, ...navigation } = listNavigation.reference;
		const merged = mergeProps(navigation, dismiss.reference, click.reference, roleProps);
		const mergedKeyDown = merged.onkeydown as ((event: KeyboardEvent) => void) | undefined;
		return {
			...merged,
			onkeydown(event: KeyboardEvent) {
				mergedKeyDown?.(event);
				// In grid mode the arrow keys move between columns. With nothing highlighted the user is
				// still editing the query, so the input keeps its caret movement.
				const editing =
					grid &&
					store.activeIndex == null &&
					(event.key === 'ArrowLeft' || event.key === 'ArrowRight');
				if (!editing) (navigationKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event);
			}
		} as HTMLAttributes<HTMLElement>;
	});
	const popupProps = $derived(mergeProps({ ...FOCUSABLE_POPUP_PROPS }, dismiss.floating));
	const listProps = $derived(listNavigation.floating);
	// Focus stays on the input. Item focus would sync the list navigation from DOM focus.
	const itemProps = $derived.by(() => {
		const { onfocus: _onfocus, ...props } = listNavigation.item;
		return props;
	});

	// An inline list inside a dialog completes its close with the dialog's animation.
	useOpenChangeComplete(() => ({
		enabled: inline && store.mounted && !store.open && !store.preventUnmountingOnClose,
		open: store.open,
		element: store.positionerElement?.closest<HTMLElement>('[role="dialog"]') ?? null,
		onComplete: () => store.forceUnmount()
	}));

	watchFieldControl(field, {
		enabled: () => !disabled,
		id: () => controlId.current,
		name: () => nameProp,
		element: () => (store.inputInsidePopup ? store.triggerElement : store.inputElement),
		getValue: () => fieldStringValue
	});

	$effect(() => {
		if (selectionMode === 'none') field.setFilled(currentInput !== '');
		else field.setFilled(multiple ? Array.isArray(current) && current.length > 0 : current != null);
	});

	function isDirty() {
		const initial = field.validityData.initialValue;
		const serialized = fieldStringValue;
		return Array.isArray(serialized) && Array.isArray(initial)
			? !sameStrings(serialized, initial)
			: serialized !== initial;
	}

	function syncInputToSelectedLabel() {
		const label = store.selectedLabelString;
		if (currentInput !== label) store.setInputValue(label, createChangeEventDetails(REASONS.none));
	}

	useValueChanged(
		() => current,
		(next) => {
			if (selectionMode === 'none') return;
			formContext.clearErrors(name);
			field.setDirty(isDirty());
			field.change(next);
			if (single && !hasInputValue && !store.inputInsidePopup) syncInputToSelectedLabel();
		}
	);

	// The label follows accessor changes. The items identity restores the selected label after the
	// input was cleared and the data reloaded.
	function syncInputAfterItemsOrLabelChange() {
		if (single && !hasInputValue && !store.inputInsidePopup && !store.queryChangedAfterOpen) {
			syncInputToSelectedLabel();
		}
	}
	useValueChanged(() => store.selectedLabelString, syncInputAfterItemsOrLabelChange);
	useValueChanged(() => items, syncInputAfterItemsOrLabelChange);

	useValueChanged(
		() => currentInput,
		(next) => {
			if (selectionMode !== 'none') return;
			formContext.clearErrors(name);
			field.setDirty(isDirty());
			field.change(next);
		}
	);

	useValueChanged(
		() => store.query,
		(query) => {
			const inputMatchesSelectedValue =
				single && !store.inputInsidePopup && currentInput === store.selectedLabelString;
			if (
				open &&
				query !== '' &&
				query !== String(initialInputValue) &&
				!inputMatchesSelectedValue
			) {
				store.queryChangedAfterOpen = true;
			}
		}
	);

	// A bound `open` can interrupt the close without `setOpen`.
	useValueChanged(
		() => open,
		(next) => {
			if (next && store.closeQuery !== null) store.handleInterruptedReopen(false);
		}
	);

	// The hidden input is the constraint element. Form focuses the visible control.
	$effect(() => {
		const input = hiddenInput;
		if (!input) return;
		return field.registerInput(input, {
			element: store.inputInsidePopup ? store.triggerElement : store.inputElement,
			value: undefined
		});
	});

	restoreOnReset(() => hiddenInput, {
		restore: () => {
			if (selectionMode === 'none') {
				inputValue = defaultInputValue ?? '';
				return;
			}
			const next = defaultSelectedValue ?? emptyValue();
			if (!Object.is(current, next)) selection.set(next);
			if (hasInputValue) inputValue = defaultInputValue ?? '';
			else inputValue = single && !store.inputInsidePopup ? store.stringifyLabel(next) : '';
		},
		settle: () => {
			// The browser reset the visible input to its own default, which Svelte does not track.
			const input = store.inputElement;
			if (input && input.value !== currentInput) input.value = currentInput;
		}
	});

	const boundProps = $derived(bound.inputProps());
	// The server renders no popup input, so until the input registers, the rendered input owns
	// the value and the server HTML names one control at most.
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
	/** Without a selection, Autocomplete submits its input, which then carries the name. */
	const inputOwnsFormValue = $derived(
		selectionMode === 'none' && (inline || !hydrated || !store.inputInsidePopup)
	);
	const submitName = $derived(bound.bound ? boundProps.name : name);
	const hiddenInputName = $derived(multiple || inputOwnsFormValue ? undefined : submitName);
	const serializedValue = $derived(Array.isArray(fieldRawValue) ? '' : serialize(fieldRawValue));
	const serializedDefault = $derived.by(() => {
		if (selectionMode === 'none') return defaultInputValue ?? '';
		if (multiple) return '';
		return serialize(defaultSelectedValue ?? null);
	});
	const hasMultipleSelection = $derived(multiple && Array.isArray(current) && current.length > 0);
	const describedBy = $derived(labelable?.describedBy(undefined));
	const invalid = $derived(field.state.valid === false && !disabled);

	function focusControl() {
		const target = store.inputInsidePopup
			? store.triggerElement
			: (store.inputElement ?? store.triggerElement);
		target?.focus();
	}

	/** Browser autofill writes a scalar into the hidden input. */
	function handleAutofill(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (dispatchingValueEvent()) return;
		const input = event.currentTarget;
		if (event.defaultPrevented || disabled || readOnly) {
			input.value = serializedValue;
			return;
		}
		const nextValue = input.value;
		const lower = nextValue.toLowerCase();
		const details = createChangeEventDetails(REASONS.none, event);
		const serializedMatch = () =>
			store.values.findIndex(
				(candidate) =>
					serialize(candidate).toLowerCase() === lower ||
					store.stringifyLabel(candidate).toLowerCase() === lower
			);

		// Only single selection matches registered values. Rendered labels need the list mounted.
		if (single && (!store.hasItems || serializedMatch() === -1)) {
			store.forceMounted = true;
			flushSync();
		}
		queueMicrotask(() => {
			if (multiple) return;
			if (selectionMode === 'none') {
				store.setInputValue(nextValue, details);
				return;
			}
			const values = store.values;
			let index = serializedMatch();
			if (index === -1) {
				// Browsers can fill the rendered text of a primitive value, like `US` for "United States".
				const labels = store.items.elements.map((element) => element.textContent?.trim());
				index = labels.findIndex((label) => label && label.toLowerCase() === lower);
			}
			const match = index === -1 ? undefined : values[index];
			if (match != null) store.setSelectedValue(match, details);
			if (input.value !== serializedValue) input.value = serializedValue;
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
	autocomplete={formAutoComplete}
	value={serializedValue}
	defaultValue={serializedDefault}
	{disabled}
	required={required && !hasMultipleSelection}
	readonly={readOnly}
	style={toCssStyle(hiddenInputName ? visuallyHiddenInput : visuallyHidden)}
	tabindex="-1"
	aria-hidden="true"
	aria-invalid={invalid || undefined}
	aria-describedby={describedBy}
	onfocus={focusControl}
	oninput={handleAutofill}
	{...multiple || inputOwnsFormValue ? {} : boundProps}
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
		{...boundProps as Record<string | symbol, unknown>}
	>
		{#each submitOptions as serialized (serialized)}
			<option value={serialized} selected={serializedDefaults.includes(serialized)}
				>{serialized}</option
			>
		{/each}
	</select>
{/if}
