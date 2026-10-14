import { afterEach, describe, expect, it, vi } from 'vitest';
import { enqueueFocus, focusQueuedBy } from './enqueueFocus.js';
import { enqueueFocus as enqueueListFocus } from './focusTarget.js';

function button() {
	const element = document.createElement('button');
	document.body.append(element);
	return element;
}

function frame() {
	return new Promise((resolve) => requestAnimationFrame(resolve));
}

afterEach(() => {
	document.body.replaceChildren();
});

describe('enqueueFocus', () => {
	it('focuses on the next frame by default', async () => {
		const element = button();
		enqueueFocus(element);
		expect(document.activeElement).toBe(document.body);
		await frame();
		expect(document.activeElement).toBe(element);
	});

	it('focuses at once with sync', () => {
		const element = button();
		enqueueFocus(element, { sync: true });
		expect(document.activeElement).toBe(element);
	});

	it('asks shouldFocus at once with sync and skips when it declines', () => {
		const element = button();
		const shouldFocus = vi.fn(() => false);
		enqueueFocus(element, { sync: true, shouldFocus });
		expect(shouldFocus).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(document.body);
	});

	it('lets a sync request supersede a queued one', async () => {
		const first = button();
		const second = button();
		enqueueFocus(first);
		enqueueFocus(second, { sync: true });
		await frame();
		await frame();
		expect(document.activeElement).toBe(second);
	});

	it('keeps a later request when an earlier cleanup runs', async () => {
		const first = button();
		const second = button();
		const cancelFirst = enqueueFocus(first);
		enqueueFocus(second);
		cancelFirst();
		await frame();
		expect(document.activeElement).toBe(second);
	});

	it('does not focus after the returned cleanup runs', async () => {
		const element = button();
		const cancel = enqueueFocus(element);
		cancel();
		await frame();
		await frame();
		expect(document.activeElement).toBe(document.body);
	});

	it('shares one slot between list navigation and the focus manager', async () => {
		const manager = button();
		const item = button();
		const queuedItem = button();
		const focused: string[] = [];
		manager.addEventListener('focus', () => focused.push('manager'));
		item.addEventListener('focus', () => focused.push('item'));
		queuedItem.addEventListener('focus', () => focused.push('queued item'));

		enqueueFocus(manager);
		enqueueListFocus(item, { sync: true });
		await frame();
		await frame();
		expect(focused).toEqual(['item']);

		enqueueListFocus(queuedItem);
		enqueueFocus(manager, { sync: true });
		await frame();
		await frame();
		expect(focused).toEqual(['item', 'manager']);
	});

	it('reports a queued focus for its owner until the frame runs or a request supersedes it', async () => {
		const owner = {};
		enqueueFocus(button(), { owner });
		expect(focusQueuedBy(owner)).toBe(true);
		await frame();
		expect(focusQueuedBy(owner)).toBe(false);

		enqueueFocus(button(), { owner });
		enqueueListFocus(button());
		expect(focusQueuedBy(owner)).toBe(false);

		const cancel = enqueueFocus(button(), { owner });
		cancel();
		expect(focusQueuedBy(owner)).toBe(false);
	});
});
