import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/NativeTabbablesFixture.svelte';
import { tabbables } from '../../src/lib/overlay/focus.js';
const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); document.body.replaceChildren(); });
function fixture(markup: string) {
  const host = document.createElement('div'); host.innerHTML = markup; document.body.append(host);
  // JSDOM has no layout or editing state. These diagnostics model visible boxes;
  // trusted Chromium acceptance tests exercise the actual browser behavior.
  for (const element of host.querySelectorAll<HTMLElement>('*')) element.getClientRects = () => [{ width: 20, height: 20 }] as unknown as DOMRectList;
  return host;
}
it('reproduces Close followed by an open details summary wrapping Tab prematurely', async () => {
  const target = document.createElement('div'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario: 'summary-only' } }); cleanup.push(() => unmount(component));
  await tick(); document.querySelector<HTMLButtonElement>('button')!.click(); await tick();
  await new Promise(resolve => setTimeout(resolve, 60));
  const popup = document.querySelector<HTMLElement>('[role=dialog]')!;
  for (const element of popup.querySelectorAll<HTMLElement>('*')) element.getClientRects = () => [{ width: 20, height: 20 }] as unknown as DOMRectList;
  const close = document.getElementById('native-close')!; close.focus();
  const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); close.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(tabbables(popup).map(element => element.id)).toEqual(['native-close', 'native-summary']);
});
it('keeps only first direct summary, its closed descendants, and summaryless details', () => {
  const host = fixture('<details tabindex="0"><summary id="first"><button id="summary-child">Child</button></summary><summary id="second" tabindex="0">Second</summary><button id="hidden">Hidden</button><div><summary id="nested" tabindex="0">Nested</summary></div></details><summary id="orphan" tabindex="0">Orphan</summary><details id="implicit"></details>');
  expect(tabbables(host).map(element => element.id)).toEqual(['first', 'summary-child', 'implicit']);
  host.querySelector('details')!.open = true;
  expect(tabbables(host).map(element => element.id)).toEqual(['first', 'summary-child', 'hidden', 'implicit']);
});
it('includes embedded elements, controlled media and editable values with pinned negative-index normalization', () => {
  const host = fixture('<iframe id="frame"></iframe><object id="object"></object><embed id="embed" tabindex="0"><audio id="audio" controls></audio><video id="video" controls tabindex="-1"></video><audio id="uncontrolled"></audio><div id="empty" contenteditable=""></div><div id="true" contenteditable="true"></div><div id="plain" contenteditable="plaintext-only" tabindex="-1"></div><div id="false" contenteditable="false"></div><button id="negative" tabindex="-1">Negative</button><input id="hidden" type="hidden" tabindex="0">');
  for (const id of ['empty', 'true', 'plain']) Object.defineProperty(host.querySelector(`#${id}`), 'isContentEditable', { value: true });
  expect(tabbables(host).map(element => element.id)).toEqual(['frame', 'object', 'embed', 'audio', 'video', 'empty', 'true', 'plain']);
});
it('preserves composed details filtering through shadow roots, slots and radio root ownership', () => {
  const host = fixture('<div id="shadow"></div><input id="light-radio" type="radio" name="same" checked>');
  const shadowHost = host.querySelector('#shadow')!;
  const root = shadowHost.attachShadow({ mode: 'open' });
  root.innerHTML = '<details><summary id="shadow-summary"><slot></slot></summary><button id="closed-child">Hidden</button></details><input id="shadow-radio" type="radio" name="same" checked>';
  shadowHost.innerHTML = '<button id="slotted">Slotted</button><button slot="absent" id="unslotted">Unslotted</button>';
  for (const element of [...root.querySelectorAll<HTMLElement>('*'), ...shadowHost.querySelectorAll<HTMLElement>('*')]) element.getClientRects = () => [{ width: 20, height: 20 }] as unknown as DOMRectList;
  expect(tabbables(host).map(element => element.id)).toEqual(['shadow-summary', 'slotted', 'shadow-radio', 'light-radio']);
  root.querySelector('details')!.open = true;
  expect(tabbables(host).map(element => element.id)).toEqual(['shadow-summary', 'slotted', 'closed-child', 'shadow-radio', 'light-radio']);
  root.querySelector('summary')!.setAttribute('inert', '');
  expect(tabbables(host).map(element => element.id)).toEqual(['closed-child', 'shadow-radio', 'light-radio']);
});
