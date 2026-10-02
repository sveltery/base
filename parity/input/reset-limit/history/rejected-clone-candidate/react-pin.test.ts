// Actual Base UI React 1.8.0 fixture; supplementary native behavior, zero ordinary credit.
import { afterAll, expect, it } from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import { createElement as h } from '/workspace/base/apps/fixtures/node_modules/react/index.js';
import { createRoot } from '/workspace/base/apps/fixtures/node_modules/react-dom/client.js';
import { flushSync } from '/workspace/base/apps/fixtures/node_modules/react-dom/index.js';
import { Input } from '/workspace/base/apps/fixtures/node_modules/@base-ui/react/input/index.mjs';
import { writeFileSync } from 'node:fs';
const records: unknown[] = [];
afterAll(() => writeFileSync('/tmp/input-clone-reset-proof/react-pin-results.json', JSON.stringify(records, null, 2) + '\n'));
for (const controlled of [true, false]) for (const move of ['out', 'in', 'after']) for (const stop of [false, true, 'propagation']) for (const cancel of [false, true]) it(`pinned React Input ${controlled ? 'controlled' : 'uncontrolled'}/${move}/stop=${stop}/cancel=${cancel}`, () => {
  const target = document.createElement('section'); document.body.append(target); const root = createRoot(target); let input: HTMLInputElement; const callbacks: unknown[] = []; const phases: unknown[] = [];
  function onReset(event: { preventDefault(): void; nativeEvent: Event }) {
    phases.push({ phase: 'reset-before', value: input.value, form: input.form?.id, eventPhase: event.nativeEvent.eventPhase });
    if (move === 'out') input.setAttribute('form', 'react-second'); if (move === 'in') input.setAttribute('form', 'react-first');
    if (cancel) event.preventDefault(); if (stop === 'propagation') event.nativeEvent.stopPropagation(); else if (stop) event.nativeEvent.stopImmediatePropagation();
    phases.push({ phase: 'reset-after', value: input.value, form: input.form?.id });
  }
  function onChange(event: { currentTarget: HTMLInputElement }) {
    input = event.currentTarget; (target.querySelector('#react-first') as HTMLFormElement).reset();
    if (move === 'after') input.setAttribute('form', 'react-second');
    phases.push({ phase: 'consumer-return', value: input.value, form: input.form?.id });
  }
  const props = { form: move === 'in' ? 'react-second' : 'react-first', defaultValue: 'seed', ...(controlled ? { value: 'owner' } : {}), onChange, onValueChange: (value: string, details: { reason: string }) => callbacks.push({ value, reason: details.reason }) };
  try {
    flushSync(() => root.render(h('main', null, h('form', { id: 'react-first', onReset }), h('form', { id: 'react-second' }), h(Input, props))));
    input = target.querySelector('input')!; const initial = { value: input.value, defaultValue: input.defaultValue };
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'edit'); input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    const settled = { value: input.value, defaultValue: input.defaultValue, form: input.form?.id };
    records.push({ controlled, move, stop, cancel, initial, settled, callbacks, phases });
    expect(initial).toEqual({ value: controlled ? 'owner' : 'seed', defaultValue: controlled ? 'owner' : 'seed' });
    expect(input.value).toBe(controlled ? 'owner' : !cancel && move !== 'out' ? 'seed' : 'edit'); expect(callbacks).toHaveLength(1);
  } finally { flushSync(() => root.unmount()); target.remove(); }
});
