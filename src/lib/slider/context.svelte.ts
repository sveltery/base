// Derived from Base UI v1.8.0 packages/react/src/slider/root/SliderRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { SliderRootModel } from './model.svelte.js';

const SLIDER_CONTEXT = Symbol('slider-root');

export function setSliderContext(model: SliderRootModel) {
	setContext(SLIDER_CONTEXT, model);
}

export function useSliderContext() {
	if (!hasContext(SLIDER_CONTEXT)) {
		throw new Error(
			'Base UI: SliderRootContext is missing. Slider parts must be placed within <Slider.Root>.'
		);
	}
	return getContext<SliderRootModel>(SLIDER_CONTEXT);
}
