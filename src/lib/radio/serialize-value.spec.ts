import { describe, expect, it } from 'vitest';
import { serializeValue } from './serialize-value.js';

describe('serializeValue', () => {
	it('turns null and undefined into an empty string', () => {
		expect(serializeValue(null)).toBe('');
		expect(serializeValue(undefined)).toBe('');
	});

	it('keeps strings', () => {
		expect(serializeValue('blue')).toBe('blue');
		expect(serializeValue('')).toBe('');
	});

	it('JSON-encodes numbers and objects', () => {
		expect(serializeValue(2)).toBe('2');
		expect(serializeValue({ id: 1 })).toBe('{"id":1}');
	});

	it('stringifies values that JSON cannot encode', () => {
		const cycle: { self?: unknown } = {};
		cycle.self = cycle;
		expect(serializeValue(cycle)).toBe('[object Object]');
	});
});
