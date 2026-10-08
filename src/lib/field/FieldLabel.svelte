<!--
	An accessible label that is automatically associated with the field control.
	Renders a `<label>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/label/FieldLabel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { DEV } from 'esm-env';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes, HTMLLabelAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext, useFieldItemContext } from './context.svelte.js';
	import { useLabelableContext } from './labelable.svelte.js';
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
	// Effects do not run while the label is rendered on the server, so publish
	// the id now. OTP inputs read it for aria-labelledby in that same render.
	// The effect below tracks later id changes.
	// svelte-ignore state_referenced_locally
	labelable.setLabelId(idProp ?? `base-ui-${uid}`);

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
		const nextId = id;
		labelable.setLabelId(nextId);
		return () => {
			labelable.setLabelId((current) => (current === nextId ? undefined : current));
		};
	});

	$effect(() => {
		const element = labelEl;
		if (!DEV || !element) return;
		const isLabel = element.tagName === 'LABEL';
		if (nativeLabel && !isLabel) {
			console.error(
				'Base UI: <Field.Label> expected a <label> element because the `nativeLabel` prop is true. Rendering a non-<label> disables native label association, so `htmlFor` will not work. Use a real <label> in the `render` prop, or set `nativeLabel` to `false`.'
			);
		} else if (!nativeLabel && isLabel) {
			console.error(
				'Base UI: <Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the `render` prop, or set `nativeLabel` to `true`.'
			);
		}
	});

	function focusControl(event: MouseEvent) {
		const controlId = labelable.controlId;
		if (!controlId) return;
		const current = event.currentTarget;
		const doc = current instanceof Node ? (current.ownerDocument ?? document) : document;
		const control = doc.getElementById(controlId);
		if (control instanceof HTMLElement) {
			control.focus({ focusVisible: true } as FocusOptions);
		}
	}

	function handleInteraction(event: MouseEvent) {
		const target = event.target;
		if (target instanceof Element && target.closest('button,input,select,textarea')) return;
		if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
		if (nativeLabel) return;
		focusControl(event);
	}

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement }) {
		onmousedown?.(event);
		if (nativeLabel) handleInteraction(event);
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement }) {
		onclick?.(event);
		if (!nativeLabel) handleInteraction(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLLabelElement }
	) {
		onpointerdown?.(event);
		if (!nativeLabel) event.preventDefault();
	}

	const hostProps: HTMLLabelAttributes = $derived({
		...elementProps,
		...getStateAttributesProps(labelState, fieldValidityMapping),
		id,
		...(nativeLabel ? { for: labelable.controlId ?? undefined } : {}),
		onmousedown: handleMouseDown,
		onclick: handleClick,
		...(!nativeLabel ? { onpointerdown: handlePointerDown } : {}),
		...(render ? { [elementKey]: remember } : {})
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, labelState)}
{:else}
	<label {...hostProps} bind:this={labelEl}>{@render children?.()}</label>
{/if}
