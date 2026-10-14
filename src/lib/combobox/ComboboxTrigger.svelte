<!--
	A button that opens the popup. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/trigger/ComboboxTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ClickInteraction, Typeahead } from '@sveltery/floating-ui-svelte';
	import {
		contains,
		createChangeEventDetails,
		getTarget,
		ownerDocument,
		REASONS,
		ScopedTimeout
	} from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, findLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import { isMouseWithinBounds } from '../select/popup-utils.js';
	import { useComboboxRoot } from './context.svelte.js';
	import { stopEvent } from '@sveltery/floating-ui-svelte';
	import { getComboboxPopupId } from './filter.js';
	import { triggerStateAttributesMapping } from './parts.js';
	import type { ComboboxTriggerProps, ComboboxTriggerState } from './types.js';

	let {
		disabled: disabledProp = false,
		nativeButton = true,
		id: idProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: ComboboxTriggerProps = $props();

	const store = useComboboxRoot();
	const field = useFieldContext();
	const labelable = findLabelableContext();
	new LabelableId(labelable, { id: () => (store.inputInsidePopup ? idProp : undefined) });

	const bindKey = createAttachmentKey();
	const comboboxDisabled = $derived(store.root.disabled);
	const disabled = $derived(field.disabled || comboboxDisabled || disabledProp);
	const readOnly = $derived(store.root.readOnly);
	const open = $derived(store.open);
	const inputInsidePopup = $derived(store.inputInsidePopup);
	const id = $derived(inputInsidePopup ? (idProp ?? store.root.id) : idProp);
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));
	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => store.triggerElement
	});
	const focusTimeout = new ScopedTimeout();
	let pointerType = '';
	let stopMouseUp: (() => void) | null = null;

	$effect(() => () => stopMouseUp?.());

	// Typeahead on a closed trigger commits a value rather than moving a highlight, so it stays
	// off while read-only.
	const typeahead = new Typeahead(store, () => ({
		enabled: !open && !readOnly && !comboboxDisabled && store.selectionMode === 'single',
		labels: () => store.labels(),
		activeIndex: store.activeIndex,
		selectedIndex: store.selectedIndex,
		onMatch(index) {
			const next = store.values[index];
			if (next !== undefined) {
				store.setSelectedValue(next, createChangeEventDetails(REASONS.none));
			}
		}
	}));

	const click = new ClickInteraction(store, () => ({
		enabled: !comboboxDisabled,
		event: 'mousedown'
	}));

	function bindTrigger(node: HTMLElement) {
		store.triggerElement = node;
		return () => {
			if (store.triggerElement === node) store.triggerElement = null;
		};
	}

	function handleMouseDown(event: MouseEvent) {
		if (disabled) return;
		const trigger = event.currentTarget as HTMLElement;
		if (!store.inputInsidePopup) store.domReferenceElement = trigger;
		// Registers the items for the initial selection highlight.
		store.forceMount();
		if (pointerType !== 'touch') {
			store.inputElement?.focus();
			if (!store.inputInsidePopup) event.preventDefault();
		}
		if (store.open || !store.inputInsidePopup) return;

		function handleMouseUp(mouseEvent: MouseEvent) {
			stopMouseUp?.();
			stopMouseUp = null;
			const current = store.triggerElement;
			if (!current) return;
			const target = getTarget(mouseEvent) as Element | null;
			if (
				contains(current, target) ||
				contains(store.positionerElement, target) ||
				contains(store.listElement, target)
			) {
				return;
			}
			if (isMouseWithinBounds(mouseEvent, current)) return;
			store.setOpen(false, createChangeEventDetails(REASONS.cancelOpen, mouseEvent));
		}

		stopMouseUp?.();
		stopMouseUp = on(ownerDocument(trigger), 'mouseup', handleMouseUp);
	}

	const partState: ComboboxTriggerState = $derived({
		...field.state,
		readOnly,
		open,
		disabled,
		popupSide: store.renderedPopupSide,
		listEmpty: store.listEmpty,
		placeholder: store.selectionMode === 'none' ? false : !store.hasSelectedValue
	});

	const ariaControls = $derived.by(() => {
		if (!open) return undefined;
		// The default id covers the commit before the popup registers its own.
		if (inputInsidePopup) return store.popupId ?? getComboboxPopupId(store.root.id);
		return store.listElement?.id;
	});

	const describedBy = $derived(labelable?.describedBy(ariaDescribedBy ?? undefined));
	const labelledBy = $derived(labelable?.labelId ?? store.labelId);

	const hostProps: HTMLButtonAttributes = $derived.by(() => {
		const { onmousedown: baseMouseDown, ...base } = mergeProps(
			typeahead.reference,
			click.reference
		) as Record<string, unknown> & { onmousedown?: (event: MouseEvent) => void };
		return button.props(
			mergeProps(
				base,
				{
					id,
					tabindex: inputInsidePopup ? 0 : -1,
					role: inputInsidePopup ? ('combobox' as const) : undefined,
					'aria-expanded': open,
					'aria-haspopup': inputInsidePopup ? ('dialog' as const) : ('listbox' as const),
					'aria-controls': ariaControls,
					'aria-required': inputInsidePopup ? store.root.required || undefined : undefined,
					// Only valid with the combobox role. The input outside the popup carries it.
					'aria-readonly': inputInsidePopup ? readOnly || undefined : undefined,
					...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
					...(describedBy ? { 'aria-describedby': describedBy } : {}),
					...(field.state.valid === false && !disabled ? { 'aria-invalid': true as const } : {}),
					onpointerdown(event: PointerEvent) {
						pointerType = event.pointerType;
					},
					onpointerenter(event: PointerEvent) {
						pointerType = event.pointerType;
					},
					onfocus() {
						focusOwner.set(true);
						if (disabled) return;
						focusTimeout.start(0, () => store.forceMount());
					},
					onblur(event: FocusEvent) {
						// Focus moving into the popup is not a blur.
						if (contains(store.positionerElement, event.relatedTarget as Element | null)) return;
						field.setTouched(true);
						focusOwner.set(false);
						if (field.validationMode === 'onBlur') {
							field.commit(store.selectionMode === 'none' ? store.inputValue : store.selectedValue);
						}
					},
					// The press focuses the input and keeps focus there, which prevents the default.
					// The click interaction still has to see it.
					onmousedown(event: MouseEvent) {
						handleMouseDown(event);
						baseMouseDown?.(event);
					},
					onkeydown(event: KeyboardEvent) {
						if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
							stopEvent(event);
							store.setOpen(true, createChangeEventDetails(REASONS.listNavigation, event));
							store.inputElement?.focus();
						}
					},
					...getStateAttributesProps(partState, triggerStateAttributesMapping),
					[bindKey]: bindTrigger
				},
				elementProps
			)
		);
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
