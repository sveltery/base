<!--
	An accessible label that is automatically associated with the select trigger.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/label/SelectLabel.tsx
	and packages/react/src/internals/labelable-provider/useLabel.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The label id is registered after mount, so server HTML does not set aria-labelledby yet.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { closest, getTarget } from '@sveltery/utils';
	import { fieldValidityMapping } from '../field/attributes.js';
	import type { FieldRootState } from '../field/types.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { findLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { getControlById } from '../internal/useLabel.js';
	import { useSelectRoot } from './context.svelte.js';
	import type { SelectLabelProps } from './types.js';

	let { render, children, onclick, onpointerdown, ...elementProps }: SelectLabelProps = $props();
	// The id follows the root. An `id` from an untyped consumer is dropped.
	const { id: _id, ...rest } = $derived(elementProps as typeof elementProps & { id?: string });

	const store = useSelectRoot();
	const field = useFieldContext();
	const labelable = findLabelableContext();
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
		(next) => labelable?.setLabelId(next),
		() => labelable?.labelId
	);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (closest(getTarget(event), 'button,input,select,textarea')) return;
		// A double click must not select the label text.
		if (event.detail > 1) event.preventDefault();
		const controlId = labelable?.controlId ?? store.triggerElement?.id ?? store.root.id;
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
