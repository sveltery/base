<!--
	Groups all parts of the select.
	Renders a hidden `<select>` that submits the value, and no other element of its own.
	Derived from Base UI v1.9.0 packages/react/src/select/root/SelectRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`actionsRef` is the exported `close` and `unmount`. Bind the root with `bind:this`.
	`inputRef` is not ported. Native `<select>` attributes and handlers go to the hidden
	`<select>`, which is `multiple` for an array value. Its options carry `selected` in the
	server HTML, so a form without JavaScript submits the current value.
-->
<script lang="ts" generics="Value = unknown, Multiple extends boolean | undefined = false">
	import {
		ClickInteraction,
		DismissInteraction,
		ListNavigation,
		Typeahead
	} from '@sveltery/floating-ui-svelte';
	import { BROWSER } from 'esm-env';
	import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils';
	import { DEFAULT_FIELD_ROOT_CONTEXT, useFieldContext } from '../internal/field-root-context.js';
	import { watchFieldControl } from '../internal/field-register-control.svelte.js';
	import { watchSpreadPath } from '../field/watch-spread-path.svelte.js';
	import { useFormContext } from '../internal/form-context.js';
	import { restoreOnReset } from '../internal/form-reset.svelte.js';
	import { LabelableId, useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import {
		defaultItemEquality,
		type ItemEqualityComparer
	} from '../internal/listbox/itemEquality.js';
	import {
		flattenLeafItems,
		resolveSelectedLabel,
		stringifyAsLabel,
		stringifyAsValue,
		type ItemsInput,
		type LabeledItem
	} from '../internal/listbox/resolveValueLabel.js';
	import { chain, mergeProps } from '../internal/mergeProps.js';
	import { FOCUSABLE_POPUP_PROPS } from '../internal/popups/index.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { useValueChanged } from '../internal/useValueChanged.svelte.js';
	import { dispatchingValueEvent } from '../internal/value-events.js';
	import { setSelectRoot } from './context.svelte.js';
	import {
		nativeOptions,
		queueSelectEvents,
		sameStrings
	} from '../internal/listbox/native-select.js';
	import { SelectStore } from './store.svelte.js';
	import type { SelectRootProps, SelectValueOf } from './types.js';

	const uid = $props.id();

	let {
		value = $bindable(),
		defaultValue,
		open = $bindable(false),
		defaultOpen,
		onOpenChange,
		onOpenChangeComplete,
		name: nameProp,
		form: formId,
		autocomplete,
		id: idProp,
		required: requiredProp,
		readonly: readOnly = false,
		disabled: disabledProp,
		multiple: multipleProp,
		highlightItemOnHover = true,
		modal = true,
		items,
		itemToStringLabel,
		itemToStringValue,
		isItemEqualToValue,
		type: _type,
		onfocus,
		oninput,
		onchange,
		'aria-invalid': ariaInvalidProp,
		'aria-describedby': ariaDescribedBy,
		children,
		...selectProps
	}: SelectRootProps<Value, Multiple> = $props();
	// The fallback stands for an omitted `open`, so `defaultOpen` replaces it.
	// svelte-ignore state_referenced_locally
	if (open === false && defaultOpen !== undefined) open = defaultOpen;

	type SelectValue = SelectValueOf<Value, Multiple>;

	const EMPTY: readonly unknown[] = [];
	const multiple = $derived(multipleProp === true);
	const comparer = $derived((isItemEqualToValue ?? defaultItemEquality) as ItemEqualityComparer);
	const emptyValue = () => (multiple ? [] : null) as SelectValue;
	const required = $derived(requiredProp ?? false);

	const field = useFieldContext();
	const formContext = useFormContext();
	const labelable = useLabelableContext();

	// Without a spread, a select in a named Field of a remote form names itself from the field.
	const bound = $derived(
		nameProp === undefined ? field.bindRemote(multiple ? 'select multiple' : 'select') : undefined
	);
	watchSpreadPath(field, formContext, () => nameProp);

	// Svelte proxies an object or array written to the prop. Items compare the written one.
	const selection = new WrittenReference<SelectValue | undefined>(
		() => value,
		(next) => {
			value = next;
		}
	);

	const current: SelectValue = $derived(selection.current ?? emptyValue());
	const disabled = $derived(field.disabled || (disabledProp ?? false));
	// The control's own name wins: a remote form encodes the value type and its id in it.
	const name = $derived(
		nameProp ?? (bound?.name as string | undefined) ?? (formContext.remote ? undefined : field.name)
	);
	const controlId = new LabelableId(labelable, {
		id: () => idProp,
		fallback: () => `base-ui-${uid}`
	});

	let valuesSelect = $state<HTMLSelectElement | null>(null);

	function serialize(item: unknown) {
		return stringifyAsValue(item, itemToStringValue as never);
	}

	function asList(item: unknown): readonly unknown[] {
		if (multiple) return Array.isArray(item) ? item : EMPTY;
		return [item];
	}

	/** What the form sees: each value serialized. */
	const fieldStringValue = $derived(
		multiple && Array.isArray(current) ? current.map(serialize) : serialize(current)
	);
	/** The serialized values the hidden select has selected. */
	const submitted = $derived(asList(current).map(serialize));
	const defaults = $derived(asList(defaultValue ?? null).map(serialize));
	const hasValue = $derived(submitted.some((text) => text !== ''));

	function listedValues(input: ItemsInput): readonly unknown[] {
		if (!input) return EMPTY;
		if (!Array.isArray(input)) return Object.keys(input).filter((key) => key !== 'null');
		return flattenLeafItems<LabeledItem>(input as readonly LabeledItem[]).map((item) => item.value);
	}

	function commitValue(next: unknown) {
		selection.set(next as SelectValue);
		queueSelectEvents(valuesSelect);
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
	// `defaultValue` is the initial value of an empty binding, as in HTML. A bare select in a
	// remote form starts from the value the form holds.
	// svelte-ignore state_referenced_locally
	if (value === undefined) {
		selection.set((bound?.value as SelectValue | undefined) ?? defaultValue ?? emptyValue());
	}

	// svelte-ignore state_referenced_locally
	store.initialValue = current;
	setSelectRoot(store);

	/** The options of the hidden select: the current and default values, then the known items. */
	const selectOptions = $derived(
		nativeOptions(
			[
				...asList(current),
				...asList(defaultValue ?? null),
				...store.values,
				...listedValues(items)
			],
			serialize,
			// An object value carries its label. Looking one up in `items` would compare the
			// proxy Svelte made of it.
			(candidate) =>
				typeof candidate === 'object' && candidate !== null
					? stringifyAsLabel(candidate, itemToStringLabel as never)
					: resolveSelectedLabel(candidate, items, itemToStringLabel as never)
		)
	);

	// The server marks the current options, so a form without JavaScript submits them. In the
	// browser the `selected` attribute is what a native reset restores, so it marks the defaults,
	// and this sets the live selection once Svelte has rendered the options.
	$effect(() => {
		const select = valuesSelect;
		const chosen = new Set(submitted);
		void selectOptions;
		if (!select) return;
		for (const option of select.options) {
			const next = chosen.has(option.value);
			if (option.selected !== next) option.selected = next;
		}
	});

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
			else store.setValue(store.values[index]);
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
		name: () => nameProp ?? undefined,
		element: () => store.triggerElement,
		getValue: () => fieldStringValue
	});

	$effect(() => {
		field.setFilled(store.hasSelectedValue);
	});

	useValueChanged(
		() => current,
		(next) => {
			field.clearExternalErrors();
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

	// The hidden select is the constraint element. Form focuses the trigger.
	$effect(() => {
		const select = valuesSelect;
		if (!select) return;
		return field.registerInput(select as unknown as HTMLInputElement, {
			element: store.triggerElement,
			value: undefined
		});
	});

	restoreOnReset(() => valuesSelect, {
		restore: () => {
			const next = (defaultValue ?? emptyValue()) as SelectValue;
			if (!Object.is(current, next)) selection.set(next);
		}
	});

	const describedBy = $derived(labelable.describedBy(ariaDescribedBy ?? undefined));
	// In a Field, the Field's verdict replaces the one a remote form spread carries.
	const ariaInvalid = $derived(
		field === DEFAULT_FIELD_ROOT_CONTEXT
			? ariaInvalidProp
			: field.state.valid === false && !disabled
				? true
				: undefined
	);

	function focusTrigger() {
		store.triggerElement?.focus({ focusVisible: true } as FocusOptions);
	}

	/** Browser autofill selects options of the hidden select. */
	function handleNativeEdit(event: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		if (dispatchingValueEvent()) return;
		const select = event.currentTarget;
		if (disabled || readOnly) {
			for (const option of select.options) option.selected = submitted.includes(option.value);
			return;
		}
		const chosen = Array.from(select.selectedOptions, (option) => option.value);
		const find = (text: string) =>
			selectOptions.find((option) => option.value === text)?.source ?? null;
		if (multiple) store.setValue(chosen.map(find).filter((item) => item != null));
		else store.setValue(chosen[0] ? find(chosen[0]) : null);
	}

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.()}
<select
	{...selectProps}
	bind:this={valuesSelect}
	id={name == null ? `${controlId.current}-hidden-input` : undefined}
	{name}
	form={formId}
	{autocomplete}
	{multiple}
	{disabled}
	required={BROWSER && required}
	style={toCssStyle(name ? visuallyHiddenInput : visuallyHidden)}
	tabindex="-1"
	aria-hidden="true"
	aria-invalid={ariaInvalid}
	aria-describedby={describedBy}
	onfocus={chain(focusTrigger, onfocus)}
	oninput={chain(handleNativeEdit, oninput)}
	onchange={chain(handleNativeEdit, onchange)}
>
	<!-- A single select reports `valueMissing` only while this empty option is selected. -->
	{#if !multiple && !hasValue}
		<option value="" selected={!BROWSER || defaults[0] === ''}></option>
	{/if}
	<!-- `label`, not text, so the visible items stay the only text a reader finds. -->
	{#each selectOptions as option (option.value)}
		<option
			value={option.value}
			label={option.label}
			selected={(BROWSER ? defaults : submitted).includes(option.value)}
		></option>
	{/each}
</select>
