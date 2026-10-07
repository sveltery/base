// Assertions follow the parent-toggle math in Base UI v1.8.0
// packages/react/src/checkbox-group/useCheckboxGroupParent.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { joinedControls, nextChildValue, nextParentSelection } from './parent.js';

const allValues = ['a', 'b', 'c'];

describe('nextParentSelection', () => {
	it('selects every enabled value from an empty snapshot, then clears', () => {
		const on = nextParentSelection({
			value: [],
			allValues,
			snapshot: [],
			status: 'mixed',
			isDisabled: () => false
		});
		expect(on).toEqual({ value: ['a', 'b', 'c'], status: undefined });

		const off = nextParentSelection({
			value: on.value,
			allValues,
			snapshot: [],
			status: 'mixed',
			isDisabled: () => false
		});
		expect(off).toEqual({ value: [], status: undefined });
	});

	it('cycles a partial snapshot through all, none, and the snapshot', () => {
		const shared = {
			allValues,
			snapshot: ['a'],
			isDisabled: () => false
		};
		expect(nextParentSelection({ ...shared, value: ['a'], status: 'mixed' })).toEqual({
			value: ['a', 'b', 'c'],
			status: 'on'
		});
		expect(nextParentSelection({ ...shared, value: ['a', 'b', 'c'], status: 'on' })).toEqual({
			value: [],
			status: 'off'
		});
		expect(nextParentSelection({ ...shared, value: [], status: 'off' })).toEqual({
			value: ['a'],
			status: 'mixed'
		});
	});

	it('leaves a disabled unchecked box out and keeps a disabled checked box', () => {
		const disabledA = (item: string) => item === 'a';
		expect(
			nextParentSelection({
				value: [],
				allValues,
				snapshot: [],
				status: 'mixed',
				isDisabled: disabledA
			}).value
		).toEqual(['b', 'c']);

		expect(
			nextParentSelection({
				value: ['a'],
				allValues,
				snapshot: ['a'],
				status: 'mixed',
				isDisabled: disabledA
			}).value
		).toEqual(['a', 'b', 'c']);
		expect(
			nextParentSelection({
				value: ['a', 'b', 'c'],
				allValues,
				snapshot: ['a'],
				status: 'on',
				isDisabled: disabledA
			}).value
		).toEqual(['a']);
	});
});

describe('nextChildValue', () => {
	it('appends a checked value and removes the first match', () => {
		expect(nextChildValue(['a'], 'b', true)).toEqual(['a', 'b']);
		expect(nextChildValue(['a', 'b', 'a'], 'a', false)).toEqual(['b', 'a']);
	});

	it('removes the last item when an uncheck names a missing value', () => {
		expect(nextChildValue(['a', 'b'], 'c', false)).toEqual(['a']);
	});
});

describe('joinedControls', () => {
	it('joins registered ids in allValues order and skips missing keys', () => {
		const registry = new Map<string, readonly string[]>([
			['b', ['b1', 'b2']],
			['a', ['a1']]
		]);
		expect(joinedControls(['a', 'b', 'constructor'], registry)).toBe('a1 b1 b2');
		expect(joinedControls(['missing'], registry)).toBeUndefined();
	});
});
