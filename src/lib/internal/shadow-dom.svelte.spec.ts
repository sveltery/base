import { describe, expect, it } from 'vitest';
import { activeElement, contains, getTarget } from './shadow-dom.js';

describe('shadow-dom', () => {
	it('returns the active element inside an open shadow root', () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		const inner = document.createElement('button');
		shadow.append(inner);
		document.body.append(host);
		inner.focus();
		expect(activeElement(document)).toBe(inner);
		host.remove();
	});

	it('treats a node inside a shadow root as contained by the host', () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		const inner = document.createElement('span');
		shadow.append(inner);
		document.body.append(host);
		expect(contains(host, inner)).toBe(true);
		expect(contains(host, document.body)).toBe(false);
		expect(contains(host, null)).toBe(false);
		host.remove();
	});

	it('falls back to target when the composed path is empty', () => {
		const button = document.createElement('button');
		document.body.append(button);
		let seen: Event | null = null;
		button.addEventListener('click', (event) => {
			seen = event;
			expect(getTarget(event)).toBe(button);
		});
		button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(seen).not.toBeNull();
		expect(getTarget(seen as Event)).toBe(button);
		button.remove();
	});
});
