// Native SSR supplements; original ordinary component credit remains separate.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { Slider } from '../src/lib/slider/index.js';
import Fixture from './ssr/Slider.svelte';
it('SSR preserves the full source family, sorted/clamped frozen range, explicit indexes and serialization', () => {
  const values = Object.freeze([120, -5]);
  const { body } = render(Fixture, { props: { values } });
  expect(values).toEqual([120, -5]);
  expect(body).toContain('role="group"');
  expect((body.match(/type="range"/g) ?? []).length).toBe(2);
  expect(body).toContain('value="0"'); expect(body).toContain('value="100"');
  expect(body).toContain('data-index="0"'); expect(body).toContain('data-index="1"');
  expect(body).toContain('name="volume"'); expect(body).toContain('0 – 100');
  expect(body).toContain('id="ssr-slider-label"'); expect(body).not.toContain('<script');
});
it('edge SSR emits exactly one original prehydration body, with markers outside script and escaped nonce', () => {
  const { body } = render(Fixture, { props: { alignment: 'edge', nonce: 'a"<&>' } });
  expect((body.match(/<script\b/g) ?? []).length).toBe(1);
  expect(body).toContain('nonce="a&quot;&lt;&amp;&gt;"');
  const script = body.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
  expect(script).toContain('document.currentScript');
  expect(script).not.toContain('<!--');
  expect(body).toContain('data-base-ui-slider-control');
  expect(body).toContain('data-base-ui-slider-indicator');
});
it('edge-client-only SSR keeps edge business markup while omitting the parser script', () => {
  const { body } = render(Fixture, { props: { alignment: 'edge-client-only', vertical: true } });
  expect(body).not.toContain('<script'); expect(body).toContain('visibility:hidden');
  expect(body).toContain('aria-orientation="vertical"'); expect(body).toContain('writing-mode:vertical-lr');
});
it('every source part enforces the required Root context in SSR', () => {
  for (const Part of [Slider.Label, Slider.Control, Slider.Track, Slider.Thumb, Slider.Value, Slider.Indicator]) expect(() => render(Part).body).toThrow('SliderRootContext is missing');
});
