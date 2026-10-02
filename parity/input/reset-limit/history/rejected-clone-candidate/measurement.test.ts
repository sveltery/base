import { afterAll, expect, it } from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import { writeFileSync } from 'node:fs';
import { readNativeDirtyValue } from './readNativeDirtyValue.js';
import { cases } from './inputValues.js';
const records: unknown[] = [];
afterAll(() => writeFileSync('/tmp/input-clone-reset-proof/measurement-results.json', JSON.stringify(records, null, 2) + '\n'));
for (const [type, seed, edit] of cases) for (const collision of [false, true]) it(`detached native clone preserves dirty flag without live mutation (${type}/collision=${collision})`, async () => {
  const form = document.createElement('form'); const input = (type === 'textarea' ? document.createElement('textarea') : document.createElement('input')) as HTMLInputElement | HTMLTextAreaElement;
  if (type !== 'textarea') (input as HTMLInputElement).type = type; input.defaultValue = seed; form.append(input); document.body.append(form);
  const observer = new MutationObserver(() => {}); observer.observe(form, { subtree: true, attributes: true, childList: true, characterData: true });
  const snapshot = () => ({ value: input.value, defaultValue: input.defaultValue, type: input.type, html: input.outerHTML, parent: input.parentNode, form: input.form });
  const measure = () => { const before = snapshot(); const dirty = readNativeDirtyValue(input); expect(snapshot()).toEqual(before); expect(observer.takeRecords()).toEqual([]); return dirty; };
  try {
    const initial = measure(); input.value = collision ? seed : edit; const afterEdit = measure(); form.reset(); const afterReset = measure();
    input.value = seed; const sameValueAssignment = measure(); input.defaultValue = seed; observer.takeRecords(); const sameDefaultAssignment = measure();
    records.push({ type, collision, initial, afterEdit, afterReset, sameValueAssignment, sameDefaultAssignment });
    expect(initial).toBe(false); expect(afterEdit).toBe(true); expect(afterReset).toBe(false); expect(sameValueAssignment).toBe(true); expect(sameDefaultAssignment).toBe(true);
  } finally { observer.disconnect(); form.remove(); }
});
for (const type of ['hidden','button','submit','reset','image','checkbox','radio','file']) it(`non-value input mode is left unsupported (${type})`, () => {
  const input = document.createElement('input'); input.type = type; expect(readNativeDirtyValue(input)).toBeUndefined();
});
