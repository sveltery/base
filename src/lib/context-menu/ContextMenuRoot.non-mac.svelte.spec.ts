// Assertions follow Base UI v1.9.0
// packages/react/src/context-menu/root/ContextMenuRoot.non-mac.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Kept in its own file so the platform mock does not reach the other context menu specs.
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextMenuHarness from '../../tests/context-menu/ContextMenuHarness.svelte';
import { contextMenu, rightMouseUp } from '../../tests/context-menu/events.js';
import { mouse } from '../../tests/menu/mouse.js';
import type { ContextMenuRootChangeEventDetails } from './types.js';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: {
			...actual.platform,
			os: { ...actual.platform.os, mac: false, apple: false }
		}
	};
});

function byTestId(id: string) {
	return document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
}

describe('ContextMenu.Root (non-Mac)', () => {
	it('ignores the mouseup that ends the right click on non-Mac platforms', async () => {
		const calls: [boolean, string][] = [];
		render(ContextMenuHarness, {
			rootProps: {
				onOpenChange: (open: boolean, details: ContextMenuRootChangeEventDetails) => {
					calls.push([open, details.reason]);
				}
			},
			positionerProps: { alignOffset: 0 }
		});

		contextMenu(byTestId('trigger')!, { clientX: 12, clientY: 12 });
		await expect.poll(() => byTestId('popup')).not.toBeNull();

		mouse(document.body, 'pointermove', { clientX: 24, clientY: 24 });
		rightMouseUp(byTestId('item')!, { clientX: 24, clientY: 24 });
		await tick();

		expect(byTestId('popup')).not.toBeNull();
		expect(calls).toEqual([[true, 'trigger-press']]);
	});
});
