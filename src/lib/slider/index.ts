import SliderControl from './SliderControl.svelte';
import SliderIndicator from './SliderIndicator.svelte';
import SliderLabel from './SliderLabel.svelte';
import SliderRoot from './SliderRoot.svelte';
import SliderThumb from './SliderThumb.svelte';
import SliderTrack from './SliderTrack.svelte';
import SliderValue from './SliderValue.svelte';

export {
	SliderControl,
	SliderIndicator,
	SliderLabel,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	SliderValue
};

/** Compound parts matching Base UI `Slider`. */
export const Slider = {
	Root: SliderRoot,
	Label: SliderLabel,
	Value: SliderValue,
	Control: SliderControl,
	Track: SliderTrack,
	Thumb: SliderThumb,
	Indicator: SliderIndicator
};

export type * from './types.js';
