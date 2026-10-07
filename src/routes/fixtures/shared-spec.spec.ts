import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const fixtures = fileURLToPath(new URL('.', import.meta.url));

function fixtureDirs(): string[] {
	return readdirSync(fixtures).filter((entry) => statSync(join(fixtures, entry)).isDirectory());
}

describe('fixture specs', () => {
	it('runs Svelte and React from the one e2e file in each fixture', () => {
		const missing: string[] = [];
		for (const dir of fixtureDirs()) {
			const specs = readdirSync(join(fixtures, dir)).filter((name) => name.endsWith('.e2e.ts'));
			if (specs.length !== 1) {
				missing.push(`${dir} has ${specs.length} e2e files`);
				continue;
			}
			const text = readFileSync(join(fixtures, dir, specs[0]), 'utf8');
			if (!text.includes("reference ? 'react' : 'svelte'")) {
				missing.push(`${dir}/${specs[0]} does not share one spec across both frameworks`);
			}
		}
		expect(missing).toEqual([]);
	});
});
