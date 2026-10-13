import { afterEach, describe, expect, it } from 'vitest';
import { enqueueFocus } from './enqueueFocus.js';

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

	it('skips a sync focus that shouldFocus declines', () => {
		const element = button();
		enqueueFocus(element, { sync: true, shouldFocus: () => false });
		expect(document.activeElement).toBe(document.body);
	});

	it('does not focus after the returned cleanup runs', async () => {
		const element = button();
		const cancel = enqueueFocus(element);
		cancel();
		await frame();
		await frame();
		expect(document.activeElement).toBe(document.body);
	});
});
