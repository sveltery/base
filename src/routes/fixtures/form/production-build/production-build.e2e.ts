// The Field and Form development warnings stay out of a production build. Playwright's web server
// has just built the app, so this reads the client output it serves.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const client = '.svelte-kit/output/client/_app/immutable';
const warnings = [
	'contains an input for',
	'spread. It renders an input of type',
	'<Field.Error> must be placed within',
	'<Form.Error> must be placed within'
];

function readScripts(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return readScripts(path);
		return entry.name.endsWith('.js') ? [readFileSync(path, 'utf8')] : [];
	});
}

test('the production client carries the components and none of their development warnings', () => {
	const scripts = readScripts(client);
	expect(scripts.some((code) => code.includes('aria-describedby'))).toBe(true);
	for (const warning of warnings) {
		expect(
			scripts.filter((code) => code.includes(warning)),
			warning
		).toEqual([]);
	}
});
