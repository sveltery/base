// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/root/NavigationMenuRoot.webkit.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuHarness from '../../tests/NavigationMenuHarness.svelte';
import NavigationMenuNestedHarness from '../../tests/NavigationMenuNestedHarness.svelte';
import { hoverOpen, mockBoundingClientRect } from '../../tests/navigationMenuEvents.js';
import { byId, dispatch, settlePositioning } from '../../tests/previewCardEvents.js';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: { ...actual.platform, engine: { ...actual.platform.engine, webkit: true } }
	};
});

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(async () => {
	vi.useRealTimers();
	await settlePositioning();
});

describe('NavigationMenu.Root (Safari)', () => {
	it('blocks top-level pointer events for hover-open menus', async () => {
		render(NavigationMenuHarness, { variant: 'single' });

		await hoverOpen(byId('trigger-1')!);

		expect(byId('popup-1')).not.toBeNull();
		expect(byId('list')!.style.pointerEvents).toBe('none');
		expect(document.body.style.pointerEvents).toBe('');
	});

	it('keeps nested safePolygon pointer events scoped on WebKit', async () => {
		render(NavigationMenuNestedHarness);

		await hoverOpen(byId('trigger-1')!);

		const nestedList = byId('inline-nested-list')!;
		const nestedTrigger1 = byId('nested-trigger-1')!;
		mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 });
		mockBoundingClientRect(byId('inline-nested-viewport')!, {
			x: 200,
			y: 0,
			width: 300,
			height: 300
		});
		dispatch(nestedTrigger1, 'mouseenter');

		expect(nestedList.style.pointerEvents).toBe('none');
		expect(document.body.style.pointerEvents).toBe('');
	});
});
