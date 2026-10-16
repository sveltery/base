<!--
	An accessible label that is automatically associated with the combobox trigger.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/label/ComboboxLabel.tsx
	and packages/react/src/internals/labelable-provider/useLabel.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The label id is registered after mount, so server HTML does not set aria-labelledby yet.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { closest, error, getTarget } from '@sveltery/utils';
	import { fieldValidityMapping } from '../field/attributes.js';
	import type { FieldRootState } from '../field/types.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { getControlById } from '../internal/useLabel.js';
	import { useComboboxRoot } from './context.svelte.js';
	import type { ComboboxLabelProps } from './types.js';

	let { render, children, onclick, onpointerdown, ...elementProps }: ComboboxLabelProps = $props();
	// The id follows the root. An `id` from an untyped consumer is dropped.
	const { id: _id, ...rest } = $derived(elementProps as typeof elementProps & { id?: string });

	const store = useComboboxRoot();
	const field = useFieldContext();
	const labelable = useLabelableContext();
	const id = $derived(`${store.root.id}-label`);

	registerLabelId(
		() => id,
		(next) => {
			store.labelId = next;
		},
		() => store.labelId
	);
	registerLabelId(
		() => id,
		(next) => labelable.setLabelId(next),
		() => labelable.labelId
	);

	$effect(() => {
		if (!store.inputElement || store.inputInsidePopup) return;
		error(
			'<Combobox.Label> labels <Combobox.Trigger> only. ' +
				'When <Combobox.Input> is the form control, use a native <label> or <Field.Label> instead.'
		);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (closest(getTarget(event), 'button,input,select,textarea')) return;
		// A double click must not select the label text.
		if (event.detail > 1) event.preventDefault();
		const controlId =
			labelable.controlId ??
			store.triggerElement?.id ??
			(store.inputInsidePopup ? store.root.id : undefined);
		if (!controlId) return;
		const control = getControlById(event.currentTarget, controlId);
		if (control instanceof HTMLElement) control.focus({ focusVisible: true } as FocusOptions);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		event.preventDefault();
	}

	const partState: FieldRootState = $derived(field.state);
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState, fieldValidityMapping),
		...rest,
		id,
		onclick: handleClick,
		onpointerdown: handlePointerDown
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
