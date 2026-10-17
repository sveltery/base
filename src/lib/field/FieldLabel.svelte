<!--
	An accessible label that is automatically associated with the field control.
	Renders a `<label>` element.
	Derived from Base UI v1.9.0 packages/react/src/field/label/FieldLabel.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { closest, error, getTarget } from '@sveltery/utils';
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLLabelAttributes } from 'svelte/elements';
	import { getControlById } from '../internal/useLabel.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { chain } from '../internal/mergeProps.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useFieldItemContext } from './item-context.js';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import type { FieldLabelProps, FieldLabelState } from './types.js';

	const uid = $props.id();
	const elementKey = createAttachmentKey();

	let {
		id: idProp,
		nativeLabel = true,
		render,
		children,
		onmousedown,
		onclick,
		onpointerdown,
		...elementProps
	}: FieldLabelProps = $props();

	const field = useFieldContext();
	const item = useFieldItemContext();
	const labelable = useLabelableContext();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	// Effects do not run on the server. This write publishes the id in server HTML.
	untrack(() => {
		labelable.setLabelId(id);
	});
	registerLabelId(
		() => id,
		(next) => labelable.setLabelId(next),
		() => labelable.labelId
	);

	const labelState: FieldLabelState = $derived({
		...field.state,
		disabled: field.disabled || item.disabled
	});

	let labelEl = $state<HTMLElement | null>(null);

	function remember(node: HTMLElement) {
		labelEl = node;
		return () => {
			if (labelEl === node) labelEl = null;
		};
	}

	$effect(() => {
		const element = labelEl;
		if (!element) return;
		const isLabel = element.tagName === 'LABEL';
		if (nativeLabel && !isLabel) {
			error(
				'<Field.Label> expected a <label> element because the `nativeLabel` prop is true. Rendering a non-<label> disables native label association, so `for` will not work. Use a real <label> in the `render` snippet, or set `nativeLabel` to `false`.'
			);
		} else if (!nativeLabel && isLabel) {
			error(
				'<Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the `render` prop, or set `nativeLabel` to `true`.'
			);
		}
	});

	function focusControl(event: MouseEvent) {
		const controlId = labelable.controlId;
		if (!controlId) return;
		const current = event.currentTarget;
		if (!(current instanceof Element)) return;
		const control = getControlById(current, controlId);
		if (control instanceof HTMLElement) {
			control.focus({ focusVisible: true } as FocusOptions);
		}
	}

	function handleInteraction(event: MouseEvent) {
		if (closest(getTarget(event), 'button,input,select,textarea')) return;
		if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
		if (nativeLabel) return;
		focusControl(event);
	}

	function handlePointerDown(event: PointerEvent) {
		event.preventDefault();
	}

	const hostProps: HTMLLabelAttributes = $derived({
		...(nativeLabel ? { for: labelable.controlId ?? undefined } : {}),
		...elementProps,
		...getStateAttributesProps(labelState, fieldValidityMapping),
		id,
		...(nativeLabel
			? { onmousedown: chain(handleInteraction, onmousedown), onclick, onpointerdown }
			: {
					onmousedown,
					onclick: chain(handleInteraction, onclick),
					onpointerdown: chain(handlePointerDown, onpointerdown)
				}),
		[elementKey]: remember
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, labelState, children)}
{:else}
	<label {...hostProps}>{@render children?.()}</label>
{/if}
