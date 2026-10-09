import { describe, expect, it, vi } from 'vitest';
import { useButton } from './useButton.js';

function fakeEvent(type: string) {
	return {
		type,
		defaultPrevented: false,
		preventDefault() {
			this.defaultPrevented = true;
		}
	};
}

describe('useButton', () => {
	it('blocks a disabled click and leaves mousedown and keydown uncancelled', () => {
		const onclick = vi.fn();
		const onmousedown = vi.fn();
		const onpointerdown = vi.fn();
		const onkeydown = vi.fn();
		const onkeyup = vi.fn();
		const props = useButton(true, false, {
			onclick,
			onmousedown,
			onpointerdown,
			onkeydown,
			onkeyup
		}) as {
			onclick: (event: ReturnType<typeof fakeEvent>) => void;
			onmousedown: (event: ReturnType<typeof fakeEvent>) => void;
			onpointerdown: (event: ReturnType<typeof fakeEvent>) => void;
			onkeydown: (event: ReturnType<typeof fakeEvent>) => void;
			onkeyup: (event: ReturnType<typeof fakeEvent>) => void;
		};

		const click = fakeEvent('click');
		props.onclick(click);
		expect(click.defaultPrevented).toBe(true);
		expect(onclick).not.toHaveBeenCalled();

		const down = fakeEvent('mousedown');
		props.onmousedown(down);
		expect(down.defaultPrevented).toBe(false);
		expect(onmousedown).not.toHaveBeenCalled();

		const key = fakeEvent('keydown');
		props.onkeydown(key);
		expect(key.defaultPrevented).toBe(false);
		expect(onkeydown).not.toHaveBeenCalled();

		const pointer = fakeEvent('pointerdown');
		props.onpointerdown(pointer);
		expect(pointer.defaultPrevented).toBe(true);
		expect(onpointerdown).not.toHaveBeenCalled();

		const up = fakeEvent('keyup');
		props.onkeyup(up);
		expect(onkeyup).not.toHaveBeenCalled();
	});

	it('runs the consumer click when the button is enabled', () => {
		const onclick = vi.fn();
		const props = useButton(false, false, { onclick }) as {
			onclick: (event: ReturnType<typeof fakeEvent>) => void;
		};
		props.onclick(fakeEvent('click'));
		expect(onclick).toHaveBeenCalledOnce();
	});
});
