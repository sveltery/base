import { describe, expect, it, vi } from 'vitest';
import { mergeProps } from './mergeProps.js';
import { useButton } from './useButton.js';

describe('useButton guardDisabled', () => {
	it('skips an earlier click handler without preventDefault', () => {
		const earlier = vi.fn();
		const props = mergeProps({ onclick: earlier }, useButton(true, false)) as unknown as {
			onclick: (event: Event) => void;
		};
		const event = new Event('click', { cancelable: true });
		props.onclick(event);
		expect(event.defaultPrevented).toBe(false);
		expect(event.baseUIHandlerPrevented).toBe(true);
		expect(earlier).not.toHaveBeenCalled();
	});
});
