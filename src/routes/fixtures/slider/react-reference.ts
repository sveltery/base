// React Base UI 1.9.0 counterpart of SliderFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Slider } from '@base-ui/react/slider';
import type { SliderCase } from './cases.js';

type FixtureProps<T> = T & { 'data-testid'?: string };
function rootProps(props: FixtureProps<ComponentProps<typeof Slider.Root>>) {
	return props;
}
function labelProps(props: FixtureProps<ComponentProps<typeof Slider.Label>>) {
	return props;
}
function valueProps(props: FixtureProps<ComponentProps<typeof Slider.Value>>) {
	return props;
}
function trackProps(props: FixtureProps<ComponentProps<typeof Slider.Track>>) {
	return props as ComponentProps<typeof Slider.Track>;
}
function indicatorProps(props: FixtureProps<ComponentProps<typeof Slider.Indicator>>) {
	return props as ComponentProps<typeof Slider.Indicator>;
}
function thumbProps(props: FixtureProps<ComponentProps<typeof Slider.Thumb>>) {
	return props as ComponentProps<typeof Slider.Thumb>;
}
function controlProps(props: FixtureProps<ComponentProps<typeof Slider.Control>>) {
	return props as ComponentProps<typeof Slider.Control>;
}

export function mountSliderReference(node: HTMLElement, scenario: SliderCase, onReady: () => void) {
	const root: Root = createRoot(node);

	function App() {
		const [value, setValue] = useState(30);
		useEffect(onReady, []);

		if (scenario === 'plain') {
			return h(
				Slider.Root,
				rootProps({ locale: 'en-US', defaultValue: 30, 'data-testid': 'root' }),
				h(Slider.Control, controlProps({ 'data-testid': 'control' }), h(Slider.Thumb))
			);
		}
		if (scenario === 'labelled') {
			return h(
				Slider.Root,
				rootProps({ locale: 'en-US', defaultValue: 30, 'data-testid': 'root' }),
				h(Slider.Label, labelProps({ 'data-testid': 'label' }), 'Volume'),
				h(Slider.Control, null, h(Slider.Thumb))
			);
		}
		if (scenario === 'range') {
			return h(
				Slider.Root,
				rootProps({ locale: 'en-US', defaultValue: [40, 65] }),
				h(Slider.Value, valueProps({ 'data-testid': 'value' })),
				h(Slider.Control, null, h(Slider.Thumb, { index: 0 }), h(Slider.Thumb, { index: 1 }))
			);
		}
		if (scenario === 'bound') {
			return h(
				Fragment,
				null,
				h(
					Slider.Root,
					rootProps({ locale: 'en-US', value, onValueChange: (next) => setValue(next as number) }),
					h(Slider.Control, null, h(Slider.Thumb))
				),
				h('output', { 'data-testid': 'value' }, String(value))
			);
		}
		if (scenario === 'disabled') {
			return h(
				Slider.Root,
				rootProps({ locale: 'en-US', defaultValue: 30, disabled: true, 'data-testid': 'root' }),
				h(Slider.Control, null, h(Slider.Thumb))
			);
		}
		if (scenario === 'edge') {
			const thumbStyle = { width: 20, height: 20 };
			return h(
				Slider.Root,
				rootProps({ locale: 'en-US', defaultValue: [20, 70], thumbAlignment: 'edge' }),
				h(
					Slider.Control,
					controlProps({ 'data-testid': 'control', style: { width: 200, height: 20 } }),
					h(
						Slider.Track,
						trackProps({ style: { height: '100%' } }),
						h(Slider.Indicator, indicatorProps({ 'data-testid': 'indicator' })),
						h(Slider.Thumb, thumbProps({ index: 0, 'data-testid': 'thumb', style: thumbStyle })),
						h(Slider.Thumb, thumbProps({ index: 1, 'data-testid': 'thumb', style: thumbStyle }))
					)
				)
			);
		}
		return h(
			Slider.Root,
			rootProps({ locale: 'en-US', orientation: 'vertical', defaultValue: 30 }),
			h(Slider.Control, null, h(Slider.Thumb))
		);
	}

	root.render(h(App));
	return () => root.unmount();
}
