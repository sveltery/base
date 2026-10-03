// Native SSR supplements; source business predicates retained, zero ordinary credit until ledger review. MIT.
import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import Fixture from './ssr/Tabs.svelte';
import { script } from '../src/lib/tabs/indicator/prehydrationScript.min.js';
it('Tabs SSR uses the selected/default value and only mounts the active panel', () => {
  const doc = new JSDOM(render(Fixture).body).window.document;
  expect(doc.querySelectorAll('[role=tab]')).toHaveLength(2);
  expect(doc.querySelector('[aria-selected=true]')?.textContent).toBe('First');
  expect(doc.querySelectorAll('[role=tabpanel]')).toHaveLength(1);
  expect(doc.querySelector('[role=tabpanel]')?.textContent).toBe('First panel');
  expect(doc.querySelector('[role=tab]')?.getAttribute('type')).toBe('button');
});
it('Tabs SSR preserves explicit disabled selection and the source unknown-before-registration boundary', () => {
  const doc = new JSDOM(
    render(Fixture, { props: { scenario: 'disabled' } }).body,
  ).window.document;
  expect(doc.querySelector('[aria-selected=true]')?.textContent).toBe('First');
  expect(doc.querySelector('[role=tab]')?.getAttribute('aria-disabled')).toBe(
    'true',
  );
  expect(doc.querySelector('[role=tab]')?.getAttribute('aria-controls')).toBe(
    null,
  );
});
it('Tabs SSR null selection omits indicator/panels while keepMounted retains inert hidden content', () => {
  const empty = new JSDOM(render(Fixture, { props: { scenario: 'null' } }).body)
    .window.document;
  expect(
    empty.querySelectorAll(
      '[aria-selected=true],[role=presentation],[role=tabpanel]',
    ),
  ).toHaveLength(0);
  const kept = new JSDOM(render(Fixture, { props: { scenario: 'keep' } }).body)
    .window.document;
  const hidden = kept.querySelector('[role=tabpanel][hidden]');
  expect(hidden?.textContent).toBe('Second panel');
  expect(hidden?.hasAttribute('inert')).toBe(true);
});
it('Tabs SSR canonical wrapper emits exact immutable payload, escaped nonce and no markers inside the script', () => {
  const body = render(Fixture, {
    props: { scenario: 'script', nonce: 'a"&<>' },
  }).body;
  const doc = new JSDOM(body).window.document,
    scripts = doc.querySelectorAll('script');
  expect(scripts).toHaveLength(1);
  expect(scripts[0].textContent).toBe(script);
  expect(scripts[0].nonce).toBe('a"&<>');
  expect(scripts[0].previousElementSibling?.getAttribute('role')).toBe(
    'presentation',
  );
  expect(scripts[0].textContent).not.toContain('<!--');
});
