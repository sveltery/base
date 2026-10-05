// Supplemental native event consumer probes for the pinned shared event helper (MIT).
import { afterEach, expect, it } from 'vitest';
import {
  isClickLikeEvent,
  isMouseLikePointerType,
  isVirtualClick,
  isVirtualPointerEvent,
  stopEvent,
} from '../../src/lib/floating-ui/utils/event.js';
import { platform } from '../../src/lib/utils/platform/index.js';
afterEach(() => document.body.replaceChildren());
it('stops a cancelable native consumer key event before parent listeners and prevents its default', () => {
  const parent = document.createElement('div');
  const child = document.createElement('input');
  parent.append(child);
  document.body.append(parent);
  const seen: string[] = [];
  parent.addEventListener('keydown', () => seen.push('parent'));
  child.addEventListener('keydown', (event) => {
    seen.push('input');
    stopEvent(event);
  });
  const event = new KeyboardEvent('keydown', {
    key: 'ArrowRight',
    bubbles: true,
    cancelable: true,
  });
  expect(child.dispatchEvent(event)).toBe(false);
  expect(event.defaultPrevented).toBe(true);
  expect(seen).toEqual(['input']);
});
it('retains click-like event and strict mouse-like pointer classification', () => {
  for (const type of ['click', 'mousedown', 'keydown', 'keyup'])
    expect(isClickLikeEvent(new Event(type))).toBe(true);
  for (const type of ['pointerdown', 'touchend', 'focusin'])
    expect(isClickLikeEvent(new Event(type))).toBe(false);
  for (const type of ['mouse', 'pen']) {
    expect(isMouseLikePointerType(type)).toBe(true);
    expect(isMouseLikePointerType(type, true)).toBe(true);
  }
  for (const type of ['', undefined]) {
    expect(isMouseLikePointerType(type)).toBe(true);
    expect(isMouseLikePointerType(type, true)).toBe(false);
  }
  expect(isMouseLikePointerType('touch')).toBe(false);
});
it('recognizes keyboard click and preserves the original jsdom virtual-pointer exclusion', () => {
  expect(isVirtualClick(new MouseEvent('click', { detail: 0 }))).toBe(true);
  expect(isVirtualClick(new MouseEvent('click', { detail: 1 }))).toBe(false);
  expect(platform.env.jsdom).toBe(true);
  const event = new Event('pointerdown') as PointerEvent;
  Object.assign(event, { width: 0, height: 0, pressure: 0, detail: 0, pointerType: 'mouse' });
  expect(isVirtualPointerEvent(event)).toBe(false);
});
