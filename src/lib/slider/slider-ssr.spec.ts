// Upstream PrehydrationScript reads `useCSPContext().nonce` for the edge-alignment script.
// Base UI v1.8.0 commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// The remote form cases check the server HTML a form without JavaScript submits.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import RemoteControlHarness from '../../tests/RemoteControlHarness.svelte';
import SliderSsrHarness from '../../tests/SliderSsrHarness.svelte';
import { kitFields } from '../../tests/kit-fields.js';

describe('Slider SSR prehydration script', () => {
	it('carries the CSPProvider nonce', () => {
		const body = render(SliderSsrHarness, { props: { nonce: 'r4nd0m' } }).body;

		expect(body).toContain('<script nonce="r4nd0m">!function(){');
	});

	it('escapes the nonce as an attribute value', () => {
		const body = render(SliderSsrHarness, { props: { nonce: 'a"b&c' } }).body;

		expect(body).toContain('<script nonce="a&quot;b&amp;c">!function(){');
	});

	it('has no nonce without a provider', () => {
		const body = render(SliderSsrHarness, { props: { provider: false } }).body;

		expect(body).toContain('<script>!function(){');
	});

	it('renders the script only in the last thumb', () => {
		const body = render(SliderSsrHarness, { props: { range: true } }).body;

		expect(body.match(/<script/g)).toHaveLength(1);
		expect(body.indexOf('<script')).toBeGreaterThan(body.indexOf('data-testid="thumb-1"'));
	});

	it('renders no script for center or edge-client-only alignment', () => {
		for (const thumbAlignment of ['center', 'edge-client-only'] as const) {
			const body = render(SliderSsrHarness, { props: { thumbAlignment } }).body;

			expect(body).not.toContain('<script');
		}
	});
});

const html = (body: string) => body.replace(/<!--.*?-->/g, '');
const rangeInputs = (body: string) =>
	[...html(body).matchAll(/<input[^>]*type="range"[^>]*>/g)].map(([tag]) => ({
		name: tag.match(/\sname="([^"]*)"/)?.[1],
		value: tag.match(/\svalue="([^"]*)"/)?.[1],
		tag
	}));
const indicatorStyle = (body: string) =>
	html(body)
		.match(/<div[^>]*data-testid="indicator"[^>]*>/)?.[0]
		.match(/style="([^"]*)"/)?.[1];

describe('Slider SSR in a remote form', () => {
	it('reads the string value of a range spread on the root', () => {
		const fields = kitFields({ volume: 40 });
		const body = render(RemoteControlHarness, {
			props: { fields, name: 'volume', control: 'range', spread: fields.volume.as('range') }
		}).body;
		expect(rangeInputs(body).map(({ name, value }) => [name, value])).toEqual([
			['n:volume/form', '40']
		]);
		expect(html(body)).toContain('aria-valuenow="40"');
	});

	it('starts a root spread at the default it carries while the field is empty', () => {
		const fields = kitFields({});
		const body = render(RemoteControlHarness, {
			props: { fields, name: 'volume', control: 'range', spread: fields.volume.as('range', 25) }
		}).body;
		expect(rangeInputs(body).map(({ value }) => value)).toEqual(['25']);
	});

	it('names and fills each thumb from its own spread', () => {
		const fields = kitFields({});
		const body = render(RemoteControlHarness, {
			props: {
				fields,
				name: 'price',
				control: 'range',
				props: { min: 0, max: 1000 },
				thumbs: [fields.price[0].as('range', 0), fields.price[1].as('range', 1000)]
			}
		}).body;
		expect(rangeInputs(body).map(({ name, value }) => [name, value])).toEqual([
			['n:price[0]/form', '0'],
			['n:price[1]/form', '1000']
		]);
	});

	it('echoes the values the form holds into thumb spreads and the indicator', () => {
		const fields = kitFields({ price: [200, 800] });
		const body = render(RemoteControlHarness, {
			props: {
				fields,
				name: 'price',
				control: 'range',
				props: { min: 0, max: 1000 },
				thumbs: [fields.price[0].as('range', 0), fields.price[1].as('range', 1000)]
			}
		}).body;
		expect(rangeInputs(body).map(({ value }) => value)).toEqual(['200', '800']);
		// The root reads the echo, so the indicator, rendered before the thumbs, matches them.
		expect(indicatorStyle(body)).toContain('inset-inline-start: 20%; width: 60%');
	});

	it('binds a bare thumb to the field, and the echo beats the default', () => {
		const fresh = render(RemoteControlHarness, {
			props: {
				fields: kitFields({}),
				name: 'volume',
				control: 'range',
				props: { defaultValue: 30 }
			}
		}).body;
		expect(rangeInputs(fresh).map(({ name, value }) => [name, value])).toEqual([
			['n:volume/form', '30']
		]);

		const echoed = render(RemoteControlHarness, {
			props: {
				fields: kitFields({ volume: 60 }),
				name: 'volume',
				control: 'range',
				props: { defaultValue: 30 }
			}
		}).body;
		expect(rangeInputs(echoed).map(({ value }) => value)).toEqual(['60']);
	});

	it('binds bare thumbs to one item each when the root value is an array', () => {
		const props = { defaultValue: [10, 90] };
		const thumbs = [undefined, undefined];
		const fresh = render(RemoteControlHarness, {
			props: { fields: kitFields({}), name: 'price', control: 'range', props, thumbs }
		}).body;
		expect(rangeInputs(fresh).map(({ name, value }) => [name, value])).toEqual([
			['n:price[0]/form', '10'],
			['n:price[1]/form', '90']
		]);

		const echoed = render(RemoteControlHarness, {
			props: {
				fields: kitFields({ price: [20, 70] }),
				name: 'price',
				control: 'range',
				props,
				thumbs
			}
		}).body;
		expect(rangeInputs(echoed).map(({ value }) => value)).toEqual(['20', '70']);
		expect(indicatorStyle(echoed)).toContain('inset-inline-start: 20%; width: 50%');
	});

	it('renders one input per name', () => {
		const body = html(
			render(RemoteControlHarness, {
				props: {
					fields: kitFields({}),
					name: 'price',
					control: 'range',
					props: { defaultValue: [10, 90] },
					thumbs: [undefined, undefined]
				}
			}).body
		);
		expect(body.match(/name="n:price\[0\]\/form"/g)).toHaveLength(1);
		expect(body.match(/name="n:price\[1\]\/form"/g)).toHaveLength(1);
	});

	it('sends native root props to every thumb input and class to the root', () => {
		const body = render(RemoteControlHarness, {
			props: {
				fields: kitFields({}),
				name: 'price',
				control: 'range',
				props: {
					defaultValue: [10, 90],
					required: true,
					form: 'outer',
					'data-native': 'yes',
					class: 'slider-root'
				},
				thumbs: [undefined, undefined]
			}
		}).body;
		const inputs = rangeInputs(body);
		expect(inputs).toHaveLength(2);
		for (const { tag } of inputs) {
			expect(tag).toMatch(/\srequired/);
			expect(tag).toContain('form="outer"');
			expect(tag).toContain('data-native="yes"');
			expect(tag).not.toContain('slider-root');
		}
		expect(html(body).match(/<div[^>]*role="group"[^>]*>/)?.[0]).toContain('class="slider-root"');
	});
});
