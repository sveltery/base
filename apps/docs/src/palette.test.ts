import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = fileURLToPath(new URL('.', import.meta.url));

const palette = new Set(
	[...readFileSync(`${src}/app.css`, 'utf8').matchAll(/--color-([a-z]+-\d+):/g)].map(
		([, color]) => color
	)
);

// Upstream's palette lacks red-600 too, so its copy of this demo renders the same.
const upstreamGaps = new Set(['red-600']);

const colorClass =
	/\b(?:bg|text|border(?:-[xytrblse])?|outline|ring(?:-offset)?|fill|stroke|from|via|to|divide|shadow|inset-shadow|decoration|accent|caret|placeholder)-([a-z]+-\d{2,3})\b/g;

function missingColors() {
	const missing: string[] = [];
	const files = globSync('**/*.{svelte,ts,md}', {
		cwd: src,
		exclude: ['**/*.test.ts'],
		withFileTypes: true
	}).filter((entry) => entry.isFile());
	for (const { parentPath, name } of files) {
		const file = `${parentPath}/${name}`;
		for (const [className, color] of readFileSync(file, 'utf8').matchAll(colorClass)) {
			if (!palette.has(color) && !upstreamGaps.has(color))
				missing.push(`${file.slice(src.length)}: ${className}`);
		}
	}
	return missing;
}

describe('palette', () => {
	it('defines every colour a Tailwind class names', () => {
		expect(missingColors()).toEqual([]);
	});
});
