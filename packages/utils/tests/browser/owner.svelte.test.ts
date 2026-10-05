// Supplemental real-browser realm witness for the exact pinned dependency reexport.
import { expect, it } from 'vitest';
import { getWindow } from '@floating-ui/utils/dom';
import { ownerDocument, ownerWindow } from '@sveltery/utils/owner';

it('reuses Floating getWindow and retains its Element, Document and null fallback', () => {
  const frame = document.createElement('iframe'); document.body.append(frame);
  try {
    const foreignDocument = frame.contentDocument!;
    const foreignElement = foreignDocument.createElement('div'); foreignDocument.body.append(foreignElement);
    expect(ownerWindow).toBe(getWindow);
    expect(ownerDocument(foreignElement)).toBe(foreignDocument);
    expect(ownerDocument(null)).toBe(document);
    expect(ownerWindow(foreignElement)).toBe(frame.contentWindow);
    expect(ownerWindow(foreignDocument)).toBe(window);
    expect(ownerWindow(null)).toBe(window);
  } finally { frame.remove(); }
});
