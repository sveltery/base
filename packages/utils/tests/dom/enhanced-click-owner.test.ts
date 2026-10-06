// Supplemental detached native owner witnesses; zero unchanged Original assertion credit.
import { expect, it } from 'vitest';
import {
  EnhancedClickHandler,
  useEnhancedClickHandler,
  type InteractionType,
} from '../../src/lib/useEnhancedClickHandler.js';

function pointerDown(pointerType: InteractionType) {
  const event = new MouseEvent('pointerdown', { cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  return event as PointerEvent;
}

it('keeps detached callbacks stable and ignores a prevented pointerdown', () => {
  const interactions: InteractionType[] = [];
  const owner = new EnhancedClickHandler((_event, type) => interactions.push(type));
  const { onclick, onpointerdown } = owner;
  expect(owner.onclick).toBe(onclick);
  expect(owner.onpointerdown).toBe(onpointerdown);
  const prevented = pointerDown('pen');
  prevented.preventDefault();
  onpointerdown(prevented);
  expect(interactions).toEqual([]);
  onclick(new MouseEvent('click', { detail: 1 }));
  expect(interactions).toEqual(['']);
});

it('preserves the pinned keyboard early-return pointer history and resets ordinary clicks', () => {
  const interactions: InteractionType[] = [];
  const { onclick, onpointerdown } = useEnhancedClickHandler((_event, type) =>
    interactions.push(type),
  );
  onpointerdown(pointerDown('touch'));
  onclick(new MouseEvent('click', { detail: 0 }));
  onclick(new MouseEvent('click', { detail: 1 }));
  onclick(new MouseEvent('click', { detail: 1 }));
  expect(interactions).toEqual(['touch', 'keyboard', 'touch', '']);
});

it('prefers click pointerType and isolates retained history between owners', () => {
  const first: InteractionType[] = [];
  const second: InteractionType[] = [];
  const a = useEnhancedClickHandler((_event, type) => first.push(type));
  const b = useEnhancedClickHandler((_event, type) => second.push(type));
  a.onpointerdown(pointerDown('touch'));
  b.onclick(new MouseEvent('click', { detail: 1 }));
  const click = new MouseEvent('click', { detail: 1 });
  Object.defineProperty(click, 'pointerType', { value: 'pen' });
  a.onclick(click);
  a.onclick(new MouseEvent('click', { detail: 1 }));
  expect(first).toEqual(['touch', 'pen', '']);
  expect(second).toEqual(['']);
});
