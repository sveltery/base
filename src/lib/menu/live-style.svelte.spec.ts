import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LiveStyleHarness from '../../tests/menu/LiveStyleHarness.svelte';

function styled() {
	return document.querySelector('[data-testid="styled"]') as HTMLElement;
}

describe('liveStyle', () => {
	it('sets its declarations again after the consumer style string changes', async () => {
		const view = render(LiveStyleHarness, {
			style: 'color: rgb(255, 0, 0)',
			own: { '--popup-width': '120px', transition: 'none' }
		});
		expect(styled().getAttribute('style')).toBe(
			'color: rgb(255, 0, 0); --popup-width: 120px; transition: none;'
		);
		await view.rerender({ style: 'color: rgb(0, 0, 255)' });
		expect(styled().getAttribute('style')).toBe(
			'color: rgb(0, 0, 255); --popup-width: 120px; transition: none;'
		);
	});

	it('removes a declaration it no longer sets', async () => {
		const view = render(LiveStyleHarness, {
			style: 'color: rgb(255, 0, 0)',
			own: { '--popup-width': '120px', transition: 'none' }
		});
		await view.rerender({ own: { '--popup-width': '80px' } });
		expect(styled().getAttribute('style')).toBe('color: rgb(255, 0, 0); --popup-width: 80px;');
	});
});
