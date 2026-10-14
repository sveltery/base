// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/utils/element.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { afterEach, expect, it } from 'vitest';
import { isInteractiveElement } from './element.js';

afterEach(() => {
	document.body.innerHTML = '';
});

it('finds an interactive ancestor across a shadow root', () => {
	const button = document.createElement('button');
	const host = document.createElement('span');
	button.append(host);
	const inner = document.createElement('b');
	host.attachShadow({ mode: 'open' }).append(inner);
	document.body.append(button);

	expect(isInteractiveElement(inner)).toBe(true);
	expect(isInteractiveElement(host.parentElement!.parentElement)).toBe(false);
});
