<!--
	An accessible label that is automatically associated with the slider thumbs.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/label/SliderLabel.tsx
	and packages/react/src/internals/labelable-provider/useLabel.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The label id is registered after mount, so server HTML does not set aria-labelledby yet.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLabelableContext } from '../field/labelable.svelte.js';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import { ownerDocument } from '../internal/owner.js';
	import { getTarget } from '../internal/shadow-dom.js';
	import { focusElement, isElement } from './dom.js';
	import type { SliderLabelProps, SliderRootState } from './types.js';

	let { render, children, onclick, onpointerdown, ...elementProps }: SliderLabelProps = $props();

	const model = useSliderContext();
	const labelable = useLabelableContext(true);
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
		(next) => labelable?.setLabelId(next),
		() => labelable?.labelId
	);

	function focusControl(event: MouseEvent) {
		const controlId = labelable?.controlId;
		if (controlId) {
			const controlElement = ownerDocument(event.currentTarget as Node).getElementById(controlId);
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
		const target = getTarget(event);
		if (isElement(target) && target.closest('button,input,select,textarea')) return;
		if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
		if (event.defaultPrevented) return;
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

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
