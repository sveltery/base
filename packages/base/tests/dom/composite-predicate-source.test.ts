// Actual immutable Base UI 1.8.0 helpers; supplemental identity evidence, zero ordinary credit.
// MIT: 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c, THIRD_PARTY_NOTICES.md.
import { expect, it } from 'vitest';
import { isHTMLElement } from '@floating-ui/utils/dom';
import { isNativeInput as original } from '../../../../apps/fixtures/node_modules/@base-ui/react/internals/composite/composite.js';
import { isNativeInput as native } from '../../src/lib/internals/composite/composite.js';

for (const [name, classify] of [
  ['Original', original],
  ['native', native],
] as const) {
  it(`${name}: genuine HTML input branches preserve current, foreign-window and windowless identity`, () => {
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const foreign = iframe.contentDocument;
    expect(foreign).not.toBeNull();
    if (!foreign) throw new Error('Missing genuine iframe document');
    const windowless = document.implementation.createHTMLDocument('identity');
    expect(windowless.defaultView).toBeNull();
    for (const owner of [document, foreign, windowless]) {
      const input = owner.createElement('input');
      const textarea = owner.createElement('textarea');
      expect(isHTMLElement(input)).toBe(true);
      expect(classify(input)).toBe(true);
      input.type = 'number';
      expect(input.selectionStart).toBeNull();
      expect(classify(input)).toBe(false);
      expect(classify(textarea)).toBe(true);
      expect(classify(owner.createElement('div'))).toBe(false);
    }
    iframe.remove();
  });
  it(`${name}: actual non-HTML EventTargets cannot enter text-input selection branches`, () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'TEXTAREA');
    expect(isHTMLElement(svg)).toBe(false);
    expect(classify(svg)).toBe(false);
    const target = new EventTarget();
    expect(classify(target)).toBe(false);
    // Deliberately adversarial shape on a real EventTarget, not a supported public failure claim.
    Object.defineProperties(target, {
      nodeType: { value: 1 },
      style: { value: {} },
      tagName: { value: 'INPUT' },
      selectionStart: { value: 0 },
    });
    expect(isHTMLElement(target)).toBe(false);
    expect(classify(target)).toBe(false);
    expect(classify(document)).toBe(false);
    expect(classify(window)).toBe(false);
  });
}
