// Upstream Panel SSR declarations at 799 and 830; MIT: parity/collapsible/UPSTREAM_LICENSE.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import Fixture from './ssr/Collapsible.svelte';
it('P:799 suppresses the initial keyframe animation when rendered open', () => {
  const document = new JSDOM(render(Fixture, { props: { scenario: 'open' } }).body).window.document;
  expect((document.querySelector('[data-testid=panel]') as HTMLElement).style.animationName).toBe('none');
});
it('P:830 suppresses the initial keyframe animation from inline styles when rendered open', () => {
  const document = new JSDOM(render(Fixture, { props: { scenario: 'inline' } }).body).window.document;
  const panel = document.querySelector('[data-testid=panel]') as HTMLElement;
  expect(panel.style.animationName).toBe('none'); expect(panel.style.animationDuration).toBe('100ms');
});
it('supplement: SSR closed defaults omit Panel and preserve Trigger defaults', () => {
  const body = render(Fixture, { props: { scenario: 'closed' } }).body; const document = new JSDOM(body).window.document;
  const trigger = document.querySelector('button')!; expect(trigger.getAttribute('type')).toBe('button'); expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.hasAttribute('aria-controls')).toBe(false); expect(document.querySelector('[data-testid=panel]')).toBe(null);
});
it('supplement: SSR open generated IDs and initial state require no browser globals', () => {
  const body = render(Fixture, { props: { scenario: 'open' } }).body; const document = new JSDOM(body).window.document;
  const trigger = document.querySelector('button')!; const panel = document.querySelector('[data-testid=panel]')!;
  expect(panel.id).not.toBe(''); expect(trigger.getAttribute('aria-controls')).toBe(panel.id); expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(panel.hasAttribute('data-open')).toBe(true); expect(panel.hasAttribute('data-starting-style')).toBe(false);
});
