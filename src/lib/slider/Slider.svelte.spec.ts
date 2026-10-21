// Assertions follow Base UI v1.8.0 packages/react/src/slider/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases from upstream commits e29ae4c31, 0b7b639d0 and 53e533a48 follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// describeConformance, ref, inputRef, and className callbacks are not ported.
import { cdp, page } from 'vitest/browser';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RemoteControlHarness from '../../tests/RemoteControlHarness.svelte';
import SliderFieldsetHarness from '../../tests/SliderFieldsetHarness.svelte';
import SliderHarness from '../../tests/SliderHarness.svelte';
import { kitFields } from '../../tests/kit-fields.js';

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

/** Lets the queued `input` and `change` events fire. */
function settle() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * A native `input` or `change` handler that records the slider's value at each event: the
 * thumb's number, or every thumb's for a range.
 */
function valueEvents() {
	const values: (number | number[])[] = [];
	const spy = vi.fn(() => {
		const all = inputs().map((input) => input.valueAsNumber);
		values.push(all.length === 1 ? all[0] : all);
	});
	return Object.assign(spy, {
		values,
		clear() {
			spy.mockClear();
			values.length = 0;
		}
	});
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
			const oninput = valueEvents();
			const onchange = valueEvents();
			render(SliderHarness, { defaultValue: 40, oninput, onchange });
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await valueNow(input, '41');
			await settle();
			expect(oninput.values).toEqual([41]);
			expect(onchange.values).toEqual([41]);
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
			oninput.clear();
			onchange.clear();
			key(input, 'ArrowRight');
			await settle();
			expect(oninput).not.toHaveBeenCalled();
			expect(onchange).not.toHaveBeenCalled();
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

		it('fires bubbling input and change events once the input holds the new value', async () => {
			const seen: string[] = [];
			const listen = (event: Event) => {
				if (event.target instanceof HTMLInputElement && event.target.type === 'range') {
					seen.push(`${event.type}:${event.target.value}`);
				}
			};
			document.addEventListener('input', listen);
			document.addEventListener('change', listen);
			onTestFinished(() => {
				document.removeEventListener('input', listen);
				document.removeEventListener('change', listen);
			});
			render(SliderHarness, { defaultValue: 40 });
			const input = slider();
			input.focus();
			key(input, 'ArrowRight');
			await valueNow(input, '41');
			await expect.poll(() => seen).toEqual(['input:41', 'change:41']);
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
			const oninput = valueEvents();
			const onchange = valueEvents();
			render(SliderHarness, { defaultValue: 50, oninput, onchange });
			mockControlRect();
			const node = control();
			pointer(node, 'pointerdown', 41);
			await settle();
			expect(oninput.values).toEqual([41]);
			expect(onchange).not.toHaveBeenCalled();
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(true);
			pointer(node, 'pointerup', 41);
			await settle();
			expect(onchange.values).toEqual([41]);
			await expect.poll(() => node.hasAttribute('data-dragging')).toBe(false);
		});

		it('does not change the value when the press starts on the thumb', async () => {
			const oninput = valueEvents();
			render(SliderHarness, { defaultValue: 50, oninput });
			mockControlRect();
			pointer(page.getByTestId('thumb').element(), 'pointerdown', 51);
			await settle();
			expect(oninput).not.toHaveBeenCalled();
		});

		it('ignores a right click', async () => {
			const oninput = valueEvents();
			render(SliderHarness, { defaultValue: 50, oninput });
			mockControlRect();
			pointer(control(), 'pointerdown', 41, { button: 2, buttons: 2 });
			await settle();
			expect(oninput).not.toHaveBeenCalled();
		});

		it('does not drag a disabled thumb', async () => {
			const oninput = valueEvents();
			render(SliderHarness, { defaultValue: 50, disabledThumbs: [0], oninput });
			mockControlRect();
			pointer(page.getByTestId('thumb').element(), 'pointerdown', 10);
			pointer(control(), 'pointerdown', 80);
			await settle();
			expect(oninput).not.toHaveBeenCalled();
			await valueNow(slider(), '50');
		});

		it('reads an RTL track from the right edge', async () => {
			const oninput = valueEvents();
			render(SliderHarness, { defaultValue: 30, dir: 'rtl', oninput });
			const thumb = page.getByTestId('thumb').element() as HTMLElement;
			expect(thumb.style.insetInlineStart).toBe('30%');
			mockControlRect();
			touch(control(), 'touchstart', 20);
			await settle();
			touch(document.body, 'touchmove', 22);
			await settle();
			expect(oninput.values).toEqual([80, 78]);
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
			const oninput = valueEvents();
			render(SliderHarness, { defaultValue: 30, oninput });
			const input = slider();
			inputOnly(input, '35');
			await valueNow(input, '35');
			await settle();
			expect(oninput.values).toEqual([35]);
		});

		it('passes an edit of the input itself through once, as the original event', async () => {
			const events: Event[] = [];
			render(SliderHarness, {
				defaultValue: 30,
				name: 'volume',
				oninput: (event) => events.push(event)
			});
			const input = slider();
			change(input, '35');
			await valueNow(input, '35');
			await settle();
			expect(events).toHaveLength(1);
			expect(events[0].target).toBe(input);
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

		it('marks the control for the prehydration script only for edge alignment', async () => {
			render(SliderHarness, { defaultValue: [20, 40], thumbCount: 2, thumbAlignment: 'edge' });
			expect(control().hasAttribute('data-base-ui-slider-control')).toBe(true);
		});

		it('leaves the control unmarked for edge-client-only alignment', async () => {
			render(SliderHarness, { defaultValue: 20, thumbAlignment: 'edge-client-only' });
			expect(control().hasAttribute('data-base-ui-slider-control')).toBe(false);
		});
	});

	describe('label', () => {
		it('focuses the single slider and leaves a range unfocused', async () => {
			render(SliderHarness, { scenario: 'label', defaultValue: 50 });
			click(page.getByTestId('label').element());
			expect(document.activeElement).toBe(slider());
		});

		it('focuses the slider on a double click, as useLabel does', async () => {
			render(SliderHarness, { scenario: 'label', defaultValue: 50 });
			const event = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 2 });
			page.getByTestId('label').element().dispatchEvent(event);
			expect([event.defaultPrevented, document.activeElement]).toEqual([true, slider()]);
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
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('"slider":"20"');
		});

		it('submits a range as one value per thumb', async () => {
			render(SliderHarness, {
				scenario: 'form',
				defaultValue: [25, 50],
				thumbCount: 2
			});
			click(page.getByRole('button', { name: 'Submit' }).element());
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('"slider":["25","50"]');
		});

		it("puts the slider's own name on every thumb input, over Field.Root's", async () => {
			render(SliderHarness, {
				scenario: 'form',
				defaultValue: [25, 50],
				thumbCount: 2,
				name: 'price'
			});
			expect(inputs().map((input) => input.name)).toEqual(['price', 'price']);
		});

		for (const rendered of [false, true]) {
			it(`${rendered ? 'renders as' : 'sits in'} a Fieldset named by its legend, with a name on each thumb`, async () => {
				render(SliderFieldsetHarness, { rendered });

				await expect
					.element(page.getByTestId('fieldset'))
					.toHaveAccessibleName('Scaling threshold');
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
					.toHaveTextContent('{"scalingThreshold":["0.2","0.8"]}');
			});
		}

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
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('"slider":"40"');
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
});

describe('single-element array value', () => {
	it('stays an array on track press', async () => {
		const oninput = valueEvents();
		const onchange = valueEvents();
		render(SliderHarness, { defaultValue: [25], oninput, onchange });
		mockControlRect();

		pointer(control(), 'pointerdown', 50);
		pointer(document.body, 'pointerup', 50);
		await settle();

		expect(oninput.values).toEqual([50]);
		expect(onchange.values).toEqual([50]);
		expect(page.getByTestId('value').element().textContent).toBe('50');
	});

	it('stays an array when validated on blur', async () => {
		const validate = vi.fn(() => null);
		render(SliderHarness, {
			scenario: 'field',
			validationMode: 'onBlur',
			defaultValue: [25],
			validate
		});
		// The constraint gate runs validate once at mount.
		await expect.poll(() => validate.mock.calls.length).toBe(1);

		slider().dispatchEvent(new FocusEvent('blur', { bubbles: true }));

		await expect.poll(() => validate.mock.calls.length).toBe(2);
		expect(validate.mock.calls[1]).toEqual([[25], expect.anything()]);
	});
});

describe('touch and pen gestures', () => {
	it.each(['touch', 'pen'])('commits a %s track tap', async (pointerType) => {
		const onchange = valueEvents();
		render(SliderHarness, { defaultValue: 0, onchange });
		mockControlRect();

		// Browsers fire pointer events before the compatibility touch events, Apple Pencil too.
		pointer(control(), 'pointerdown', 50, { pointerType });
		touch(control(), 'touchstart', 50);
		pointer(control(), 'pointerup', 50, { pointerType });
		touch(document.body, 'touchend', 50);
		await settle();

		expect(onchange.values).toEqual([50]);
	});

	it('commits a real touch track tap', async () => {
		const onchange = valueEvents();
		const style = document.head.appendChild(document.createElement('style'));
		style.textContent = '[data-testid="control"] { width: 200px; height: 20px; }';
		onTestFinished(() => style.remove());
		render(SliderHarness, { defaultValue: 0, onchange });
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

		await expect.poll(() => onchange.values).toEqual([50]);
	});

	it('keeps tracking a touch drag with touch listeners after the browser cancels the pointer', async () => {
		const onchange = valueEvents();
		render(SliderHarness, { defaultValue: 0, onchange });
		mockControlRect();

		pointer(control(), 'pointerdown', 50, { pointerType: 'touch' });
		touch(control(), 'touchstart', 50);
		// Without `touch-action: none`, the browser cancels the pointer once it starts panning.
		pointer(control(), 'pointercancel', 50, { pointerType: 'touch' });
		touch(document.body, 'touchmove', 70);
		touch(document.body, 'touchend', 70);
		await settle();

		expect(onchange.values).toEqual([70]);
	});

	it.each(['mouse', 'pen', 'touch'])(
		'handles a touch press normally after a cancelled %s gesture',
		async (pointerType) => {
			const oninput = valueEvents();
			const onchange = valueEvents();
			let preventPointerDown = false;
			render(SliderHarness, {
				defaultValue: 0,
				oninput,
				onchange,
				controlPointerDown: (event) => {
					if (preventPointerDown) event.preventDefault();
				}
			});
			mockControlRect();

			pointer(control(), 'pointerdown', 50, { pointerType });
			if (pointerType === 'touch') touch(control(), 'touchstart', 50);
			await settle();
			expect(oninput.values.at(-1)).toBe(50);
			pointer(control(), 'pointercancel', 50, { pointerType });
			if (pointerType === 'touch') touch(document.body, 'touchcancel', 50);
			await settle();
			onchange.clear();

			// A prevented pointerdown leaves the press to the touch handler.
			preventPointerDown = true;
			pointer(control(), 'pointerdown', 30, { pointerType: 'touch', pointerId: 2 });
			touch(control(), 'touchstart', 30, 2);
			await settle();
			expect(oninput.values.at(-1)).toBe(30);

			pointer(control(), 'pointerup', 30, { pointerType: 'touch', pointerId: 2 });
			touch(document.body, 'touchend', 30, 2);
			await settle();
			expect(onchange.values).toEqual([30]);
		}
	);

	it.each(['touch', 'pen'])(
		'does not change the value on a %s tap on the thumb',
		async (pointerType) => {
			const oninput = valueEvents();
			render(SliderHarness, { defaultValue: 100, step: 3, oninput });
			mockControlRect();
			const thumb = page.getByTestId('thumb').element();
			vi.spyOn(thumb, 'getBoundingClientRect').mockImplementation(() => new DOMRect(95, 0, 10, 10));

			pointer(thumb, 'pointerdown', 100, { pointerType });
			touch(thumb, 'touchstart', 100);
			pointer(thumb, 'pointerup', 100, { pointerType });
			touch(document.body, 'touchend', 100);
			await settle();

			expect(oninput).not.toHaveBeenCalled();
		}
	);
});

describe('cancelled gestures', () => {
	function setup() {
		const oninput = valueEvents();
		const onchange = valueEvents();
		const view = render(SliderHarness, { defaultValue: 20, oninput, onchange });
		mockControlRect();
		const committed = async () => {
			await settle();
			return onchange.values;
		};
		return { view, oninput, committed };
	}

	it.each(['touchend', 'touchcancel'])(
		'ignores %s from another finger during a touch drag',
		async (type) => {
			const { oninput, committed } = setup();

			pointer(control(), 'pointerdown', 40, { pointerType: 'touch' });
			touch(control(), 'touchstart', 40);
			touch(document.body, 'touchmove', 70);
			touch(document.body, 'touchstart', 90, 2);
			touch(document.body, type, 90, 2);

			expect(await committed()).toEqual([]);
			await expect.poll(() => control().hasAttribute('data-dragging')).toBe(true);

			touch(document.body, 'touchmove', 80);
			await settle();
			expect(oninput.values.at(-1)).toBe(80);

			touch(document.body, 'touchcancel', 80);
			expect(await committed()).toEqual([80]);
			await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);
		}
	);

	it.each(['mouse', 'pen'])(
		'ends a cancelled %s drag after disabling and re-enabling during a touch drag',
		async (pointerType) => {
			const { view, oninput, committed } = setup();

			pointer(control(), 'pointerdown', 40, { pointerType: 'touch' });
			touch(control(), 'touchstart', 40);
			await view.rerender({ disabled: true });
			touch(document.body, 'touchcancel', 40);
			await view.rerender({ disabled: false });

			const init = { pointerType, pointerId: 7 };
			pointer(control(), 'pointerdown', 50, init);
			pointer(document.body, 'pointermove', 70, init);
			pointer(document.body, 'pointercancel', 70, init);

			expect(await committed()).toEqual([70]);
			await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);

			oninput.clear();
			pointer(document.body, 'pointermove', 90, init);
			pointer(document.body, 'pointerup', 90, init);
			await settle();
			expect(oninput).not.toHaveBeenCalled();
			expect(await committed()).toHaveLength(1);
		}
	);

	it.each(['mouse', 'pen'])('commits and ends a %s drag on pointercancel', async (pointerType) => {
		const { oninput, committed } = setup();
		const init = { pointerType, pointerId: 7 };

		pointer(control(), 'pointerdown', 40, init);
		pointer(document.body, 'pointermove', 70, init);
		await expect.poll(() => control().hasAttribute('data-dragging')).toBe(true);

		pointer(document.body, 'pointercancel', 70, init);

		expect(await committed()).toEqual([70]);
		await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);

		oninput.clear();
		pointer(document.body, 'pointerdown', 90, init);
		pointer(document.body, 'pointermove', 90, init);
		pointer(document.body, 'pointerup', 90, init);
		await settle();
		expect(oninput).not.toHaveBeenCalled();
		expect(await committed()).toHaveLength(1);
	});

	it('keeps a touch drag going after pointercancel and ends it on touchcancel', async () => {
		const { oninput, committed } = setup();

		pointer(control(), 'pointerdown', 40, { pointerType: 'touch' });
		touch(control(), 'touchstart', 40);
		// Without `touch-action: none`, the browser cancels the pointer once it starts panning.
		pointer(document.body, 'pointercancel', 40, { pointerType: 'touch' });
		touch(document.body, 'touchmove', 70);
		await settle();
		expect(oninput.values.at(-1)).toBe(70);

		touch(document.body, 'touchcancel', 70);
		expect(await committed()).toEqual([70]);
		await expect.poll(() => control().hasAttribute('data-dragging')).toBe(false);

		oninput.clear();
		pointer(document.body, 'pointerdown', 90, { pointerType: 'touch', pointerId: 2 });
		touch(document.body, 'touchstart', 90, 2);
		touch(document.body, 'touchmove', 90, 2);
		pointer(document.body, 'pointerup', 90, { pointerType: 'touch', pointerId: 2 });
		touch(document.body, 'touchend', 90, 2);
		await settle();
		expect(oninput).not.toHaveBeenCalled();
		expect(await committed()).toHaveLength(1);
	});
});

describe('in a remote form', () => {
	function thumbInputs() {
		return [
			...page.getByTestId('slider').element().querySelectorAll('input[type="range"]')
		] as HTMLInputElement[];
	}

	it('moves to the string value of a root spread whenever the form changes it', async () => {
		const input = $state<Record<string, unknown>>({ volume: 40 });
		const fields = kitFields(input);
		render(RemoteControlHarness, {
			props: {
				fields,
				name: 'volume',
				control: 'range',
				spread: fields.volume.as('range')
			}
		});
		const [thumb] = thumbInputs();
		expect(thumb.name).toBe('n:volume/form');
		await valueNow(thumb, '40');

		thumb.focus();
		key(thumb, 'ArrowRight');
		await valueNow(thumb, '41');

		input.volume = 55;
		await valueNow(thumb, '55');
	});

	it('moves each thumb to its own spread and keeps edits between changes', async () => {
		const input = $state<Record<string, unknown>>({});
		const fields = kitFields(input);
		render(RemoteControlHarness, {
			props: {
				fields,
				name: 'price',
				control: 'range',
				props: { min: 0, max: 1000, step: 10 },
				thumbs: [fields.price[0].as('range', 0), fields.price[1].as('range', 1000)]
			}
		});
		const [start, end] = thumbInputs();
		expect([start.name, end.name]).toEqual(['n:price[0]/form', 'n:price[1]/form']);
		await valueNow(start, '0');
		await valueNow(end, '1000');

		start.focus();
		key(start, 'ArrowRight');
		await valueNow(start, '10');
		await valueNow(end, '1000');

		input.price = [200, 800];
		await valueNow(start, '200');
		await valueNow(end, '800');
		await expect.element(page.getByTestId('value')).toHaveTextContent('200 – 800');
	});

	it('binds bare thumbs to the items of the field, in render order', async () => {
		const input = $state<Record<string, unknown>>({});
		render(RemoteControlHarness, {
			props: {
				fields: kitFields(input),
				name: 'price',
				control: 'range',
				props: { defaultValue: [10, 90] },
				thumbs: [undefined, undefined]
			}
		});
		const [start, end] = thumbInputs();
		expect([start.name, end.name]).toEqual(['n:price[0]/form', 'n:price[1]/form']);
		await valueNow(start, '10');
		await valueNow(end, '90');

		input.price = [30, 60];
		await valueNow(start, '30');
		await valueNow(end, '60');
	});

	it('fires input on the moved thumb after its input holds the value, for a form listener', async () => {
		const read: string[] = [];
		const listen = (event: Event) => {
			if (event.target instanceof HTMLInputElement)
				read.push(`${event.target.name}=${event.target.value}`);
		};
		document.addEventListener('input', listen);
		onTestFinished(() => document.removeEventListener('input', listen));
		render(RemoteControlHarness, {
			props: {
				fields: kitFields({}),
				name: 'price',
				control: 'range',
				props: { defaultValue: [10, 90] },
				thumbs: [undefined, undefined]
			}
		});
		const [, end] = thumbInputs();
		end.focus();
		key(end, 'ArrowLeft');
		await expect.poll(() => read).toEqual(['n:price[1]/form=89']);
	});
});
