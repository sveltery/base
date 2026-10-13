// Assertions follow Base UI v1.9.0 packages/react/src/drawer/root/DrawerSnapPoints.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DrawerSnapPointsHarness from '../../tests/DrawerSnapPointsHarness.svelte';
import type { DrawerSnapPoint } from './index.js';

function readProbe() {
	return JSON.parse(
		document.querySelector('[data-testid="snap-point-probe"]')?.textContent || '{}'
	) as {
		resolvedSnapPoints: Array<{ value: DrawerSnapPoint; height: number; offset: number }>;
		activeSnapPointOffset: number | null;
	};
}

function popupOffset() {
	return document
		.querySelector<HTMLElement>('[data-testid="popup"]')!
		.style.getPropertyValue('--drawer-snap-point-offset');
}

describe('Drawer snap point composition', () => {
	it('resolves supported units, filters invalid values, clamps heights, and keeps the last duplicate', async () => {
		const previousFontSize = document.documentElement.style.fontSize;
		document.documentElement.style.fontSize = '20px';

		try {
			render(DrawerSnapPointsHarness, {
				snapPoints: [
					Number.NaN,
					'invalid',
					'invalidpx',
					'invalidrem',
					-1,
					'2rem',
					'100px',
					200,
					200.5,
					800
				],
				snapPoint: 200
			});

			await expect
				.poll(() => readProbe().resolvedSnapPoints)
				.toEqual([
					{ value: -1, height: 0, offset: 300 },
					{ value: '2rem', height: 40, offset: 260 },
					{ value: '100px', height: 100, offset: 200 },
					{ value: 200.5, height: 200.5, offset: 99.5 },
					{ value: 800, height: 300, offset: 0 }
				]);
			expect(readProbe().activeSnapPointOffset).toBe(99.5);
			await expect.poll(popupOffset).toBe('99.5px');
		} finally {
			document.documentElement.style.fontSize = previousFontSize;
		}
	});

	it('uses fractional and pixel snap points and resolves null or invalid active values as closed', async () => {
		const screen = render(DrawerSnapPointsHarness, {
			snapPoints: [0.5, 200, '2rem'],
			snapPoint: 200
		});

		await expect.poll(() => readProbe().activeSnapPointOffset).toBe(100);

		await screen.rerender({ snapPoints: [0.5, 200, '2rem'], snapPoint: null });
		await expect.poll(() => readProbe().activeSnapPointOffset).toBeNull();
		await expect.poll(popupOffset).toBe('0px');

		await screen.rerender({ snapPoints: [0.5, 200, '2rem'], snapPoint: 'invalid' });
		await expect.poll(() => readProbe().activeSnapPointOffset).toBeNull();
	});

	it('produces no resolved snap point when the list is empty', async () => {
		render(DrawerSnapPointsHarness, { snapPoints: [] });

		await expect.poll(() => readProbe().resolvedSnapPoints).toEqual([]);
		expect(readProbe().activeSnapPointOffset).toBeNull();
	});

	it('resolves a single snap point without a deduplication pass', async () => {
		render(DrawerSnapPointsHarness, { snapPoints: ['100px'], snapPoint: '100px' });

		await expect
			.poll(() => readProbe().resolvedSnapPoints)
			.toEqual([{ value: '100px', height: 100, offset: 200 }]);
		expect(readProbe().activeSnapPointOffset).toBe(200);
	});
});
