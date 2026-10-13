// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/utils/tabbable.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { afterEach, describe, expect, it } from 'vitest';
import { getTabbableNearElement, tabbable } from './tabbable.js';

afterEach(() => {
	document.body.replaceChildren();
});

describe('getTabbableNearElement', () => {
	it.each(['shadow', 'slot'] as const)(
		'finds adjacent controls around a non-tabbable anchor in a %s tree',
		(type) => {
			const before = document.createElement('button');
			const after = document.createElement('button');
			const host = document.createElement('div');
			const shadowRoot = host.attachShadow({ mode: 'open' });
			const anchor = document.createElement('button');
			anchor.tabIndex = -1;
			if (type === 'slot') {
				shadowRoot.appendChild(document.createElement('slot'));
				host.appendChild(anchor);
			} else {
				shadowRoot.appendChild(anchor);
			}
			document.body.append(before, host, after);

			expect(getTabbableNearElement(anchor, -1)).toBe(before);
			expect(getTabbableNearElement(anchor, 1)).toBe(after);
			expect(tabbable(document.body)).toEqual([before, after]);
			expect(anchor.tabIndex).toBe(-1);
		}
	);

	it('finds adjacent controls around a disabled anchor', () => {
		const before = document.createElement('button');
		const anchor = document.createElement('button');
		const after = document.createElement('button');
		anchor.disabled = true;
		document.body.append(before, anchor, after);

		expect(getTabbableNearElement(anchor, -1)).toBe(before);
		expect(getTabbableNearElement(anchor, 1)).toBe(after);
	});

	it('does not choose a destination when the anchor is absent from the composed tree', () => {
		document.body.appendChild(document.createElement('button'));
		const detachedAnchor = document.createElement('button');

		expect(getTabbableNearElement(detachedAnchor, -1)).toBe(null);
		expect(getTabbableNearElement(detachedAnchor, 1)).toBe(null);
	});

	it.each([
		[false, 1],
		[false, -1],
		[true, 1],
		[true, -1]
	] as const)(
		'does not let a disabled radio anchor suppress its peer when checked=%s and direction=%s',
		(checked, direction) => {
			const anchor = document.createElement('input');
			const peer = document.createElement('input');
			const other = document.createElement('button');
			anchor.type = 'radio';
			peer.type = 'radio';
			anchor.name = 'group';
			peer.name = 'group';
			anchor.disabled = true;
			anchor.checked = checked;
			document.body.append(...(direction === 1 ? [anchor, peer, other] : [other, peer, anchor]));

			expect(tabbable(document.body)).toEqual(direction === 1 ? [peer, other] : [other, peer]);
			expect(getTabbableNearElement(anchor, direction)).toBe(peer);
			expect(getTabbableNearElement(anchor, direction === 1 ? -1 : 1)).toBe(other);
		}
	);

	it('skips controls inside the excluded element and falls back to the anchor', () => {
		const anchor = document.createElement('button');
		const popup = document.createElement('div');
		popup.append(document.createElement('button'));
		document.body.append(anchor, popup);

		expect(getTabbableNearElement(anchor, 1, popup)).toBe(anchor);
	});
});
