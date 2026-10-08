// Upstream renderToStaticMarkup of a defaultOpen dialog and popover at
// @base-ui/react 1.8.0 (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c)
// prints aria-expanded="false" and no aria-controls. The popup is not in that HTML.
import { readFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import PortalSsrHarness from '../../tests/PortalSsrHarness.svelte';

describe('open popup server trigger', () => {
	it('holds aria-controls and leaves aria-expanded false', () => {
		const body = render(PortalSsrHarness).body;

		expect(body).toContain('Open dialog');
		expect(body).toContain('Open popover');
		expect(body).not.toContain('DialogBody');
		expect(body).not.toContain('PopoverBody');
		expect(body).not.toContain('aria-controls');
		expect(body).not.toContain('aria-expanded="true"');
		expect(body).toContain('aria-expanded="false"');
	});
});

describe('Popover portal props', () => {
	it('names the portal state and types the render attachment', () => {
		const source = readFileSync(new URL('../popover/types.ts', import.meta.url), 'utf8');
		const start = source.indexOf('export interface PopoverPortalProps');
		const end = source.indexOf('export interface PopoverPositionerState');
		const block = source.slice(start, end);

		expect(block).toContain('PopoverPortalState');
		expect(block).toContain('Attachment<HTMLDivElement>');
		expect(block).toContain('RenderChildren');
		expect(block).not.toContain('Record<string, never>');
	});
});
