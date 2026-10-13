import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PositionHarness from './__tests__/PositionHarness.svelte';

function coordinates(position: { data: { x: number; y: number; isPositioned: boolean } }) {
	const { x, y, isPositioned } = position.data;
	return { x, y, isPositioned };
}

describe('FloatingPosition', () => {
	it('keeps the last position while it measures a new reference', async () => {
		const { component } = render(PositionHarness);
		const { position } = component;
		await expect.poll(() => coordinates(position)).toEqual({ x: 100, y: 70, isPositioned: true });

		flushSync(() => component.show('b'));
		expect(coordinates(position)).toEqual({ x: 100, y: 70, isPositioned: true });

		await expect.poll(() => coordinates(position)).toEqual({ x: 300, y: 70, isPositioned: true });
	});

	it('resets the position when it closes', async () => {
		const { component } = render(PositionHarness);
		const { position } = component;
		await expect.poll(() => coordinates(position)).toEqual({ x: 100, y: 70, isPositioned: true });

		flushSync(() => component.show(null));
		expect(coordinates(position)).toEqual({ x: 0, y: 0, isPositioned: false });
	});
});
