import { Slider } from '@sveltery/base/slider';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Slider);

export const TypesSlider = types;
