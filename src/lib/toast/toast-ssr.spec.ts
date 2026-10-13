// The provider clears its timers from an effect, and effects do not run on the server, so
// a toast added during a server render must not schedule an auto-dismiss timer.
import { render } from 'svelte/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ToastSsrHarness from '../../tests/ToastSsrHarness.svelte';

describe('Toast SSR', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('omits a portaled viewport and schedules no timer', () => {
		const body = render(ToastSsrHarness).body;

		expect(body).not.toContain('role="region"');
		expect(body).not.toContain('data-base-ui-portal');
		expect(vi.getTimerCount()).toBe(0);
	});

	it('renders an inline viewport and schedules no timer', () => {
		const body = render(ToastSsrHarness, { props: { portal: false } }).body;

		expect(body).toContain(
			'<div tabindex="-1" role="region" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications">'
		);
		expect(vi.getTimerCount()).toBe(0);
	});
});
