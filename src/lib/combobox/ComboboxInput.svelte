<!--
	A text input to search for items in the list. Renders an `<input>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/input/ComboboxInput.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { createChangeEventDetails, platform, REASONS } from '@sveltery/utils';
	import { stopEvent } from '@sveltery/floating-ui-svelte';
	import { DEFAULT_FIELD_STATE } from '../field/model.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { getHighlightReason } from '../internal/getHighlightReason.js';
	import { findLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import ComboboxInternalDismissButton from './ComboboxInternalDismissButton.svelte';
	import { findComboboxChips, findComboboxPositioner, useComboboxRoot } from './context.svelte.js';
	import { getChipNavigationKeys, triggerStateAttributesMapping } from './parts.js';
	import type { ComboboxInputProps, ComboboxInputState } from './types.js';

	const uid = $props.id();

	let {
		disabled: disabledProp = false,
		id: idProp,
		'aria-describedby': ariaDescribedBy,
		render,
		...elementProps
	}: ComboboxInputProps = $props();

	const store = useComboboxRoot();
	const field = useFieldContext();
	const labelable = findLabelableContext();
	const chips = findComboboxChips();
	const hasPositionerParent = findComboboxPositioner() !== undefined;
	const direction = useDirection();
	const bindKey = createAttachmentKey();

	const disabled = $derived(field.disabled || store.root.disabled || disabledProp);
	const readOnly = $derived(store.root.readOnly);
	const isInsidePopup = $derived(hasPositionerParent || store.root.inline);
	const focusManagerModal = $derived(!isInsidePopup || store.root.modal);
	const id = $derived(idProp ?? (isInsidePopup ? `base-ui-${uid}` : store.root.id));
	const autoHighlightEnabled = $derived(Boolean(store.root.autoHighlight));

	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => store.inputElement
	});

	let composingValue = $state<string | null>(null);
	let composing = false;
	/** The highlight an inline list restores when the input regains focus in the same open. */
	let lastActiveIndex: number | null = null;

	$effect.pre(() => {
		if (!store.open) lastActiveIndex = null;
	});

	const displayed = $derived(composingValue ?? store.inputValue);

	function bindInput(node: HTMLInputElement) {
		untrack(() => {
			const insidePopup = hasPositionerParent || store.root.inline;
			if (insidePopup && !store.root.hasInputValue) {
				store.setInputValue('', createChangeEventDetails(REASONS.none));
			}
			store.inputElement = node;
			store.inputInsidePopup = insidePopup;
		});
		return () => {
			if (store.inputElement === node) store.inputElement = null;
		};
	}

	function clearHighlight(event: Event) {
		store.setIndices({
			activeIndex: null,
			selectedIndex: null,
			type: getHighlightReason(event),
			event
		});
	}

	function validateOnBlur() {
		if (field.validationMode !== 'onBlur') return;
		field.commit(store.selectionMode === 'none' ? store.inputValue : store.selectedValue);
	}

	/** Restores the input to the committed text after a canceled or reshaped edit. */
	function syncDomValue(input: HTMLInputElement) {
		if (composing) return;
		if (input.value !== displayed) input.value = displayed;
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const input = event.currentTarget;
		const inputType = (event as InputEvent).inputType;
		// Autofill may omit `inputType` or report `insertReplacementText`.
		const autofillLike = !inputType || inputType === 'insertReplacementText';
		const shouldOpenOnInput = composing || !autofillLike;

		function maybeOpenOnInput(trimmed: string) {
			if (readOnly || disabled || !trimmed || !shouldOpenOnInput) return;
			store.setOpen(true, createChangeEventDetails(REASONS.inputChange, event));
			// With autoHighlight the root keeps the highlight on the first item.
			if (!autoHighlightEnabled) clearHighlight(event);
		}

		// While composing, the list is not filtered yet, so `Combobox.Empty` does not flash.
		if (composing) {
			const next = input.value;
			composingValue = next;
			if (next === '' && !store.root.openOnInputClick && !store.inputInsidePopup) {
				store.setOpen(false, createChangeEventDetails(REASONS.inputClear, event));
			}
			const trimmed = next.trim();
			maybeOpenOnInput(trimmed);
			if (store.open && store.activeIndex !== null && !(autoHighlightEnabled && trimmed !== '')) {
				clearHighlight(event);
			}
			return;
		}

		const details = createChangeEventDetails(REASONS.inputChange, event);
		store.setInputValue(input.value, details);
		if (details.isCanceled) {
			syncDomValue(input);
			return;
		}

		const empty = input.value === '';
		const clearDetails = createChangeEventDetails(REASONS.inputClear, event);
		if (empty && !store.inputInsidePopup) {
			if (store.selectionMode === 'single') store.setSelectedValue(null, clearDetails);
			if (!store.root.openOnInputClick) store.setOpen(false, clearDetails);
		}

		maybeOpenOnInput(input.value.trim());

		// Typing returns virtual focus to the input.
		if (store.open && store.activeIndex !== null && !autoHighlightEnabled) {
			clearHighlight(event);
		}
		syncDomValue(input);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;

		if (disabled || readOnly) {
			// Browsing can highlight an item, and Enter there must not submit the form.
			if (readOnly && event.key === 'Enter' && store.open && store.activeIndex !== null) {
				stopEvent(event);
			}
			return;
		}

		const input = event.currentTarget;
		const scrollAmount = input.scrollWidth - input.clientWidth;
		const rtl = direction.direction === 'rtl';

		if (event.key === 'Home') {
			stopEvent(event);
			const cursor = platform.engine.gecko && rtl ? input.value.length : 0;
			input.setSelectionRange(cursor, cursor);
			input.scrollLeft = 0;
			return;
		}

		if (event.key === 'End') {
			stopEvent(event);
			const cursor = platform.engine.gecko && rtl ? 0 : input.value.length;
			input.setSelectionRange(cursor, cursor);
			input.scrollLeft = rtl ? -scrollAmount : scrollAmount;
			return;
		}

		const selectedValue = store.selectedValue;
		const multiple = store.selectionMode === 'multiple';

		if (!store.mounted && event.key === 'Escape') {
			const isClear = multiple && Array.isArray(selectedValue)
				? selectedValue.length === 0
				: selectedValue === null;
			const details = createChangeEventDetails(REASONS.escapeKey, event);
			store.setInputValue('', details);
			store.setSelectedValue(multiple ? [] : null, details);
			if (!isClear && !store.root.inline && !details.isPropagationAllowed) {
				event.stopPropagation();
			}
			return;
		}

		if (
			chips &&
			event.key === 'Backspace' &&
			input.value === '' &&
			Array.isArray(selectedValue) &&
			selectedValue.length > 0
		) {
			const renderedChips = chips.chips.elements.length;
			const removalIndex = renderedChips > 0 ? renderedChips - 1 : selectedValue.length - 1;
			clearHighlight(event);
			store.setSelectedValue(
				selectedValue.filter((_, index) => index !== removalIndex),
				createChangeEventDetails(REASONS.none, event)
			);
			return;
		}

		if (chips) {
			const [previousChipKey] = getChipNavigationKeys(direction.direction);
			if (
				event.key === previousChipKey &&
				(input.selectionStart ?? 0) === 0 &&
				Array.isArray(selectedValue) &&
				selectedValue.length > 0
			) {
				event.preventDefault();
				chips.chips.elements.at(-1)?.focus();
			}
		}

		// Composing.
		if (event.which === 229) return;

		if (event.key === 'Enter' && store.open) {
			const activeIndex = store.activeIndex;
			if (activeIndex === null) {
				if (store.root.inline) return;
				// The form can submit when nothing is highlighted.
				store.setOpen(false, createChangeEventDetails(REASONS.none, event));
				return;
			}
			stopEvent(event);
			store.clickHighlightedItem(activeIndex, event);
		}
	}

	const partState: ComboboxInputState = $derived({
		...(hasPositionerParent ? DEFAULT_FIELD_STATE : field.state),
		open: store.open,
		disabled,
		readOnly,
		popupSide: store.renderedPopupSide,
		listEmpty: store.listEmpty
	});

	const describedBy = $derived(
		hasPositionerParent ? ariaDescribedBy : labelable?.describedBy(ariaDescribedBy ?? undefined)
	);

	const hostProps: HTMLInputAttributes = $derived.by(() => {
		const { onkeydown: baseKeyDown, ...base } = store.inputProps;
		return mergeProps(
			base,
			{
				value: displayed,
				'aria-readonly': readOnly || undefined,
				'aria-required': store.root.required || undefined,
				...(labelable?.labelId ? { 'aria-labelledby': labelable.labelId } : {}),
				...(describedBy ? { 'aria-describedby': describedBy } : {}),
				...(!hasPositionerParent && field.state.valid === false && !disabled
					? { 'aria-invalid': true as const }
					: {}),
				disabled,
				readonly: readOnly,
				required: store.selectionMode === 'none' ? store.root.required : undefined,
				form: store.root.form,
				id,
				onfocus() {
					focusOwner.set(true);
					if (!store.root.inline) return;
					const next = lastActiveIndex;
					lastActiveIndex = null;
					if (next == null || next >= store.values.length) return;
					store.setIndices({ activeIndex: next });
				},
				onblur() {
					field.setTouched(true);
					focusOwner.set(false);
					const activeIndex = store.activeIndex;
					if (store.root.inline && activeIndex !== null && store.root.autoHighlight !== 'always') {
						lastActiveIndex = activeIndex;
						store.setIndices({ activeIndex: null });
					}
					validateOnBlur();
				},
				oncompositionstart(event: CompositionEvent) {
					if (platform.os.android) return;
					composing = true;
					composingValue = (event.currentTarget as HTMLInputElement).value;
				},
				oncompositionend(event: CompositionEvent) {
					composing = false;
					const input = event.currentTarget as HTMLInputElement;
					composingValue = null;
					store.setInputValue(input.value, createChangeEventDetails(REASONS.inputChange, event));
					syncDomValue(input);
				},
				oninput: handleInput,
				onkeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
					handleKeyDown(event);
					(baseKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event);
				},
				...getStateAttributesProps(partState, triggerStateAttributesMapping),
				[bindKey]: bindInput
			},
			store.inputFormProps,
			elementProps
		) as HTMLInputAttributes;
	});
</script>

{#if store.open && focusManagerModal}
	<ComboboxInternalDismissButton />
{/if}
{#if render}
	{@render render(hostProps, partState, undefined)}
{:else}
	<input {...hostProps} />
{/if}
