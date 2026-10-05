import { describe, expect, it, vi } from 'vitest';
import {
  compareItemEquality, defaultItemEquality, findItemIndex, isSelectedValueDirty,
  removeItem, selectedValueIncludes,
} from '../src/lib/internals/itemEquality.js';
import {
  flattenLeafItems, hasNullItemLabel, resolveMultipleLabels, resolveSelectedLabel,
  stringifyAsLabel, stringifyAsValue,
} from '../src/lib/internals/resolveValueLabel.js';
import type { Snippet } from 'svelte';

// Supplements cover Source branches beyond its two copied helper test files.
// They are not ordinary Select declarations or unchanged renderer assertions.
describe('item equality Source edge contracts', () => {
  it('bypasses the consumer comparer for either nullish side, including removal', () => {
    const comparer = vi.fn(() => true);
    expect(compareItemEquality(null, null, comparer)).toBe(true);
    expect(compareItemEquality(null, undefined, comparer)).toBe(false);
    expect(compareItemEquality(undefined, undefined, comparer)).toBe(true);
    expect(compareItemEquality('x', null, comparer)).toBe(false);
    expect(compareItemEquality(undefined, 'x', comparer)).toBe(false);
    expect(removeItem([null, undefined, 'x'], null, comparer)).toEqual([undefined, 'x']);
    expect(comparer).not.toHaveBeenCalled();
    expect(compareItemEquality('x', 'y', comparer)).toBe(true);
    expect(comparer).toHaveBeenCalledExactlyOnceWith('x', 'y');
  });

  it('retains scalar !== dirty checks and ordered comparer-based array checks', () => {
    const comparer = vi.fn((a: string, b: string) => a.toLowerCase() === b.toLowerCase());
    expect(isSelectedValueDirty('A', 'a', comparer)).toBe(true);
    expect(isSelectedValueDirty(NaN, NaN, comparer)).toBe(true);
    expect(isSelectedValueDirty(+0, -0, comparer)).toBe(false);
    expect(comparer).not.toHaveBeenCalled();
    expect(isSelectedValueDirty(['A', 'B'], ['a', 'b'], comparer)).toBe(false);
    expect(isSelectedValueDirty(['A', 'B'], ['b', 'a'], comparer)).toBe(true);
    expect(isSelectedValueDirty([null], [undefined], comparer)).toBe(true);
    expect(isSelectedValueDirty([+0], [-0], defaultItemEquality)).toBe(true);
  });

  it('skips holes and explicit undefined selections and removes every custom match', () => {
    expect(selectedValueIncludes(undefined, 'x', defaultItemEquality)).toBe(false);
    expect(selectedValueIncludes(null, 'x', defaultItemEquality)).toBe(false);
    expect(findItemIndex(null, 'x', defaultItemEquality)).toBe(-1);
    const values = new Array<string | undefined>(3);
    values[1] = undefined;
    values[2] = 'A';
    expect(selectedValueIncludes(values, undefined, defaultItemEquality)).toBe(false);
    expect(findItemIndex(values, undefined, defaultItemEquality)).toBe(-1);
    expect(removeItem(values, 'a', (a, b) => a.toLowerCase() === b?.toLowerCase())).toEqual([undefined]);
    expect(removeItem(['A', 'b', 'a', 'c'], 'a', (a, b) => a.toLowerCase() === b.toLowerCase())).toEqual(['b', 'c']);
  });
});

describe('value label Source edge contracts', () => {
  it('keeps flat identity, group order and inherited-null versus own-label distinction', () => {
    const flat = [{ value: 'a', label: 'A' }];
    expect(flattenLeafItems(flat)).toBe(flat);
    expect(flattenLeafItems([{ heading: 'first', items: flat }, { heading: 'second', items: [{ value: 'b', label: 'B' }] }])).toEqual([...flat, { value: 'b', label: 'B' }]);
    const inherited = Object.create({ null: 'Inherited none', a: 'Inherited A' }) as Record<string, string>;
    inherited.b = 'Own B';
    expect(hasNullItemLabel(inherited)).toBe(true);
    expect(resolveSelectedLabel(null, inherited)).toBe('');
    expect(resolveSelectedLabel('a', inherited)).toBe('a');
    expect(resolveSelectedLabel('b', inherited)).toBe('Own B');
    expect(hasNullItemLabel({ null: null })).toBe(true);
  });

  it('preserves callback priority, direct nullable resolution and nullish stringifier bypass', () => {
    const callback = vi.fn((_value: unknown): string => undefined as unknown as string);
    const value = { value: 'a', label: 'Explicit' };
    expect(resolveSelectedLabel(value, { a: 'Mapped' }, callback)).toBeUndefined();
    expect(stringifyAsLabel(value, callback)).toBe('');
    expect(stringifyAsValue(value, callback)).toBe('');
    expect(callback).toHaveBeenCalledTimes(3);
    callback.mockClear();
    expect(resolveSelectedLabel(null, { null: 'None' }, callback)).toBe('None');
    expect(stringifyAsLabel(null, callback)).toBe('');
    expect(stringifyAsValue(undefined, callback)).toBe('');
    expect(callback).not.toHaveBeenCalled();
    expect(resolveSelectedLabel(value, { a: 'Mapped' })).toBe('Explicit');
    expect(resolveSelectedLabel({ value: 'a' }, [{ value: 'a', label: 'Matched' }])).toBe('Matched');
  });

  it('keeps label/value serialization branches distinct and the primitive lookup unguarded', () => {
    expect(stringifyAsLabel({ value: null })).toBe('null');
    expect(stringifyAsValue({ value: null, label: 'None' })).toBe('');
    expect(stringifyAsValue({ value: 'a' })).toBe('{"value":"a"}');
    expect(stringifyAsLabel({ label: false, value: 'a' })).toBe('false');
    expect(() => resolveSelectedLabel('a', new Array(1))).toThrow(TypeError);
    expect(resolveSelectedLabel({ value: 'a' }, new Array(1))).toBe('a');
  });

  it('keeps multi-value separators, callback order and scalar/Snippet identity', () => {
    const snippet = (() => {}) as unknown as Snippet;
    const items = { markup: snippet, disabled: false, empty: null, zero: 0, big: 2n };
    expect(resolveMultipleLabels([], items)).toEqual([]);
    expect(resolveMultipleLabels(['markup', 'disabled', 'empty', 'zero', 'big'], items)).toEqual([snippet, ', ', false, ', ', 'empty', ', ', 0, ', ', 2n]);
    const calls: number[] = [];
    expect(resolveMultipleLabels([2, 1, 2], undefined, value => { calls.push(value); return String(value); })).toEqual(['2', ', ', '1', ', ', '2']);
    expect(calls).toEqual([2, 1, 2]);
  });
});
