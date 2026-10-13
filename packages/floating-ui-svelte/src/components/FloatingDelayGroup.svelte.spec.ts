// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingDelayGroup.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: "does not re-render unrelated consumers" counts React renders, and the Strict Mode
// wrapper of "resets the instant phase" replays effects, which Svelte does not. The instant-phase
// reset itself is kept as its own case.
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DelayGroupHarness from '../hooks/__tests__/DelayGroupHarness.svelte';
import { parkPointer } from '../hooks/__tests__/pointer.js';

function enter(label: string) {
	page.getByTestId(`reference-${label}`).element().dispatchEvent(new MouseEvent('mouseenter'));
}

function leave(label: string) {
	page.getByTestId(`reference-${label}`).element().dispatchEvent(new MouseEvent('mouseleave'));
}

function floating(label: string) {
	return document.querySelector(`[data-testid="floating-${label}"]`);
}

function advance(ms: number) {
	return vi.advanceTimersByTimeAsync(ms);
}

describe('FloatingDelayGroup', () => {
	beforeEach(async () => {
		await parkPointer();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('opens a neighbour instantly and closes the previous tooltip', async () => {
		render(DelayGroupHarness, { delay: { open: 1000, close: 200 } });

		enter('one');
		await advance(1);
		expect(floating('one')).toBeNull();
		await advance(999);
		expect(floating('one')).not.toBeNull();

		enter('two');
		await advance(1);
		expect(floating('one')).toBeNull();
		expect(floating('two')).not.toBeNull();

		enter('three');
		await advance(1);
		expect(floating('two')).toBeNull();
		expect(floating('three')).not.toBeNull();

		leave('three');
		await advance(1);
		expect(floating('three')).not.toBeNull();
		await advance(199);
		expect(floating('three')).toBeNull();
	});

	it('keeps grouping for timeoutMs after the last tooltip closed', async () => {
		render(DelayGroupHarness, { delay: { open: 1000, close: 100 }, timeoutMs: 500 });

		enter('one');
		await advance(1000);
		leave('one');
		expect(floating('one')).not.toBeNull();
		await advance(499);
		expect(floating('one')).toBeNull();

		enter('two');
		await advance(1);
		expect(floating('two')).not.toBeNull();

		enter('three');
		await advance(1);
		expect(floating('two')).toBeNull();
		expect(floating('three')).not.toBeNull();

		leave('three');
		await advance(1);
		expect(floating('three')).not.toBeNull();
		await advance(99);
		expect(floating('three')).toBeNull();
	});

	it('falls back to the full open delay once timeoutMs has passed', async () => {
		render(DelayGroupHarness, { delay: { open: 1000, close: 0 }, timeoutMs: 50 });

		enter('one');
		await advance(1000);
		expect(floating('one')).not.toBeNull();
		leave('one');
		await advance(1);
		expect(floating('one')).toBeNull();

		await advance(100);
		enter('two');
		await advance(999);
		expect(floating('two')).toBeNull();
		await advance(1);
		expect(floating('two')).not.toBeNull();
	});

	it('marks the incoming tooltip as in its instant phase until the group resets', async () => {
		render(DelayGroupHarness, { delay: { open: 1000, close: 0 }, timeoutMs: 50 });

		enter('one');
		await advance(1000);
		expect(page.getByTestId('reference-one').element().hasAttribute('data-instant-phase')).toBe(
			false
		);

		enter('two');
		await advance(1);
		const second = page.getByTestId('reference-two').element();
		expect(second.hasAttribute('data-instant-phase')).toBe(true);

		leave('two');
		await advance(50);
		expect(second.hasAttribute('data-instant-phase')).toBe(false);
	});

	it('keeps the active tooltip when an inactive one unmounts', async () => {
		const view = render(DelayGroupHarness, {
			delay: { open: 1000, close: 100 },
			timeoutMs: 500
		});

		enter('one');
		await advance(1000);
		expect(floating('one')).not.toBeNull();

		await view.rerender({ labels: ['one', 'three'] });
		expect(page.getByTestId('reference-two').elements()).toHaveLength(0);

		enter('three');
		await advance(1);
		expect(floating('one')).toBeNull();
		expect(floating('three')).not.toBeNull();
	});

	it('keeps the timeout running when the last closed tooltip unmounts', async () => {
		const view = render(DelayGroupHarness, {
			delay: { open: 1000, close: 100 },
			timeoutMs: 500
		});

		enter('one');
		await advance(1000);
		leave('one');
		await advance(100);
		expect(floating('one')).toBeNull();

		await view.rerender({ labels: ['two', 'three'] });
		expect(page.getByTestId('reference-one').elements()).toHaveLength(0);

		enter('two');
		await advance(1);
		expect(floating('two')).not.toBeNull();
	});

	it('applies a new group delay to the next tooltip', async () => {
		const view = render(DelayGroupHarness, { delay: { open: 1000, close: 0 } });
		await view.rerender({ delay: { open: 300, close: 0 } });

		enter('one');
		await advance(299);
		expect(floating('one')).toBeNull();
		await advance(1);
		expect(floating('one')).not.toBeNull();
	});

	it('reports no provider and a zero delay outside a group', async () => {
		render(DelayGroupHarness, { delay: { open: 1000, close: 0 }, grouped: false });

		expect(page.getByTestId('reference-one').element().dataset.hasProvider).toBe('false');

		enter('one');
		await advance(1);
		expect(floating('one')).not.toBeNull();
	});
});
