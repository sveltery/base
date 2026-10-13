<!--
	A button that opens the select popup. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/trigger/SelectTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import {
		contains,
		createChangeEventDetails,
		ownerDocument,
		REASONS,
		ScopedTimeout
	} from '@sveltery/utils';
	import { fieldValidityMapping } from '../field/attributes.js';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { LabelableId, findLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { pressableTriggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import {
		getStateAttributesProps,
		type StateAttributesMapping
	} from '../internal/state-attributes.js';
	import { FieldFocusOwner } from '../internal/useSetFieldFocused.svelte.js';
	import { CANCEL_OPEN, SELECTED_DELAY } from './constants.js';
	import { useSelectRoot } from './context.svelte.js';
	import { isMouseWithinBounds } from './popup-utils.js';
	import type { SelectTriggerProps, SelectTriggerState } from './types.js';

	let {
		disabled: disabledProp = false,
		nativeButton = true,
		id: idProp,
		'aria-describedby': ariaDescribedBy,
		render,
		children,
		...elementProps
	}: SelectTriggerProps = $props();

	const stateAttributesMapping: StateAttributesMapping<SelectTriggerState> = {
		...pressableTriggerOpenStateMapping,
		...fieldValidityMapping,
		popupSide: (side) => (side ? { 'data-popup-side': side } : null),
		value: () => null
	};

	const store = useSelectRoot();
	const field = useFieldContext();
	const labelable = findLabelableContext();
	new LabelableId(labelable, { id: () => idProp });

	const bindKey = createAttachmentKey();
	const disabled = $derived(field.disabled || store.root.disabled || disabledProp);
	const id = $derived(idProp ?? store.root.id);
	const open = $derived(store.open);
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));
	const focusOwner = new FieldFocusOwner(field, {
		disabled: () => disabled,
		target: () => store.triggerElement
	});

	const focusTimeout = new ScopedTimeout();
	const mouseDownTimeout = new ScopedTimeout();
	const selectedDelayTimeout = new ScopedTimeout();
	let stopMouseUp: (() => void) | null = null;

	$effect(() => {
		if (open) {
			// A press can open the popup under the cursor. Mouseup selection stays off briefly so
			// releasing over an item does not select it. An item allows it sooner after a drag.
			selectedDelayTimeout.start(SELECTED_DELAY, () => {
				store.selection.allowUnselectedMouseUp = true;
				store.selection.allowSelectedMouseUp = true;
			});
			return () => selectedDelayTimeout.clear();
		}
		store.selection = { allowSelectedMouseUp: false, allowUnselectedMouseUp: false, dragY: 0 };
		mouseDownTimeout.clear();
	});

	$effect(() => () => stopMouseUp?.());

	function bindTrigger(node: HTMLElement) {
		store.triggerElement = node;
		return () => {
			if (store.triggerElement === node) store.triggerElement = null;
		};
	}

	function handleFocus(event: FocusEvent) {
		focusOwner.set(true);
		// The popup must not cover the focused trigger.
		if (store.open && store.alignItemWithTriggerActive) {
			store.setOpen(false, createChangeEventDetails(REASONS.none, event));
		}
		// Mounts the items before the first open, for typeahead on the closed trigger.
		focusTimeout.start(0, () => {
			store.forceMount = true;
		});
	}

	function handleBlur(event: FocusEvent) {
		// Focus moving into the popup is not a blur.
		if (contains(store.positionerElement, event.relatedTarget)) return;
		field.setTouched(true);
		focusOwner.set(false);
		if (field.validationMode === 'onBlur') field.commit(store.value);
	}

	function handleMouseDown(event: MouseEvent) {
		if (store.open) return;
		const trigger = event.currentTarget as HTMLElement;
		const doc = ownerDocument(trigger);

		function handleMouseUp(mouseEvent: MouseEvent) {
			stopMouseUp?.();
			stopMouseUp = null;
			const target = mouseEvent.target as Element | null;
			// A release on the trigger or inside the popup is not a cancel.
			if (contains(trigger, target) || contains(store.positionerElement, target)) return;
			if (isMouseWithinBounds(mouseEvent, trigger)) return;
			store.setOpen(false, createChangeEventDetails(CANCEL_OPEN, mouseEvent));
		}

		// Firefox can fire the mouseup of this press on mousedown.
		mouseDownTimeout.start(0, () => {
			stopMouseUp?.();
			stopMouseUp = on(doc, 'mouseup', handleMouseUp);
		});
	}

	const partState: SelectTriggerState = $derived({
		...field.state,
		open,
		disabled,
		value: store.value,
		readOnly: store.root.readOnly,
		popupSide: store.mounted && store.positionerElement ? store.popupSide : null,
		placeholder: !store.hasSelectedValue
	});

	const describedBy = $derived(labelable?.describedBy(ariaDescribedBy ?? undefined));

	const hostProps: HTMLButtonAttributes = $derived.by(() => {
		const props: HTMLButtonAttributes = button.props(
			mergeProps(
				store.triggerProps,
				{
					id,
					'aria-expanded': open,
					'aria-haspopup': 'listbox' as const,
					...(open && store.listElement?.id
						? { 'aria-controls': store.listElement.id }
						: open && store.popupElement?.id
							? { 'aria-controls': store.popupElement.id }
							: {}),
					...(labelable?.labelId || store.labelId
						? { 'aria-labelledby': labelable?.labelId ?? store.labelId }
						: {}),
					...(store.root.readOnly ? { 'aria-readonly': true as const } : {}),
					...(store.root.required ? { 'aria-required': true as const } : {}),
					...(describedBy ? { 'aria-describedby': describedBy } : {}),
					...(field.state.valid === false && !disabled ? { 'aria-invalid': true as const } : {}),
					tabindex: disabled ? -1 : 0,
					onfocus: handleFocus,
					onblur: handleBlur,
					onmousedown: handleMouseDown,
					...getStateAttributesProps(partState, stateAttributesMapping),
					[bindKey]: bindTrigger
				},
				elementProps
			)
		);
		// A toolbar button rendering this trigger must not replace the combobox role.
		props.role = 'combobox';
		return props;
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
