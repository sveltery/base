// Derived from Base UI v1.8.0 packages/react/src/slider/root/SliderRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { SliderRootModel } from './model.svelte.js';
import { defineContext } from '../internal/context.js';

export const [useSliderContext, setSliderContext] = defineContext<SliderRootModel>(
	'Base UI: SliderRootContext is missing. Slider parts must be placed within <Slider.Root>.'
);
