import { afterEach, describe, expect, it } from 'vitest';
import { dispatchClick } from './click.js';

const modifiers = { shiftKey: true, ctrlKey: false, altKey: false, metaKey: true };

function record(button: HTMLButtonElement) {
	const seen: Array<[number, string, boolean, boolean]> = [];
	button.addEventListener('click', (event) => {
		const pointer = event as PointerEvent;
		seen.push([pointer.detail, pointer.pointerType, pointer.shiftKey, pointer.metaKey]);
	});
	return seen;
}

describe('dispatchClick', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it('marks a keyboard click by default and a mouse gesture when asked', () => {
		const button = document.body.appendChild(document.createElement('button'));
		const seen = record(button);

		dispatchClick(button, modifiers);
		dispatchClick(button, modifiers, { detail: 1, pointerType: 'mouse' });

		expect(seen).toEqual([
			[0, '', true, true],
			[1, 'mouse', true, true]
		]);
	});
});
