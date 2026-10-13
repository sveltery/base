// Behavior follows Base UI v1.9.0 packages/react/src/utils/useOpenInteractionType.ts and
// packages/utils/src/useEnhancedClickHandler.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import ClickHarness from './__tests__/ClickHarness.svelte';

function pointerDown(pointerType: string, init: { cancelable?: boolean } = {}) {
	const event = new PointerEvent('pointerdown', { bubbles: true, pointerType, ...init });
	const trigger = page.getByTestId('trigger').element();
	flushSync(() => trigger.dispatchEvent(event));
	return event;
}

describe('ClickInteraction', () => {
	it('records how a closed trigger is pressed on pointerdown', () => {
		const { component } = render(ClickHarness);

		pointerDown('pen');

		expect(component.store.openMethod).toBe('pen');
	});

	it('keeps the open method of an open popup and ignores a prevented press', () => {
		const { component } = render(ClickHarness);
		const { store } = component;
		const trigger = page.getByTestId('trigger').element();
		trigger.addEventListener('pointerdown', (event) => event.preventDefault(), { capture: true });

		pointerDown('touch', { cancelable: true });
		expect(store.openMethod).toBe(null);

		store.openMethod = 'keyboard';
		flushSync(() => store.setOpen(true, createChangeEventDetails(REASONS.triggerPress)));
		pointerDown('mouse');
		expect(store.openMethod).toBe('keyboard');
	});
});
