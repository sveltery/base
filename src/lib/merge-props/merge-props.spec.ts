import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { mergeProps } from '#lib';
import { mergePropsN } from '#lib/merge-props/index.js';
import type { BaseUIChangeEventDetails, CollapsibleRootChangeEventDetails } from '#lib';

describe('public merge-props entry', () => {
	it('merges a list of bags from the subpath', () => {
		const calls: string[] = [];
		const merged = mergePropsN<{ id: string; class: unknown; onclick: (event: Event) => void }>([
			{ id: 'a', class: 'left', onclick: () => calls.push('left') },
			null,
			{ id: 'b', class: 'right', onclick: () => calls.push('right') }
		]);
		merged.onclick(new Event('click', { cancelable: true }));
		expect([merged.id, merged.class, calls]).toEqual(['b', ['right', 'left'], ['right', 'left']]);
	});

	it('skips the left handler from the root entry when the right one calls preventDefault', () => {
		expectTypeOf<CollapsibleRootChangeEventDetails>().toExtend<BaseUIChangeEventDetails<string>>();
		const left = vi.fn();
		const merged = mergeProps(
			{ onclick: left },
			{ onclick: (event: Event) => event.preventDefault() }
		);
		const event = new Event('click', { cancelable: true });
		merged.onclick(event);
		expect([event.defaultPrevented, left.mock.calls.length]).toEqual([true, 0]);
	});

	it('skips the handlers left of one that calls preventDefault on a non-cancelable event', () => {
		const calls: string[] = [];
		const merged = mergeProps<{ oninput: (event: Event) => void }>(
			{ oninput: () => calls.push('left') },
			{
				oninput: (event: Event) => {
					calls.push('middle');
					event.preventDefault();
				}
			},
			{ oninput: () => calls.push('right') }
		);
		const event = new Event('input', { bubbles: true });
		merged.oninput(event);
		expect([event.defaultPrevented, calls]).toEqual([false, ['right', 'middle']]);
	});
});
