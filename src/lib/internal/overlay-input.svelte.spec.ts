import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OverlayHitAreaHarness from '../../tests/OverlayHitAreaHarness.svelte';
import { Checkbox } from '../checkbox/index.js';
import { Switch } from '../switch/index.js';

function control() {
	const element = page.getByLabelText('Control').element();
	if (!(element instanceof HTMLInputElement)) throw new Error('expected the control input');
	return element;
}

describe('overlay input', () => {
	for (const part of ['checkbox', 'switch', 'radio'] as const) {
		it(`${part} takes a click on the box under an ::after hit area`, async () => {
			render(OverlayHitAreaHarness, { part });
			const rect = control().getBoundingClientRect();
			const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
			expect(hit).toBe(control());
			await page.getByLabelText('Control').click();
			await expect.poll(() => control().checked).toBe(true);
		});

		it(`${part} takes a click on the hit area outside the box`, async () => {
			render(OverlayHitAreaHarness, { part });
			const box = control().parentElement;
			if (!box) throw new Error('expected the box');
			const rect = box.getBoundingClientRect();
			const hit = document.elementFromPoint(rect.x - 4, rect.y + rect.height / 2);
			expect(hit).toBe(box);
			(hit as HTMLElement).click();
			await expect.poll(() => control().checked).toBe(true);
		});
	}

	for (const [name, Root] of [
		['checkbox', Checkbox.Root],
		['switch', Switch.Root]
	] as const) {
		it(`${name} keeps a caller's aria-invalid outside an invalid Field`, async () => {
			render(Root, { 'aria-label': 'Control', 'aria-invalid': 'true' });
			expect(control().getAttribute('aria-invalid')).toBe('true');
		});
	}
});
