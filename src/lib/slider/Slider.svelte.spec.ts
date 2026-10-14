// Assertions follow Base UI v1.8.0 packages/react/src/slider/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases from upstream commits e29ae4c31, 0b7b639d0 and 53e533a48 follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// describeConformance, ref, inputRef, and className callbacks are not ported.
import { cdp, page } from 'vitest/browser';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SliderFieldsetHarness from '../../tests/SliderFieldsetHarness.svelte';
import SliderHarness from '../../tests/SliderHarness.svelte';

function click(node: Element) {
	if (node instanceof HTMLElement) node.click();
}

function root() {
	return page.getByTestId('root').element();
}

function control() {
	return page.getByTestId('control').element();
}

function inputs() {
	return [...control().querySelectorAll('input[type="range"]')] as HTMLInputElement[];
}

function slider() {
	const [input] = inputs();
	if (!input) throw new Error('expected a slider input');
	return input;
}

function change(input: HTMLInputElement, value: string) {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

function inputOnly(input: HTMLInputElement, value: string) {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

function key(input: HTMLInputElement, keyName: string, init: KeyboardEventInit = {}) {
	input.dispatchEvent(
		new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...init })
	);
}

function pointer(target: Element, type: string, clientX: number, init: PointerEventInit = {}) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			button: 0,
			buttons: type === 'pointerup' ? 0 : 1,
			clientX,
			clientY: 5,
			pointerId: 1,
			pointerType: 'mouse',
			...init
		})
	);
}

function touch(target: EventTarget, type: string, clientX: number, identifier = 1) {
	const point = new Touch({ identifier, target: document.body, clientX, clientY: 0 });
	target.dispatchEvent(
		new TouchEvent(type, {
			bubbles: true,
			cancelable: true,
			changedTouches: [point]
		})
	);
}

function mockControlRect(width = 100, height = 10) {
	vi.spyOn(control(), 'getBoundingClientRect').mockImplementation(
		() => new DOMRect(0, 0, width, height)
	);
}

async function valueNow(input: HTMLInputElement, expected: string) {
	await expect.poll(() => input.getAttribute('aria-valuenow')).toBe(expected);
}

describe('<Slider />', () => {
	it('warns when max is not greater than min', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(SliderHarness, { min: 10, max: 10, defaultValue: 10 });
		await expect
			.poll(() => warn.mock.calls.some((call) => String(call[0]).includes('max')))
			.toBe(true);
		expect(warn).toHaveBeenCalledWith('Base UI: Slider `max` must be greater than `min`.');
		warn.mockRestore();
	});

	it('throws when a part is rendered outside the root', async () => {
		await expect(async () => {
			render(SliderHarness, { scenario: 'orphan' });
		}).rejects.toThrow(/SliderRootContext is missing/);
	});

	describe('ARIA', () => {
		it('exposes the slider input and the labelled group', async () => {
			render(SliderHarness, { defaultValue: 30, ariaLabelledBy: 'labelId' });
			const input = slider();
			expect(input.tagName).toBe('INPUT');
			await expect.element(page.getByTestId('root')).toHaveAttribute('role', 'group');
			await expect.element(page.getByTestId('root')).toHaveAttribute('aria-labelledby', 'labelId');
			expect(input).toHaveAttribute('aria-valuenow', '30');
			expect(input).toHaveAttribute('aria-orientation', 'horizontal');
			expect(input).toHaveAttribute('aria-labelledby', 'labelId');
			expect(input).toHaveAttribute('step', '1');
			expect(input).toHaveAttribute('min', '0');
			expect(input).toHaveAttribute('max', '100');
		});

		it('updates aria-valuenow from a change event and from the keyboard', async () => {
			render(SliderHarness, { defaultValue: 50 });
			const input = slider();
			input.focus();
			change(input, '51');
			await valueNow(input, '51');
			key(input, 'ArrowRight');
			await valueNow(input, '52');
		});

		it('sets the default range aria-valuetext', async () => {
			render(SliderHarness, { defaultValue: [44, 50], thumbCount: 2 });
			const [start, end] = inputs();
			expect(start).toHaveAttribute('aria-valuetext', '44 start range');
			expect(end).toHaveAttribute('aria-valuetext', '50 end range');
		});

		it('uses the formatted number when format is set', async () => {
			render(SliderHarness, {
				defaultValue: 30,
				format: { style: 'currency', currency: 'USD' }
			});
			expect(slider()).toHaveAttribute('aria-valuetext', '$30.00');
			expect(page.getByTestId('value').element().textContent).toBe('$30.00');
		});

		it('keeps the field label when an older slider label unmounts', async () => {
			render(SliderHarness, { scenario: 'labels', defaultValue: 30 });
			const slider = page.getByRole('slider');

			await page.getByRole('button', { name: 'Show field label' }).click();
			await expect.element(slider).toHaveAttribute('aria-labelledby', 'field-label');
			await page.getByRole('button', { name: 'Remove slider label' }).click();
			await expect.element(page.getByTestId('slider-label')).not.toBeInTheDocument();
			await expect.element(slider).toHaveAttribute('aria-labelledby', 'field-label');
		});

		it('links Slider.Label after the label id is registered', async () => {
			render(SliderHarness, { scenario: 'label', defaultValue: 30 });
			const label = page.getByTestId('label').element();
			expect(label.id).not.toBe('');
			expect(root().id).not.toBe('');
			await expect.element(page.getByRole('slider')).toHaveAttribute('aria-labelledby', label.id);
			expect(root().getAttribute('aria-labelledby')).toBe(label.id);
		});

		it('does not label the input when getAriaLabel is set', async () => {
			render(SliderHarness, {
				scenario: 'label',
				getAriaLabel: (index) => `Thumb ${index}`
			});
			const input = slider();
			expect(input).toHaveAttribute('aria-label', 'Thumb 0');
			expect(input.getAttribute('aria-labelledby')).toBeNull();
		});

		it('prefers getAriaValueText over aria-valuetext', async () => {
			render(SliderHarness, {
				defaultValue: 8,
				ariaValueText: 'plain',
				getAriaValueText: (formatted, value, index) => `${formatted}:${value}:${index}`
			});
			expect(slider()).toHaveAttribute('aria-valuetext', '8:8:0');
		});
	});

	describe('value', () => {
		it('renders a single value and a range with an en dash', async () => {
			render(SliderHarness, { defaultValue: 40 });
			expect(page.getByTestId('value').element().textContent).toBe('40');
		});

		it('renders a range', async () => {
			render(SliderHarness, { defaultValue: [40, 65], thumbCount: 2 });
			expect(page.getByTestId('value').element().textContent).toBe('40 \u2013 65');
			const output = page.getByTestId('value').element() as HTMLOutputElement;
			expect(output.getAttribute('for')).toBe(
				inputs()
					.map((input) => input.id)
					.join(' ')
			);
		});

		it('passes formatted values to the children snippet', async () => {
			render(SliderHarness, { defaultValue: [40, 65], thumbCount: 2, valueChildren: true });
			expect(page.getByTestId('value').element().textContent).toBe('40/65:40,65');
		});

		it('clamps an out-of-range initial value without throwing', async () => {
			render(SliderHarness, { defaultValue: [19, 41], min: 20, max: 40, thumbCount: 2 });
			const [start, end] = inputs();
			expect(start).toHaveAttribute('aria-valuenow', '20');
			expect(end).toHaveAttribute('aria-valuenow', '40');
		});

		it('starts an empty bind from defaultValue and writes the key step into it', async () => {
			render(SliderHarness, { scenario: 'fresh' });
			await expect.element(page.getByTestId('bound')).toHaveTextContent('30');
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await expect.element(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '31');
			expect(page.getByTestId('bound').element().textContent).toBe('31');
		});

		it('shows min when the parent clears the value', async () => {
			render(SliderHarness, { scenario: 'clear' });
			await expect.element(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
			click(page.getByTestId('clear').element());
			await expect.element(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
		});

		it('clears form errors, marks dirty, and revalidates on a parent write', async () => {
			let seen: { value: unknown; form: unknown; input: string | null } | null = null;
			render(SliderHarness, {
				scenario: 'parent',
				defaultValue: 30,
				validate: (value, formValues) => {
					const input = document.querySelector('input[type="range"]');
					seen = {
						value,
						form: formValues.slider,
						input: input instanceof HTMLInputElement ? input.value : null
					};
					return 'nope';
				}
			});
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{"slider":"stale"}');
			expect(root().hasAttribute('data-dirty')).toBe(false);
			click(page.getByTestId('set').element());
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
			await expect.poll(() => root().hasAttribute('data-dirty')).toBe(true);
			await expect.element(page.getByTestId('error')).toHaveTextContent('nope');
			expect(seen).toEqual({ value: 70, form: 70, input: '70' });
		});

		it('keeps a bound value in sync and follows an external write', async () => {
			render(SliderHarness, { scenario: 'bound', defaultValue: 30 });
			expect(page.getByTestId('bound').element().textContent).toBe('30');
			key(slider(), 'ArrowRight');
			await expect.poll(() => page.getByTestId('bound').element().textContent).toBe('31');
			click(page.getByTestId('set').element());
			await expect.element(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '70');
		});
	});

	describe('keyboard', () => {
		it('steps, jumps by largeStep, and stops at the ends', async () => {
			const onValueChange = vi.fn();
			const onValueCommitted = vi.fn();
			render(SliderHarness, { defaultValue: 40, onValueChange, onValueCommitted });
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await valueNow(input, '41');
			expect(onValueChange.mock.lastCall?.[1].reason).toBe('keyboard');
			expect(onValueCommitted.mock.lastCall?.[1].reason).toBe('keyboard');
			key(input, 'ArrowLeft');
			await valueNow(input, '40');
			key(input, 'ArrowUp', { shiftKey: true });
			await valueNow(input, '50');
			key(input, 'PageDown');
			await valueNow(input, '40');
			key(input, 'Home');
			await valueNow(input, '0');
			key(input, 'End');
			await valueNow(input, '100');
			onValueChange.mockClear();
			onValueCommitted.mockClear();
			key(input, 'ArrowRight');
			expect(onValueChange).not.toHaveBeenCalled();
			expect(onValueCommitted).not.toHaveBeenCalled();
		});

		it('reverses the horizontal arrows in RTL', async () => {
			render(SliderHarness, { defaultValue: 40, dir: 'rtl' });
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await valueNow(input, '39');
			key(input, 'ArrowLeft');
			await valueNow(input, '40');
			key(input, 'ArrowUp');
			await valueNow(input, '41');
		});

		it('keeps ArrowUp increasing a vertical slider', async () => {
			render(SliderHarness, { defaultValue: 40, orientation: 'vertical' });
			const input = slider();
			expect(input).toHaveAttribute('aria-orientation', 'vertical');
			expect(root()).toHaveAttribute('data-orientation', 'vertical');
			input.focus();
			key(input, 'ArrowUp');
			await valueNow(input, '41');
			key(input, 'ArrowDown');
			await valueNow(input, '40');
		});

		it('uses min as the step origin and clamps to min and max', async () => {
			render(SliderHarness, { defaultValue: 5.5, min: 2, max: 8, step: 2 });
			const input = slider();
			expect(input).toHaveAttribute('min', '2');
			expect(input).toHaveAttribute('max', '8');
			input.focus();
			key(input, 'ArrowRight');
			await valueNow(input, '8');
			key(input, 'End');
			await valueNow(input, '8');
			key(input, 'Home');
			await valueNow(input, '2');
		});

		it('keeps range thumbs a minimum number of steps apart', async () => {
			render(SliderHarness, {
				defaultValue: [30, 40],
				thumbCount: 2,
				minStepsBetweenValues: 10
			});
			const [start, end] = inputs();
			start.focus();
			key(start, 'ArrowRight');
			await valueNow(start, '30');
			key(end, 'End');
			await valueNow(end, '100');
			key(start, 'Home');
			await valueNow(start, '0');
			end.focus();
			key(end, 'Home');
			await valueNow(end, '10');
		});

		it('does not commit a canceled change', async () => {
			const onValueCommitted = vi.fn();
			render(SliderHarness, {
				defaultValue: 40,
				onValueChange: (_value, details) => details.cancel(),
				onValueCommitted
			});
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await valueNow(input, '40');
			expect(onValueCommitted).not.toHaveBeenCalled();
		});

		it('lets preventDefault skip the value change and stops composite keys', async () => {
			const onBubble = vi.fn();
			render(SliderHarness, {
				scenario: 'bubble',
				defaultValue: 40,
				onBubble,
				onkeydown: (event) => {
					if (event.key === 'ArrowLeft') event.preventDefault();
				}
			});
			const input = slider();
			input.focus();
			key(input, 'ArrowLeft');
			await valueNow(input, '40');
			expect(onBubble).toHaveBeenCalledTimes(1);
			onBubble.mockClear();
			key(input, 'ArrowRight');
			await valueNow(input, '41');
			expect(onBubble).not.toHaveBeenCalled();
			key(input, 'PageUp');
			expect(onBubble).toHaveBeenCalledTimes(1);
		});

		it('moves the indicator with the value', async () => {
			render(SliderHarness, { defaultValue: 30 });
			const indicator = page.getByTestId('indicator').element() as HTMLElement;
			expect(indicator.style.insetInlineStart).toBe('0px');
			expect(indicator.style.width).toBe('30%');
			key(slider(), 'ArrowRight');
			await expect.poll(() => indicator.style.width).toBe('31%');
		});
	});

	describe('pointer', () => {
		it('changes the value when the track is pressed and commits on release', async () => {
			const onValueChange = vi.fn();
			const onValueCommitted = vi.fn();
			render(SliderHarness, { defaultValue: 50, onValueChange, onValueCommitted });
			mockControlRect();
			const node = control();
			pointer(node, 'pointerdown', 41);
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.lastCall?.[0]).toBe(41);
			expect(onValueChange.mock.lastCall?.[1].reason).toBe('track-press');
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(true);
			pointer(node, 'pointerup', 41);
			expect(onValueCommitted).toHaveBeenCalledTimes(1);
			expect(onValueCommitted.mock.lastCall?.[0]).toBe(41);
			expect(onValueCommitted.mock.lastCall?.[1].reason).toBe('track-press');
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
		});

		it('does not change the value when the press starts on the thumb', async () => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 50, onValueChange });
			mockControlRect();
			pointer(page.getByTestId('thumb').element(), 'pointerdown', 51);
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('ignores a right click', async () => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 50, onValueChange });
			mockControlRect();
			pointer(control(), 'pointerdown', 41, { button: 2, buttons: 2 });
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('does not drag a disabled thumb', async () => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 50, disabledThumbs: [0], onValueChange });
			mockControlRect();
			pointer(page.getByTestId('thumb').element(), 'pointerdown', 10);
			pointer(control(), 'pointerdown', 80);
			expect(onValueChange).not.toHaveBeenCalled();
			await valueNow(slider(), '50');
		});

		it('reads an RTL track from the right edge', async () => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 30, dir: 'rtl', onValueChange });
			const thumb = page.getByTestId('thumb').element() as HTMLElement;
			expect(thumb.style.insetInlineStart).toBe('30%');
			mockControlRect();
			touch(control(), 'touchstart', 20);
			touch(document.body, 'touchmove', 22);
			expect(onValueChange).toHaveBeenCalledTimes(2);
			expect(onValueChange.mock.calls[0][0]).toBe(80);
			expect(onValueChange.mock.calls[1][0]).toBe(78);
		});

		it('sets data-dragging only after the touch has moved enough', async () => {
			render(SliderHarness, { defaultValue: 90 });
			mockControlRect();
			const node = control();
			touch(node, 'touchstart', 20);
			touch(document.body, 'touchmove', 21);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
			touch(document.body, 'touchmove', 200);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
			touch(document.body, 'touchmove', 200);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(true);
			touch(document.body, 'touchend', 0);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
		});

		it('counts each move once on a second touch drag', async () => {
			render(SliderHarness, { defaultValue: 50 });
			mockControlRect();
			const node = control();
			touch(node, 'touchstart', 41);
			touch(document.body, 'touchend', 41);
			touch(node, 'touchstart', 41);
			touch(document.body, 'touchmove', 60);
			touch(document.body, 'touchmove', 70);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
			touch(document.body, 'touchmove', 80);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(true);
		});

		it('counts each move once when a touch drag starts before the last one ended', async () => {
			render(SliderHarness, { defaultValue: 50 });
			mockControlRect();
			const node = control();
			touch(node, 'touchstart', 41);
			touch(node, 'touchstart', 41);
			touch(document.body, 'touchmove', 60);
			touch(document.body, 'touchmove', 70);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
			touch(document.body, 'touchmove', 80);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(true);
		});

		it('updates from an input event without a change event', async () => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 30, onValueChange });
			const input = slider();
			inputOnly(input, '35');
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.lastCall?.[0]).toBe(35);
			await valueNow(input, '35');
		});

		it('reports input-change on the original input event', async () => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 30, name: 'volume', onValueChange });
			const input = slider();
			change(input, '35');
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.lastCall?.[0]).toBe(35);
			expect(onValueChange.mock.lastCall?.[1].reason).toBe('input-change');
			expect(onValueChange.mock.lastCall?.[1].activeThumbIndex).toBe(0);
			expect(onValueChange.mock.lastCall?.[1].event.target).toBe(input);
			expect(input.name).toBe('volume');
		});
	});

	describe('disabled', () => {
		it('marks every part and ignores keyboard input', async () => {
			render(SliderHarness, { defaultValue: 30, disabled: true });
			for (const name of ['root', 'value', 'control', 'track', 'indicator', 'thumb']) {
				expect(page.getByTestId(name).element()).toHaveAttribute('data-disabled', '');
			}
			expect(slider().disabled).toBe(true);
			key(slider(), 'ArrowRight');
			await valueNow(slider(), '30');
		});

		it('marks the Field filled, as a range input always has a value', async () => {
			render(SliderHarness, { scenario: 'field', defaultValue: 30 });
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-filled', '');
			await expect.element(page.getByTestId('root')).toHaveAttribute('data-filled', '');
		});

		it('receives disabled from Field', async () => {
			render(SliderHarness, { scenario: 'field', fieldDisabled: true, defaultValue: 30 });
			expect(root()).toHaveAttribute('data-disabled', '');
			expect(slider().disabled).toBe(true);
		});
	});

	describe('thumb', () => {
		it('numbers range thumbs and renders children beside the input', async () => {
			render(SliderHarness, { defaultValue: [20, 40], thumbCount: 2, knob: true });
			expect(page.getByTestId('thumb-0').element()).toHaveAttribute('data-index', '0');
			expect(page.getByTestId('thumb-1').element()).toHaveAttribute('data-index', '1');
			const thumb = page.getByTestId('thumb-0').element();
			expect(thumb.querySelector('[data-testid="knob"]')).not.toBeNull();
			expect(thumb.querySelector('input')).not.toBeNull();
		});

		it('does not put tabindex on the thumb and forwards it to the input', async () => {
			render(SliderHarness, { defaultValue: 30 });
			expect(page.getByTestId('thumb').element().hasAttribute('tabindex')).toBe(false);
		});

		it('stacks the most recently active range thumb', async () => {
			render(SliderHarness, { defaultValue: [20, 40], thumbCount: 2 });
			const first = page.getByTestId('thumb-0').element() as HTMLElement;
			const second = page.getByTestId('thumb-1').element() as HTMLElement;
			expect(first.style.zIndex).toBe('');
			expect(second.style.zIndex).toBe('');
			inputs()[1].focus();
			await expect.poll(() => second.style.zIndex).toBe('2');
			inputs()[1].blur();
			await expect.poll(() => second.style.zIndex).toBe('1');
			expect(first.style.zIndex).toBe('');
		});

		it('renders the prehydration script only for edge alignment on the last thumb', async () => {
			render(SliderHarness, { defaultValue: [20, 40], thumbCount: 2, thumbAlignment: 'edge' });
			expect(control().hasAttribute('data-base-ui-slider-control')).toBe(true);
			expect(page.getByTestId('thumb-0').element().querySelector('script')).toBeNull();
			expect(page.getByTestId('thumb-1').element().querySelector('script')).not.toBeNull();
		});

		it('omits the prehydration script for center and edge-client-only alignment', async () => {
			render(SliderHarness, { defaultValue: 20, thumbAlignment: 'edge-client-only' });
			expect(control().hasAttribute('data-base-ui-slider-control')).toBe(false);
			expect(page.getByTestId('thumb').element().querySelector('script')).toBeNull();
		});
	});

	describe('label', () => {
		it('focuses the single slider and leaves a range unfocused', async () => {
			render(SliderHarness, { scenario: 'label', defaultValue: 50 });
			click(page.getByTestId('label').element());
			expect(document.activeElement).toBe(slider());
		});

		it('focuses the field control instead of an unrelated range input', async () => {
			render(SliderHarness, { scenario: 'field-label', unrelated: true, defaultValue: 50 });
			click(page.getByTestId('label').element());
			const named = page.getByTestId('thumb').element().querySelector('input');
			expect(document.activeElement).toBe(named);
			expect(document.activeElement).not.toBe(
				control().querySelector('input[aria-label="Unrelated range"]')
			);
		});

		it('does nothing when there is no thumb', async () => {
			render(SliderHarness, { scenario: 'field-label', omitThumb: true });
			const before = document.activeElement;
			click(page.getByTestId('label').element());
			expect(document.activeElement).toBe(before);
		});
	});

	describe('form and field', () => {
		it('submits the clamped value and a range array', async () => {
			render(SliderHarness, { scenario: 'form', defaultValue: 5, min: 20, max: 40 });
			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('"slider":20');
			expect(page.getByTestId('submitted').element().textContent).toContain('"reason":"none"');
		});

		it('submits a range through onFormSubmit and through an external form', async () => {
			render(SliderHarness, {
				scenario: 'form',
				defaultValue: [25, 50],
				thumbCount: 2,
				name: 'ignored'
			});
			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('"slider":[25,50]');
		});

		it('sits in a Fieldset named by its legend, with a name on each thumb', async () => {
			render(SliderFieldsetHarness);

			await expect.element(page.getByTestId('fieldset')).toHaveAccessibleName('Scaling threshold');
			await expect
				.element(page.getByRole('slider', { name: 'Minimum threshold' }))
				.toHaveAttribute('aria-valuetext', '20% start range');
			await expect
				.element(page.getByRole('slider', { name: 'Maximum threshold' }))
				.toHaveAttribute('aria-valuetext', '80% end range');
			await expect.element(page.getByTestId('value')).toHaveTextContent('20% – 80%');

			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect
				.element(page.getByTestId('submitted'))
				.toHaveTextContent('{"scalingThreshold":[0.2,0.8]}');
		});

		it('submits the named input to an external form', async () => {
			render(SliderHarness, {
				scenario: 'external',
				name: 'slider',
				form: 'external-form',
				defaultValue: 25
			});
			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('["25"]');
		});

		it('uses the field name and tracks touched, dirty, and focused', async () => {
			render(SliderHarness, { scenario: 'field', fieldName: 'field-slider', defaultValue: 25 });
			const input = slider();
			expect(input).toHaveAttribute('name', 'field-slider');
			expect(root().hasAttribute('data-dirty')).toBe(false);
			expect(root().hasAttribute('data-touched')).toBe(false);
			input.focus();
			await expect.poll(() => root().hasAttribute('data-focused')).toBe(true);
			input.blur();
			await expect.poll(() => root().hasAttribute('data-touched')).toBe(true);
			await expect.poll(() => root().hasAttribute('data-focused')).toBe(false);
			change(input, '50');
			await expect.poll(() => root().hasAttribute('data-dirty')).toBe(true);
			change(input, '25');
			await expect.poll(() => root().hasAttribute('data-dirty')).toBe(false);
		});

		it('clears a range dirty flag when the value returns to the initial array', async () => {
			render(SliderHarness, {
				scenario: 'field',
				defaultValue: [20, 40],
				thumbCount: 2
			});
			const end = inputs()[1];
			change(end, '50');
			await expect.poll(() => root().hasAttribute('data-dirty')).toBe(true);
			change(end, '40');
			await expect.poll(() => root().hasAttribute('data-dirty')).toBe(false);
		});

		it('clears an external form error when the value changes', async () => {
			render(SliderHarness, { scenario: 'form-errors', defaultValue: 25 });
			expect(page.getByTestId('errors').element().textContent).toContain('stale');
			change(slider(), '30');
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
		});

		it('validates on submit, then again on the next change', async () => {
			render(SliderHarness, {
				scenario: 'form',
				defaultValue: 99,
				validate: (value) => ((value as number) > 90 ? 'error' : null)
			});
			const input = slider();
			expect(input.hasAttribute('aria-invalid')).toBe(false);
			expect(document.querySelector('[data-testid="error"]')).toBeNull();
			change(input, '98');
			expect(input.hasAttribute('aria-invalid')).toBe(false);
			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect.element(page.getByTestId('error')).toHaveTextContent('error');
			await expect.poll(() => input.getAttribute('aria-invalid')).toBe('true');
			await expect.poll(() => root().hasAttribute('data-invalid')).toBe(true);
			await expect
				.poll(() => page.getByTestId('thumb').element().hasAttribute('data-invalid'))
				.toBe(true);
			change(input, '10');
			await expect.poll(() => input.hasAttribute('aria-invalid')).toBe(false);
			await expect.poll(() => root().hasAttribute('data-invalid')).toBe(false);
		});

		it('validates on blur and on change when those modes are set', async () => {
			render(SliderHarness, {
				scenario: 'field',
				validationMode: 'onBlur',
				defaultValue: 0,
				validate: (value) => ((value as number) > 1 ? 'error' : null)
			});
			const input = slider();
			change(input, '2');
			await expect.poll(() => input.hasAttribute('aria-invalid')).toBe(false);
			input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
			await expect.poll(() => input.getAttribute('aria-invalid')).toBe('true');
		});

		it('clears an on-blur error while the value changes to a valid one', async () => {
			render(SliderHarness, {
				scenario: 'field',
				validationMode: 'onBlur',
				defaultValue: 0,
				validate: (value) => ((value as number) > 1 ? 'error' : null)
			});
			const input = slider();
			change(input, '2');
			await expect.poll(() => input.hasAttribute('aria-invalid')).toBe(false);
			input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
			await expect.poll(() => input.getAttribute('aria-invalid')).toBe('true');
			change(input, '0');
			await expect.poll(() => input.hasAttribute('aria-invalid')).toBe(false);
		});

		it('submits the value after a change, not the registered snapshot', async () => {
			let seen: unknown;
			render(SliderHarness, {
				scenario: 'form',
				defaultValue: 10,
				validate: (value) => {
					seen = value;
					return (value as number) < 20 ? 'low' : null;
				}
			});
			const input = slider();
			change(input, '40');
			await expect.poll(() => input.getAttribute('aria-valuenow')).toBe('40');
			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('"slider":40');
			expect(seen).toBe(40);
		});

		it('validates on change', async () => {
			render(SliderHarness, {
				scenario: 'field',
				validationMode: 'onChange',
				defaultValue: 0,
				validate: (value) => (Number(value) === 1 ? 'error' : null)
			});
			change(slider(), '1');
			await expect.element(page.getByRole('slider')).toHaveAttribute('aria-invalid', 'true');
		});

		it('validates the stepped value after the thumb and registration update', async () => {
			let seen: { value: unknown; form: unknown; input: string | null } | null = null;
			render(SliderHarness, {
				scenario: 'field',
				fieldName: 'volume',
				validationMode: 'onChange',
				defaultValue: 30,
				validate: (value, formValues) => {
					const input = document.querySelector('input[type="range"]');
					seen = {
						value,
						form: formValues.volume,
						input: input instanceof HTMLInputElement ? input.value : null
					};
					return Number(value) === 31 ? null : 'stale';
				}
			});
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await expect.poll(() => input.getAttribute('aria-valuenow')).toBe('31');
			expect(seen).toEqual({ value: 31, form: 31, input: '31' });
			expect(input.hasAttribute('aria-invalid')).toBe(false);
		});
	});

	it('renders the root through a snippet', async () => {
		render(SliderHarness, { scenario: 'render', defaultValue: 12 });
		const node = root();
		expect(node).toHaveAttribute('data-custom', '');
		expect(node).toHaveAttribute('role', 'group');
		expect(slider()).toHaveAttribute('aria-valuenow', '12');
	});
	it('updates from a change event without an input event', async () => {
		render(SliderHarness, { defaultValue: 30 });
		const input = slider();
		expect(input).toHaveAttribute('aria-valuenow', '30');
		input.value = '40';
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await expect.poll(() => input.getAttribute('aria-valuenow')).toBe('40');
	});

	it('calls onValueChange and onValueCommitted outside effect tracking', async () => {
		render(SliderHarness, { scenario: 'tracking', defaultValue: 30 });
		change(slider(), '40');
		await expect
			.poll(() => page.getByTestId('change-tracking').element().textContent)
			.toBe('false');
		await expect
			.poll(() => page.getByTestId('commit-tracking').element().textContent)
			.toBe('false');

		mockControlRect();
		pointer(control(), 'pointerdown', 55);
		pointer(control(), 'pointerup', 55);
		await expect
			.poll(() => page.getByTestId('change-tracking').element().textContent)
			.toBe('false');
		await expect
			.poll(() => page.getByTestId('commit-tracking').element().textContent)
			.toBe('false');
	});
});

describe('single-element array value', () => {
	it('stays an array on track press', async () => {
		const onValueChange = vi.fn();
		const onValueCommitted = vi.fn();
		render(SliderHarness, { defaultValue: [25], onValueChange, onValueCommitted });
		mockControlRect();

		pointer(control(), 'pointerdown', 50);
		pointer(document.body, 'pointerup', 50);

		expect(onValueChange.mock.calls[0][0]).toEqual([50]);
		expect(onValueCommitted.mock.calls[0][0]).toEqual([50]);
	});

	it('stays an array when validated on blur', async () => {
		const validate = vi.fn(() => null);
		render(SliderHarness, {
			scenario: 'field',
			validationMode: 'onBlur',
			defaultValue: [25],
			validate
		});

		slider().dispatchEvent(new FocusEvent('blur', { bubbles: true }));

		await expect.poll(() => validate.mock.calls.length).toBe(1);
		expect(validate.mock.calls[0]).toEqual([[25], expect.anything()]);
	});
});

describe('touch and pen gestures', () => {
	it.each(['touch', 'pen'])('commits a %s track tap', async (pointerType) => {
		const onValueCommitted = vi.fn();
		render(SliderHarness, { defaultValue: 0, onValueCommitted });
		mockControlRect();

		// Browsers fire pointer events before the compatibility touch events, Apple Pencil too.
		pointer(control(), 'pointerdown', 50, { pointerType });
		touch(control(), 'touchstart', 50);
		pointer(control(), 'pointerup', 50, { pointerType });
		touch(document.body, 'touchend', 50);

		expect(onValueCommitted.mock.calls.map((call) => call[0])).toEqual([50]);
	});

	it('commits a real touch track tap', async () => {
		const onValueCommitted = vi.fn();
		const style = document.head.appendChild(document.createElement('style'));
		style.textContent = '[data-testid="control"] { width: 200px; height: 20px; }';
		onTestFinished(() => style.remove());
		render(SliderHarness, { defaultValue: 0, onValueCommitted });
		const rect = control().getBoundingClientRect();
		// The tester runs in a scaled iframe, and CDP takes top-level page coordinates.
		const frameRect = window.frameElement?.getBoundingClientRect() ?? new DOMRect();
		const scale = frameRect.width / window.innerWidth || 1;
		const touchPoints = [
			{
				x: frameRect.left + (rect.left + rect.width / 2) * scale,
				y: frameRect.top + (rect.top + rect.height / 2) * scale
			}
		];

		const session = cdp();
		await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints });
		await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

		await expect.poll(() => onValueCommitted.mock.calls.length).toBe(1);
		expect(onValueCommitted.mock.calls[0][0]).toBe(50);
	});

	it('keeps tracking a touch drag with touch listeners after the browser cancels the pointer', async () => {
		const onValueCommitted = vi.fn();
		render(SliderHarness, { defaultValue: 0, onValueCommitted });
		mockControlRect();

		pointer(control(), 'pointerdown', 50, { pointerType: 'touch' });
		touch(control(), 'touchstart', 50);
		// Without `touch-action: none`, the browser cancels the pointer once it starts panning.
		pointer(control(), 'pointercancel', 50, { pointerType: 'touch' });
		touch(document.body, 'touchmove', 70);
		touch(document.body, 'touchend', 70);

		expect(onValueCommitted.mock.calls.map((call) => call[0])).toEqual([70]);
	});

	it.each(['mouse', 'pen', 'touch'])(
		'handles a touch press normally after a cancelled %s gesture',
		async (pointerType) => {
			const onValueChange = vi.fn();
			const onValueCommitted = vi.fn();
			let preventPointerDown = false;
			render(SliderHarness, {
				defaultValue: 0,
				onValueChange,
				onValueCommitted,
				controlPointerDown: (event) => {
					if (preventPointerDown) event.preventDefault();
				}
			});
			mockControlRect();

			pointer(control(), 'pointerdown', 50, { pointerType });
			if (pointerType === 'touch') touch(control(), 'touchstart', 50);
			expect(onValueChange.mock.lastCall?.[0]).toBe(50);
			pointer(control(), 'pointercancel', 50, { pointerType });
			if (pointerType === 'touch') touch(document.body, 'touchcancel', 50);
			onValueCommitted.mockClear();

			// A prevented pointerdown leaves the press to the touch handler.
			preventPointerDown = true;
			pointer(control(), 'pointerdown', 30, { pointerType: 'touch', pointerId: 2 });
			touch(control(), 'touchstart', 30, 2);
			expect(onValueChange.mock.lastCall?.[0]).toBe(30);

			pointer(control(), 'pointerup', 30, { pointerType: 'touch', pointerId: 2 });
			touch(document.body, 'touchend', 30, 2);
			expect(onValueCommitted.mock.calls.map((call) => call[0])).toEqual([30]);
		}
	);

	it.each(['touch', 'pen'])(
		'does not change the value on a %s tap on the thumb',
		async (pointerType) => {
			const onValueChange = vi.fn();
			render(SliderHarness, { defaultValue: 100, step: 3, onValueChange });
			mockControlRect();
			const thumb = page.getByTestId('thumb').element();
			vi.spyOn(thumb, 'getBoundingClientRect').mockImplementation(() => new DOMRect(95, 0, 10, 10));

			pointer(thumb, 'pointerdown', 100, { pointerType });
			touch(thumb, 'touchstart', 100);
			pointer(thumb, 'pointerup', 100, { pointerType });
			touch(document.body, 'touchend', 100);

			expect(onValueChange).not.toHaveBeenCalled();
		}
	);
});

describe('cancelled gestures', () => {
	function setup() {
		const onValueChange = vi.fn();
		const onValueCommitted = vi.fn();
		const view = render(SliderHarness, { defaultValue: 20, onValueChange, onValueCommitted });
		mockControlRect();
		const committed = () =>
			onValueCommitted.mock.calls.map(([value, details]) => [value, details.reason]);
		return { view, onValueChange, committed };
	}

	it.each(['touchend', 'touchcancel'])(
		'ignores %s from another finger during a touch drag',
		async (type) => {
			const { onValueChange, committed } = setup();

			pointer(control(), 'pointerdown', 40, { pointerType: 'touch' });
			touch(control(), 'touchstart', 40);
			touch(document.body, 'touchmove', 70);
			touch(document.body, 'touchstart', 90, 2);
			touch(document.body, type, 90, 2);

			expect(committed()).toEqual([]);
			await expect.poll(() => control().hasAttribute('data-dragging')).toBe(true);

			touch(document.body, 'touchmove', 80);
			expect(onValueChange.mock.lastCall?.[0]).toBe(80);

			touch(document.body, 'touchcancel', 80);
			expect(committed()).toEqual([[80, 'drag']]);
			await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);
		}
	);

	it.each(['mouse', 'pen'])(
		'ends a cancelled %s drag after disabling and re-enabling during a touch drag',
		async (pointerType) => {
			const { view, onValueChange, committed } = setup();

			pointer(control(), 'pointerdown', 40, { pointerType: 'touch' });
			touch(control(), 'touchstart', 40);
			await view.rerender({ disabled: true });
			touch(document.body, 'touchcancel', 40);
			await view.rerender({ disabled: false });

			const init = { pointerType, pointerId: 7 };
			pointer(control(), 'pointerdown', 50, init);
			pointer(document.body, 'pointermove', 70, init);
			pointer(document.body, 'pointercancel', 70, init);

			expect(committed()).toEqual([[70, 'drag']]);
			await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);

			onValueChange.mockClear();
			pointer(document.body, 'pointermove', 90, init);
			pointer(document.body, 'pointerup', 90, init);
			expect(onValueChange).not.toHaveBeenCalled();
			expect(committed()).toHaveLength(1);
		}
	);

	it.each(['mouse', 'pen'])('commits and ends a %s drag on pointercancel', async (pointerType) => {
		const { onValueChange, committed } = setup();
		const init = { pointerType, pointerId: 7 };

		pointer(control(), 'pointerdown', 40, init);
		pointer(document.body, 'pointermove', 70, init);
		await expect.poll(() => control().hasAttribute('data-dragging')).toBe(true);

		pointer(document.body, 'pointercancel', 70, init);

		expect(committed()).toEqual([[70, 'drag']]);
		await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);

		onValueChange.mockClear();
		pointer(document.body, 'pointerdown', 90, init);
		pointer(document.body, 'pointermove', 90, init);
		pointer(document.body, 'pointerup', 90, init);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(committed()).toHaveLength(1);
	});

	it('keeps a touch drag going after pointercancel and ends it on touchcancel', async () => {
		const { onValueChange, committed } = setup();

		pointer(control(), 'pointerdown', 40, { pointerType: 'touch' });
		touch(control(), 'touchstart', 40);
		// Without `touch-action: none`, the browser cancels the pointer once it starts panning.
		pointer(document.body, 'pointercancel', 40, { pointerType: 'touch' });
		touch(document.body, 'touchmove', 70);
		expect(onValueChange.mock.lastCall?.[0]).toBe(70);

		touch(document.body, 'touchcancel', 70);
		expect(committed()).toEqual([[70, 'drag']]);
		await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);

		onValueChange.mockClear();
		pointer(document.body, 'pointerdown', 90, { pointerType: 'touch', pointerId: 2 });
		touch(document.body, 'touchstart', 90, 2);
		touch(document.body, 'touchmove', 90, 2);
		pointer(document.body, 'pointerup', 90, { pointerType: 'touch', pointerId: 2 });
		touch(document.body, 'touchend', 90, 2);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(committed()).toHaveLength(1);
	});
});
