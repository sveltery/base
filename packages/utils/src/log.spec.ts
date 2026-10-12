import { afterEach, describe, expect, it, vi } from 'vitest';
import { error, resetLogged, warn } from './log.js';

afterEach(() => {
	resetLogged();
	vi.restoreAllMocks();
});

describe('log once', () => {
	it('prefixes, joins, and writes each warning once', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		warn('first', 'second');
		warn('first', 'second');
		expect(spy.mock.calls).toEqual([['Base UI: first second']]);
	});

	it('keeps errors apart from warnings with the same text', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		warn('same');
		error('same');
		error('same');
		expect(warnSpy.mock.calls).toEqual([['Base UI: same']]);
		expect(errorSpy.mock.calls).toEqual([['Base UI: same']]);
	});

	it('writes a message again after a reset', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		error('again');
		resetLogged();
		error('again');
		expect(spy.mock.calls).toEqual([['Base UI: again'], ['Base UI: again']]);
	});
});
