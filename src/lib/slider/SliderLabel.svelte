<!--
	An accessible label that is automatically associated with the slider thumbs.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/slider/label/SliderLabel.tsx
	and packages/react/src/internals/labelable-provider/useLabel.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The label id is registered after mount, so server HTML does not set aria-labelledby yet.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { getControlById } from '../internal/useLabel.js';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import { closest, getTarget } from '@sveltery/utils';
	import { focusElement } from './dom.js';
	import type { SliderLabelProps, SliderRootState } from './types.js';

	let { render, children, onclick, onpointerdown, ...elementProps }: SliderLabelProps = $props();

	const model = useSliderContext();
	const labelable = useLabelableContext();
	const state: SliderRootState = $derived(model.snapshot());
	const id = $derived(model.rootDomId ? `${model.rootDomId}-label` : undefined);

	registerLabelId(
		() => id,
		(next) => {
			model.labelId = next;
		},
		() => model.labelId
	);
	registerLabelId(
		() => id,
		(next) => labelable.setLabelId(next),
		() => labelable.labelId
	);

	function focusControl(event: MouseEvent) {
		const controlId = labelable.controlId;
		if (controlId) {
			const controlElement = getControlById(event.currentTarget as Element, controlId);
			if (controlElement instanceof HTMLElement) {
				focusElement(controlElement, { focusVisible: true });
				return;
			}
		}

		const inputs = model.control?.querySelectorAll('input[type="range"]');
		const fallback = inputs?.length === 1 ? inputs[0] : null;
		if (fallback instanceof HTMLElement) focusElement(fallback, { focusVisible: true });
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (closest(getTarget(event), 'button,input,select,textarea')) return;
		if (event.detail > 1) event.preventDefault();
		focusControl(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, sliderStateAttributes),
		id,
		onclick: handleClick,
		onpointerdown: handlePointerDown
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
