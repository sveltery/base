// Supplemental exact-pin getter ownership regressions; no ordinary declaration credit.
import { expect, it, vi } from 'vitest';
import { resolveSources } from '../src/lib/use-render/props.js';
it('copies the first getter result while later getters own the mutable accumulator', () => {
  const first = { id: 'before' };
  const firstResult = resolveSources([() => first, { id: 'after' }]);
  expect(firstResult).not.toBe(first); expect(first.id).toBe('before'); expect(firstResult.id).toBe('after');
  const later = { id: 'before' };
  expect(resolveSources([{}, () => later, { id: 'after' }])).toBe(later); expect(later.id).toBe('after');
});
it('preserves frozen later-getter assignment failures and no-write cases', () => {
  const frozen = Object.freeze({ id: 'before' });
  expect(resolveSources([() => frozen, { id: 'after' }]).id).toBe('after');
  expect(resolveSources([{}, () => frozen, {}])).toBe(frozen);
  expect(() => resolveSources([{}, () => frozen, { id: 'after' }])).toThrow(TypeError);
});
it('preserves getter-owned handler identity through later ordinary non-handler props', () => {
  const handler = vi.fn();
  expect(resolveSources([() => ({ onmousedown: handler }), { id: 'after' }]).onmousedown).toBe(handler);
  expect(resolveSources([{}, () => ({ onmousedown: handler }), { onmousedown: undefined }]).onmousedown).toBe(handler);
});
