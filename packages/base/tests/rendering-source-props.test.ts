// Supplemental exact-pin getter ownership regressions; no ordinary declaration credit.
import { expect, it, vi } from 'vitest';
import { mergeProps, mergePropsN } from '../src/lib/merge-props/index.js';
function resolveSources(sources?: UseRenderPropSources): UseRenderHostProps {
  return Array.isArray(sources)
    ? mergePropsN(sources)
    : mergeProps(
        undefined,
        sources as UseRenderHostProps | ((previous: UseRenderHostProps) => UseRenderHostProps),
      );
}
import type { HTMLProps } from '../src/lib/internals/types.js';
import type { UseRenderElementParameters } from '../src/lib/internals/useRenderElement.js';
type UseRenderHostProps = HTMLProps;
type UseRenderPropSources = NonNullable<UseRenderElementParameters<object>['props']>;
it('copies the first getter result while later getters own the mutable accumulator', () => {
  const first = { id: 'before' };
  const firstResult = resolveSources([() => first, { id: 'after' }]);
  expect(firstResult).not.toBe(first);
  expect(first.id).toBe('before');
  expect(firstResult.id).toBe('after');
  const later = { id: 'before' };
  expect(resolveSources([{}, () => later, { id: 'after' }])).toBe(later);
  expect(later.id).toBe('after');
});
it('preserves frozen later-getter assignment failures and no-write cases', () => {
  const frozen = Object.freeze({ id: 'before' });
  expect(resolveSources([() => frozen, { id: 'after' }]).id).toBe('after');
  expect(resolveSources([{}, () => frozen, {}])).toBe(frozen);
  expect(() => resolveSources([{}, () => frozen, { id: 'after' }])).toThrow(TypeError);
  const handler = vi.fn(),
    frozenHandler = Object.freeze({ onmousedown: handler });
  expect(() => resolveSources([{}, () => frozenHandler, { onmousedown: undefined }])).toThrow(
    TypeError,
  );
});
it('preserves getter-owned handler identity through later ordinary non-handler props', () => {
  const handler = vi.fn();
  expect(resolveSources([() => ({ onmousedown: handler }), { id: 'after' }]).onmousedown).toBe(
    handler,
  );
  expect(
    resolveSources([{}, () => ({ onmousedown: handler }), { onmousedown: undefined }]).onmousedown,
  ).toBe(handler);
});
it('initializes slot zero even when falsy, preserving later getter ownership and inherited keys', () => {
  for (const initial of [undefined, null, false, 0, '']) {
    const owned = { id: 'before' };
    const sources = [initial, () => owned, { id: 'after' }] as unknown as UseRenderPropSources;
    expect(resolveSources(sources)).toBe(owned);
    expect(owned.id).toBe('after');
    const frozen = Object.freeze({ id: 'before' });
    expect(() =>
      resolveSources([initial, () => frozen, { id: 'after' }] as unknown as UseRenderPropSources),
    ).toThrow(TypeError);
    expect(
      resolveSources([initial, Object.create({ 'data-inherited': 'yes' })] as UseRenderPropSources)[
        'data-inherited'
      ],
    ).toBe('yes');
  }
});
it('copies first literal empty classes and explicit undefined handler own keys', () => {
  const literal = { class: '', onmousedown: undefined };
  const result = resolveSources(literal);
  expect(result).not.toBe(literal);
  expect(result.class).toBe('');
  expect(Object.hasOwn(result, 'onmousedown')).toBe(true);
  expect(result.onmousedown).toBeUndefined();
  const later = resolveSources([{}, { onmousedown: undefined }]);
  expect(Object.hasOwn(later, 'onmousedown')).toBe(true);
});
it('shares the mutable first-getter input with empty-array results', () => {
  let first: UseRenderHostProps | undefined;
  try {
    resolveSources((previous) => {
      first = previous;
      previous['data-source-sticky'] = 'persist';
      return {};
    });
    const result = resolveSources((previous) => {
      expect(previous).toBe(first);
      return previous;
    });
    expect(result['data-source-sticky']).toBe('persist');
    expect(result).not.toBe(first);
    expect(resolveSources([])).toBe(first);
  } finally {
    if (first) delete first['data-source-sticky'];
  }
});
it('preserves source style object identity for one-sided merges and writes even unchanged styles', () => {
  const style = { color: 'red' };
  expect(resolveSources([{ style }, { style: undefined }]).style).toBe(style);
  expect(resolveSources([{}, { style }]).style).toBe(style);
  const frozen = Object.freeze({ style });
  expect(() => resolveSources([{}, () => frozen, { style: undefined }])).toThrow(TypeError);
});
