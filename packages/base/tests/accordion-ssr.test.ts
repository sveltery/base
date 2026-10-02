// Assertions derived from Base UI v1.8.0 (MIT); parity/accordion/UPSTREAM_LICENSE.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import Fixture from './ssr/Accordion.svelte';

it('P:55 suppresses the initial keyframe animation from inline styles when rendered open', () => {
  const document = new JSDOM(render(Fixture, { props: { scenario: 'inline' } }).body).window.document;
  const panel = document.querySelector('[data-testid=panel]') as HTMLElement;
  expect(panel.style.animationName).toBe('none');
  expect(panel.style.animationDuration).toBe('100ms');
});
it('supplement: SSR open IDs associate Trigger and Panel without browser globals', () => {
  const document = new JSDOM(render(Fixture).body).window.document;
  const trigger = document.querySelector('button')!;
  const panel = document.querySelector('[data-testid=panel]')!;
  expect(trigger.id).toMatch(/^base-ui-/);
  expect(panel.id).toMatch(/^base-ui-/);
  expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
  expect(panel.getAttribute('role')).toBe('region');
  expect(trigger.getAttribute('type')).toBe('button');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(panel.hasAttribute('data-open')).toBe(true);
  expect(panel.hasAttribute('data-starting-style')).toBe(false);
});
it('supplement: SSR closed defaults omit Panel and its control association', () => {
  const document = new JSDOM(render(Fixture, { props: { scenario: 'closed' } }).body).window.document;
  const trigger = document.querySelector('button')!;
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.hasAttribute('aria-controls')).toBe(false);
  expect(document.querySelector('[data-testid=panel]')).toBe(null);
});
