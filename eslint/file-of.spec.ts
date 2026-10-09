import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileOf, loadNamedFunction } from './effects.js';

function reported(relative: string) {
	return fileOf({ filename: path.resolve(relative) } as Parameters<typeof fileOf>[0]);
}

describe('fileOf', () => {
	it('resolves a missing reported path to the unique tracked file', () => {
		const resolved = reported('nested/layout-read-nested.fail.svelte');
		expect(resolved).toBe(path.resolve('eslint/fixtures/nested/layout-read-nested.fail.svelte'));
		expect(existsSync(resolved)).toBe(true);
		expect(loadNamedFunction(resolved, './layout-read-helper.js', 'measure')).not.toBeNull();
	});

	it('does not bind a missing path that only shares a basename', () => {
		const resolved = reported('layout-read-helper.js');
		expect(existsSync(resolved)).toBe(false);
		expect(resolved).not.toBe(path.resolve('eslint/fixtures/layout-read-helper.js'));
		expect(resolved).not.toBe(path.resolve('eslint/fixtures/nested/layout-read-helper.js'));
	});

	it('keeps a path that is already on disk', () => {
		const present = path.resolve('eslint/effects.js');
		expect(reported('eslint/effects.js')).toBe(present);
	});
});
