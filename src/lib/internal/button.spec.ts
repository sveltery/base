import { describe, expect, it, vi } from 'vitest';
import { ButtonBehavior, type ButtonOptions } from './button.svelte.js';

function fakeEvent(type: string) {
	return {
		type,
		defaultPrevented: false,
		preventDefault() {
			this.defaultPrevented = true;
		}
	};
}

function attributes(options: ButtonOptions) {
	const props: Record<string, unknown> = new ButtonBehavior(() => options).props({});
	const { type, role, tabindex, disabled } = props;
	return { type, role, tabindex, 'aria-disabled': props['aria-disabled'], disabled };
}

describe('ButtonBehavior', () => {
	it('maps native, focusable and composite options to host attributes', () => {
		expect(attributes({ disabled: true, native: true })).toEqual({
			type: 'button',
			role: undefined,
			tabindex: 0,
			'aria-disabled': undefined,
			disabled: true
		});
		expect(attributes({ disabled: true, native: true, focusableWhenDisabled: true })).toEqual({
			type: 'button',
			role: undefined,
			tabindex: 0,
			'aria-disabled': true,
			disabled: undefined
		});
		expect(attributes({ disabled: false, native: true, focusableWhenDisabled: true })).toEqual({
			type: 'button',
			role: undefined,
			tabindex: 0,
			'aria-disabled': false,
			disabled: undefined
		});
		expect(attributes({ disabled: true, native: false })).toEqual({
			type: undefined,
			role: 'button',
			tabindex: -1,
			'aria-disabled': true,
			disabled: undefined
		});
		expect(attributes({ disabled: true, native: true, composite: true })).toEqual({
			type: 'button',
			role: undefined,
			tabindex: undefined,
			'aria-disabled': true,
			disabled: true
		});
		expect(
			attributes({ disabled: true, native: true, composite: true, focusableWhenDisabled: false })
		).toEqual({
			type: 'button',
			role: undefined,
			tabindex: undefined,
			'aria-disabled': undefined,
			disabled: true
		});
		expect(
			attributes({ disabled: true, native: true, composite: true, focusableWhenDisabled: true })
		).toEqual({
			type: 'button',
			role: undefined,
			tabindex: undefined,
			'aria-disabled': true,
			disabled: undefined
		});
		expect(attributes({ disabled: true, native: false, composite: true })).toEqual({
			type: undefined,
			role: 'button',
			tabindex: undefined,
			'aria-disabled': true,
			disabled: undefined
		});
	});

	it('lets external props replace the button attributes', () => {
		const props = new ButtonBehavior(() => ({ disabled: false, native: false })).props({
			role: 'switch',
			tabindex: -1
		});
		expect([props.role, props.tabindex]).toEqual(['switch', -1]);
	});

	it('blocks a disabled click and leaves mousedown and keydown uncancelled', () => {
		const onclick = vi.fn();
		const onmousedown = vi.fn();
		const onpointerdown = vi.fn();
		const onkeydown = vi.fn();
		const onkeyup = vi.fn();
		const props = new ButtonBehavior(() => ({ disabled: true, native: false })).props({
			onclick,
			onmousedown,
			onpointerdown,
			onkeydown,
			onkeyup
		}) as unknown as Record<
			'onclick' | 'onmousedown' | 'onpointerdown' | 'onkeydown' | 'onkeyup',
			(event: ReturnType<typeof fakeEvent>) => void
		>;

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
		const props = new ButtonBehavior(() => ({ disabled: false, native: false })).props({
			onclick
		}) as unknown as { onclick: (event: ReturnType<typeof fakeEvent>) => void };
		const click = fakeEvent('click');
		props.onclick(click);
		expect(onclick.mock.calls).toEqual([[click]]);
	});
});
