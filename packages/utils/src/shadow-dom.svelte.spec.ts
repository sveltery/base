import { describe, expect, it } from 'vitest';
import { activeElement, closest, contains, getTarget } from './shadow-dom.js';

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

	it('treats a node in a descendant’s shadow root as contained', () => {
		const button = document.createElement('button');
		const host = document.createElement('span');
		button.append(host);
		const inner = document.createElement('b');
		host.attachShadow({ mode: 'open' }).append(inner);
		const sibling = document.createElement('div');
		document.body.append(button, sibling);
		expect(contains(button, inner)).toBe(true);
		expect(contains(document.body, inner)).toBe(true);
		expect(contains(sibling, inner)).toBe(false);
		button.remove();
		sibling.remove();
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
		if (!seen) throw new Error('click was not dispatched');
		expect(getTarget(seen)).toBe(button);
		button.remove();
	});

	it('finds the closest match across shadow roots and slots', () => {
		const outer = document.createElement('section');
		const host = document.createElement('div');
		const slotted = document.createElement('p');
		host.append(slotted);
		outer.append(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const wrapper = document.createElement('article');
		const slot = document.createElement('slot');
		const inner = document.createElement('span');
		wrapper.append(slot, inner);
		shadow.append(wrapper);
		document.body.append(outer);

		expect(closest(inner, 'section')).toBe(outer);
		expect(closest(inner, 'article')).toBe(wrapper);
		expect(closest(slotted, 'article')).toBe(wrapper);
		expect(closest(inner, 'span')).toBe(inner);
		expect(closest(inner, 'table')).toBeNull();
		expect(closest(null, 'section')).toBeNull();
		outer.remove();
	});
});
