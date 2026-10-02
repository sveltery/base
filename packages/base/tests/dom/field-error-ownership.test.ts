// Separate matched ownership supplements; no ordinary source declaration credit.
// Base UI v1.8.0 and react-dom 19.3.0 MIT provenance: parity/field-form/.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './FieldFormFixture.svelte';
import { createErrorOwnershipReference } from '../../../../apps/fixtures/src/lib/field-error-ownership-reference.js';
const cleanups: (() => unknown)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); vi.restoreAllMocks(); });
function rows(host: HTMLElement) {
  const identities = new WeakMap<Node, number>(); let next = 0;
  return () => [...host.querySelectorAll('li')].map(node => {
    if (!identities.has(node)) identities.set(node, ++next);
    return { text: node.textContent, identity: identities.get(node) };
  });
}
const sequences = {
  'repeated key changes': [['a','a'],['b','b'],['c','c'],['b','b'],['b','b']],
  'duplicate shrink and structural replacement': [['a','a','a'],['a','a'],['a'],['a','a']],
  'duplicate reorder': [['a','a','b'],['b','a','a'],['a','b','a'],['a','a','b']],
  'key reuse after replacement': [['a','a','b'],['c','c'],['a','a'],['b','a'],['a','b','a']],
  'distinct reorder': [['a','b','c'],['c','a','b'],['b','c','a'],['a','c','b']],
  'single message and new list': [['a','a'],['b','b'],['single'],['b','b']],
  'empty message and new list': [['a','a'],['b','b'],[],['b','b']],
};
for (const [name, sequence] of Object.entries(sequences)) it(`supplement native default error ownership matches the actual pin for ${name}`, async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {}); // React emits its expected duplicate-key warning.
  const nativeHost = document.createElement('div'), referenceHost = document.createElement('div'); document.body.append(nativeHost, referenceHost);
  const component = mount(Fixture, { target: nativeHost }); cleanups.push(() => unmount(component)); flushSync();
  const reference = createErrorOwnershipReference(referenceHost); cleanups.push(() => reference.unmount());
  const nativeRows = rows(nativeHost), referenceRows = rows(referenceHost);
  for (const messages of sequence) {
    await reference.update(messages);
    component.setErrors({ email: messages }); flushSync(); await tick(); flushSync();
    expect(nativeRows()).toEqual(referenceRows());
    if (messages.length === 1) expect(nativeHost.querySelector('#error')?.textContent).toBe(referenceHost.querySelector('#error')?.textContent);
  }
  component.update({ error: false }); flushSync(); expect(nativeHost.querySelector('#error')).toBeNull();
  component.update({ error: true }); flushSync(); await tick(); flushSync();
  const last = sequence.at(-1)!; expect([...nativeHost.querySelectorAll('li')].map(node => node.textContent)).toEqual(last.length > 1 ? last : []);
});
it('supplement custom error children and rendered hosts own their content and discard the default list lifetime', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const host = document.createElement('div'), referenceHost = document.createElement('div'); document.body.append(host, referenceHost);
  const reference = createErrorOwnershipReference(referenceHost); cleanups.push(() => reference.unmount());
  const component = mount(Fixture, { target: host }); cleanups.push(() => unmount(component)); flushSync();
  component.setErrors({ email: ['a','a'] }); flushSync(); component.setErrors({ email: ['b','b'] }); flushSync();
  for (const override of ['children','render','empty'] as const) {
    await reference.update(['b','b'], override);
    component.update({ errorOverride: override }); flushSync(); expect(host.querySelectorAll('li')).toHaveLength(0);
    expect(host.querySelector('#error')!.textContent).toBe(referenceHost.querySelector('#error')!.textContent);
    component.update({ errorOverride: 'default' }); flushSync(); await tick(); flushSync();
    expect([...host.querySelectorAll('li')].map(node => node.textContent)).toEqual(['b','b']);
  }
});
