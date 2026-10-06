// Exact pinned Original/native helper SSR guard supplement, zero ordinary assertion credit.
import { expect, it } from 'vitest';
import { isHTMLElement } from '@floating-ui/utils/dom';
import { isNativeInput as original } from '../../../apps/fixtures/node_modules/@base-ui/react/internals/composite/composite.js';
import { isNativeInput as native } from '../src/lib/internals/composite/composite.js';

for (const [name, classify] of [
  ['Original', original],
  ['native', native],
] as const) {
  it(`${name}: no-window canonical identity rejects real EventTargets without accessing globals`, () => {
    expect(typeof window).toBe('undefined');
    const target = new EventTarget();
    Object.defineProperties(target, {
      nodeType: { value: 1 },
      style: { value: {} },
      tagName: { value: 'TEXTAREA' },
    });
    expect(isHTMLElement(target)).toBe(false);
    expect(classify(target)).toBe(false);
  });
}
