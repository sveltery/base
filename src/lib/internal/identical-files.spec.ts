import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const lib = fileURLToPath(new URL('..', import.meta.url));

function filesUnder(directory: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(directory)) {
		const path = join(directory, entry);
		if (statSync(path).isDirectory()) {
			found.push(...filesUnder(path));
			continue;
		}
		if (path.includes('.spec.') || path.endsWith('.svelte.spec.ts')) continue;
		found.push(path);
	}
	return found;
}

describe('identical library files', () => {
	it('has no two source files with the same text', () => {
		const seen = new Map<string, string>();
		const duplicates: string[] = [];
		for (const path of filesUnder(lib)) {
			const text = readFileSync(path, 'utf8');
			const previous = seen.get(text);
			if (previous) duplicates.push(`${previous} == ${path}`);
			else seen.set(text, path);
		}
		expect(duplicates).toEqual([]);
	});
});
