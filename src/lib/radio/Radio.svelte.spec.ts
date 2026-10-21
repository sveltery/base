// Assertions follow Base UI v1.8.0
// packages/react/src/radio/root/RadioRoot.test.tsx and
// packages/react/src/radio/indicator/RadioIndicator.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases from upstream commit d8afb3717 follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// Sveltery: the radio is a real `<input type="radio">` over a painted box, so `checked`,
// `disabled` and `required` are the input's own, a radio without a group follows its own
// `checked`, and native events replace `onValueChange` (docs/upstream-differences.md).
// Field cases are in src/lib/field/choice-controls.svelte.spec.ts. Group cases below set the context Radio.Root already reads,
// without RadioGroup's roving tabindex. Arrow keys are covered by RadioGroup.
// Cases under "native Svelte" have no upstream counterpart.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ariaLabelPreferenceCases } from '../../tests/aria-label-preference-cases.js';
import RadioAttachHarness from '../../tests/RadioAttachHarness.svelte';
import RadioClickHarness from '../../tests/RadioClickHarness.svelte';
import PreventedHandlerHarness from '../../tests/PreventedHandlerHarness.svelte';
import RadioFormHarness from '../../tests/RadioFormHarness.svelte';
import RadioGroupHarness from '../../tests/RadioGroupHarness.svelte';
import RadioIndicatorHarness from '../../tests/RadioIndicatorHarness.svelte';
import RadioLabelHarness from '../../tests/RadioLabelHarness.svelte';
import RadioStyleHarness from '../../tests/RadioStyleHarness.svelte';
import { Radio } from './index.js';
import { AnimationFrame } from '@sveltery/utils';

const ENDING_CSS = `
	@keyframes radio-test-anim { to { opacity: 0; } }
	.animation-test-indicator[data-ending-style] { animation: radio-test-anim 40ms; }
`;

const HELD_ENDING_CSS = `
	@keyframes radio-test-anim { to { opacity: 0; } }
	.animation-test-indicator[data-ending-style] { animation: radio-test-anim 600s; }
`;

function radioEl(name?: string) {
	return name ? page.getByRole('radio', { name }) : page.getByRole('radio');
}

/** Every Base radio input: the ones inside a box. */
function inputs() {
	return [...document.querySelectorAll('span > input[type="radio"]')].filter(
		(node): node is HTMLInputElement => node instanceof HTMLInputElement
	);
}

function input() {
	const element = inputs()[0];
	if (!element) throw new Error('expected the radio input');
	return element;
}

function box() {
	const element = input().parentElement;
	if (!element) throw new Error('expected the radio box');
	return element;
}

function boxOf(testId: string) {
	const element = page.getByTestId(testId).element().parentElement;
	if (!element) throw new Error('expected the radio box');
	return element;
}

function checkedOf(testId: string) {
	return (page.getByTestId(testId).element() as HTMLInputElement).checked;
}

function clickRadio(name?: string) {
	(radioEl(name).element() as HTMLElement).click();
}

/** Each value the group context was asked to select, as JSON. */
function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as string[];
}

function groupValue() {
	return page.getByTestId('value').element().textContent ?? '';
}

function indicatorCount() {
	return document.querySelectorAll('[data-testid^="indicator"]').length;
}

describe('Radio', () => {
	describe('without a group', () => {
		it('is checked by defaultChecked, not by its value', async () => {
			render(Radio.Root, { value: '', defaultChecked: true });

			await expect.poll(() => input().checked).toBe(true);
			expect(box().hasAttribute('data-checked')).toBe(true);
			expect(input().value).toBe('');
		});

		it('starts unchecked for an empty value', async () => {
			render(Radio.Root, { value: '' });

			expect(input().checked).toBe(false);
			expect(box().hasAttribute('data-unchecked')).toBe(true);
		});

		it('selects on click, as a native radio does, and stays selected', async () => {
			render(Radio.Root, { value: 'blue' });

			expect(box().hasAttribute('data-unchecked')).toBe(true);
			expect(box().hasAttribute('data-checked')).toBe(false);
			expect(box().hasAttribute('value')).toBe(false);
			expect(input().value).toBe('blue');

			input().click();
			await expect.poll(() => box().hasAttribute('data-checked')).toBe(true);
			input().click();
			expect(input().checked).toBe(true);
		});

		it('selects with Space', async () => {
			render(Radio.Root, { value: 'blue' });

			input().focus();
			await userEvent.keyboard('{Space}');
			await expect.poll(() => input().checked).toBe(true);
		});

		it('submits the form on Enter without selecting', async () => {
			render(RadioFormHarness, { scenario: 'enter' });

			input().focus();
			await userEvent.keyboard('{Enter}');
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			expect(input().checked).toBe(false);
		});

		it('serializes null as an empty input value without selecting the radio', async () => {
			render(Radio.Root, { value: null });

			expect(input().value).toBe('');
			expect(input().checked).toBe(false);
		});

		it('serializes numbers and objects onto the input only', async () => {
			render(Radio.Root, { value: { id: 1 } });

			expect(input().value).toBe('{"id":1}');
			expect(box().hasAttribute('value')).toBe(false);
		});
	});

	describe('in a group', () => {
		it('sets checked and unchecked data attributes on the box', async () => {
			render(RadioGroupHarness, { scenario: 'select' });

			expect(boxOf('radio-a').hasAttribute('data-checked')).toBe(true);
			expect(boxOf('radio-a').hasAttribute('data-unchecked')).toBe(false);
			expect(boxOf('radio-b').hasAttribute('data-unchecked')).toBe(true);
			expect(boxOf('radio-b').hasAttribute('data-checked')).toBe(false);
		});

		it('puts the value on the input, not the box', async () => {
			render(RadioGroupHarness, { scenario: 'select' });
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('value', 'a');
			expect(boxOf('radio-a').hasAttribute('value')).toBe(false);
		});

		it('selects the clicked radio and clears the previous one', async () => {
			render(RadioGroupHarness, { scenario: 'select' });

			clickRadio('B');

			await expect.element(page.getByTestId('radio-b')).toBeChecked();
			await expect.element(page.getByTestId('radio-a')).not.toBeChecked();
			expect(inputs().map((element) => element.checked)).toEqual([false, true]);
			expect(groupValue()).toBe('"b"');
			expect(calls()).toEqual(['"b"']);
		});

		it('allows a null value', async () => {
			render(RadioGroupHarness, { scenario: 'null' });

			clickRadio('None');
			await expect.element(page.getByTestId('radio-null')).toBeChecked();
			expect(groupValue()).toBe('null');

			clickRadio('A');
			await expect.element(page.getByTestId('radio-null')).not.toBeChecked();
			await expect.element(page.getByTestId('radio-a')).toBeChecked();
		});

		it('selects by the value reference passed to the group', async () => {
			render(RadioGroupHarness, { scenario: 'object' });

			await expect.element(page.getByTestId('radio-a')).not.toBeChecked();
			clickRadio('One');
			await expect.element(page.getByTestId('radio-a')).toBeChecked();
			expect(inputs()[0]?.value).toBe('{"id":1}');

			clickRadio('Two');
			await expect.element(page.getByTestId('radio-b')).toBeChecked();
			await expect.element(page.getByTestId('radio-a')).not.toBeChecked();
		});

		it('selects a radio when its wrapping label is clicked', async () => {
			render(RadioGroupHarness, { scenario: 'label' });

			await page.getByText('Pick A').click();
			await expect.element(page.getByTestId('radio-a')).toBeChecked();
			expect(calls()).toHaveLength(1);
		});

		it('selects the radio that receives focus while the group is touched', async () => {
			render(RadioGroupHarness, { scenario: 'touched' });

			(page.getByTestId('radio-b').element() as HTMLElement).focus();

			await expect.element(page.getByTestId('radio-b')).toBeChecked();
			await expect.element(page.getByTestId('touched')).toHaveTextContent('no');
		});

		it('submits the selected radio value', async () => {
			render(RadioGroupHarness, { scenario: 'form' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => page.getByTestId('values').element().textContent).toContain('["a"]');

			clickRadio('B');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect
				.poll(() => page.getByTestId('values').element().textContent)
				.toContain('["a","b"]');
			expect(inputs().every((element) => element.name === 'color')).toBe(true);
		});

		it('blocks submit until a required group has a selection', async () => {
			render(RadioGroupHarness, { scenario: 'required' });

			expect(boxOf('radio-a').hasAttribute('data-required')).toBe(true);
			await expect.element(page.getByTestId('radio-a')).not.toHaveAttribute('aria-required');
			expect(inputs()[0]?.validity.valueMissing).toBe(true);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');

			clickRadio('A');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			expect(page.getByTestId('values').element().textContent).toContain('["a"]');
		});
	});

	describe('native attributes', () => {
		it('sends native attributes to the input, and class, style and host to the box', async () => {
			render(Radio.Root, {
				value: 'a',
				'data-testid': 'input',
				title: 'Tip',
				class: 'box',
				style: 'color: red',
				host: { 'data-testid': 'box' }
			});

			expect(page.getByTestId('input').element()).toBe(input());
			expect(input().title).toBe('Tip');
			expect(page.getByTestId('box').element()).toBe(box());
			expect(box().className).toBe('box');
			expect(box().style.color).toBe('red');
		});

		it('is named and selected by a sibling label that points at its id', async () => {
			render(RadioLabelHarness, { scenario: 'sibling' });

			await expect.element(radioEl()).toHaveAccessibleName('Label');
			await page.getByText('Label').click();
			await expect.poll(() => input().checked).toBe(true);
		});

		it('follows the label that points at its current id', async () => {
			render(RadioLabelHarness, { scenario: 'radio-id' });

			await expect.element(radioEl()).toHaveAccessibleName('Label A');
			await page.getByRole('button', { name: 'Toggle' }).click();
			await expect.element(radioEl()).toHaveAccessibleName('Label B');
		});

		it('is selected when a wrapping label is clicked', async () => {
			render(RadioLabelHarness, { scenario: 'wrap' });

			await expect.element(radioEl()).toHaveAccessibleName('Toggle');
			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.poll(() => input().checked).toBe(true);
		});

		it('fires native input and change events', async () => {
			const onchange = vi.fn((event: Event) => (event.currentTarget as HTMLInputElement).checked);
			const oninput = vi.fn();
			render(Radio.Root, { value: 'a', onchange, oninput });

			input().click();

			expect(oninput).toHaveBeenCalledTimes(1);
			expect(onchange.mock.results[0]?.value).toBe(true);
		});
	});

	describe('prop: onclick', () => {
		it('propagates a single click event to ancestors per user click', async () => {
			render(RadioGroupHarness, { scenario: 'bubble' });

			await page.getByTestId('radio-a').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(page.getByTestId('radio-a')).toBeChecked();
		});

		it('does not propagate to ancestors when stopPropagation() is called', async () => {
			render(RadioGroupHarness, { scenario: 'stop' });

			clickRadio('A');

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(page.getByTestId('radio-a')).toBeChecked();
		});

		it('propagates one click and selects a radio that has no group', async () => {
			render(RadioClickHarness, { scenario: 'bubble' });

			await page.getByRole('radio').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(radioEl()).toBeChecked();
		});
	});

	describe('prop: disabled', () => {
		it('disables the input natively', async () => {
			render(Radio.Root, { value: 'a', disabled: true });
			await expect.element(radioEl()).toBeDisabled();
			expect(box().hasAttribute('data-disabled')).toBe(true);
		});

		it('does not change a grouped radio when clicked', async () => {
			render(RadioGroupHarness, { scenario: 'disabled' });

			clickRadio('B');

			await expect.element(page.getByTestId('radio-a')).toBeChecked();
			expect(calls()).toEqual([]);
			expect(inputs().every((element) => element.disabled)).toBe(true);
		});
	});

	describe('prop: readOnly', () => {
		it('sets data-readonly on the box without aria-readonly on the input', async () => {
			render(Radio.Root, { value: 'a', readonly: true });
			await expect.element(radioEl()).not.toHaveAttribute('aria-readonly');
			expect(box().hasAttribute('data-readonly')).toBe(true);
		});

		it('should not have the readonly hook when readOnly is not set', async () => {
			render(Radio.Root, { value: 'a' });
			expect(box().hasAttribute('data-readonly')).toBe(false);
		});

		it('does not change a grouped radio when clicked', async () => {
			render(RadioGroupHarness, { scenario: 'readonly' });

			await expect.element(page.getByTestId('radio-a')).toBeChecked();
			clickRadio('B');
			await expect.element(page.getByTestId('radio-b')).not.toBeChecked();
			expect(calls()).toEqual([]);
			expect(checkedOf('radio-a')).toBe(true);
		});

		it('does not select a radio without a group when its label is clicked', async () => {
			render(RadioLabelHarness, { scenario: 'readonly' });

			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.element(radioEl()).not.toBeChecked();
		});
	});

	describe('prop: required', () => {
		it('requires the input natively and sets data-required on the box', async () => {
			render(Radio.Root, { value: 'a', required: true });
			await expect.element(radioEl()).not.toHaveAttribute('aria-required');
			expect(box().hasAttribute('data-required')).toBe(true);
			expect(input().required).toBe(true);
		});

		it('should not have the required hook when required is not set', async () => {
			render(Radio.Root, { value: 'a' });
			expect(box().hasAttribute('data-required')).toBe(false);
		});

		it('does not block submit for a required radio that has no name', async () => {
			render(RadioFormHarness, { scenario: 'required' });

			expect(input().required).toBe(true);
			expect(input().validity.valueMissing).toBe(false);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		});

		it('submits a standalone required radio that starts checked', async () => {
			render(RadioFormHarness, { scenario: 'required-checked' });

			expect(input().validity.valueMissing).toBe(false);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		});
	});

	it('should place the style hooks on the box and the indicator', async () => {
		render(RadioStyleHarness);
		const indicator = page.getByTestId('indicator');

		expect(box().hasAttribute('data-checked')).toBe(true);
		expect(box().hasAttribute('data-disabled')).toBe(true);
		expect(box().hasAttribute('data-readonly')).toBe(true);
		expect(box().hasAttribute('data-required')).toBe(true);
		await expect.element(indicator).toHaveAttribute('data-checked', '');
		await expect.element(indicator).toHaveAttribute('data-disabled', '');

		await page.getByRole('button', { name: 'Enable' }).click();

		await expect.poll(() => box().hasAttribute('data-unchecked')).toBe(true);
		expect(box().hasAttribute('data-checked')).toBe(false);
		await expect.poll(() => indicatorCount()).toBe(0);
	});

	describe('Indicator', () => {
		it('throws a descriptive error when rendered outside Radio.Root', async () => {
			await expect(async () => {
				await render(Radio.Indicator);
			}).rejects.toThrow(
				'Base UI: RadioRootContext is missing. Radio parts must be placed within <Radio.Root>.'
			);
		});

		it('does not render the indicator while unchecked', async () => {
			render(RadioIndicatorHarness);
			expect(indicatorCount()).toBe(0);
		});

		it('renders the indicator when checked', async () => {
			render(RadioIndicatorHarness, { initiallyChecked: true });
			await expect.element(page.getByTestId('indicator')).toHaveAttribute('data-checked', '');
		});

		it('keeps the indicator mounted when keepMounted is set', async () => {
			render(RadioIndicatorHarness, { keepMounted: true });
			expect(page.getByTestId('indicator').elements()).toHaveLength(1);
		});

		it('removes the indicator when there is no exit animation', async () => {
			render(RadioIndicatorHarness, { initiallyChecked: true });
			expect(page.getByTestId('indicator').elements()).toHaveLength(1);

			await page.getByRole('button', { name: 'Toggle' }).click();

			await expect.poll(() => indicatorCount()).toBe(0);
		});

		it('removes data-starting-style after the mount frame', async () => {
			render(RadioIndicatorHarness);
			let sawStarting = false;
			const observer = new MutationObserver(() => {
				const indicator = document.querySelector('[data-testid="indicator"]');
				if (indicator?.hasAttribute('data-starting-style')) sawStarting = true;
			});
			observer.observe(document.body, { attributes: true, childList: true, subtree: true });

			await page.getByRole('button', { name: 'Toggle' }).click();
			await expect
				.poll(() => {
					const indicator = document.querySelector('[data-testid="indicator"]');
					return indicator != null && !indicator.hasAttribute('data-starting-style');
				})
				.toBe(true);
			observer.disconnect();

			expect(sawStarting).toBe(true);
			expect(indicatorCount()).toBe(1);
		});

		it('keeps data-ending-style until the exit animation ends', async () => {
			render(RadioIndicatorHarness, {
				css: HELD_ENDING_CSS,
				indicatorClass: 'animation-test-indicator'
			});
			const button = page.getByRole('button', { name: 'Toggle' }).element() as HTMLButtonElement;
			const request = AnimationFrame.prototype.request;
			let clearedEnding = false;
			AnimationFrame.prototype.request = function (fn: () => void) {
				const scheduledDuringEnding = document
					.querySelector('[data-testid="indicator"]')
					?.hasAttribute('data-ending-style');
				return request.call(this, () => {
					const endingNow = document
						.querySelector('[data-testid="indicator"]')
						?.hasAttribute('data-ending-style');
					fn();
					if (!scheduledDuringEnding && endingNow) clearedEnding = true;
				});
			};
			try {
				button.click();
				flushSync();
				button.click();
				flushSync();
				const indicator = document.querySelector('[data-testid="indicator"]');
				expect(indicator?.hasAttribute('data-ending-style')).toBe(true);
				await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
				await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
				expect(clearedEnding).toBe(false);
				expect(
					document.querySelector('[data-testid="indicator"]')?.hasAttribute('data-ending-style')
				).toBe(true);
				const animations = indicator!.getAnimations() as CSSAnimation[];
				expect(animations.map((animation) => animation.animationName)).toEqual(['radio-test-anim']);
				animations[0].finish();
			} finally {
				AnimationFrame.prototype.request = request;
			}
			await expect.poll(() => indicatorCount()).toBe(0);
		});

		it('applies data-starting-style while the indicator mounts', async () => {
			render(RadioIndicatorHarness);
			let sawStarting = false;
			const observer = new MutationObserver(() => {
				const indicator = document.querySelector('[data-testid="indicator"]');
				if (indicator?.hasAttribute('data-starting-style')) sawStarting = true;
			});
			observer.observe(document.body, { attributes: true, childList: true, subtree: true });

			await page.getByRole('button', { name: 'Toggle' }).click();
			await expect.poll(() => indicatorCount()).toBe(1);
			observer.disconnect();

			expect(sawStarting).toBe(true);
		});

		it('applies data-ending-style before unmount', async () => {
			render(RadioIndicatorHarness, {
				initiallyChecked: true,
				css: ENDING_CSS,
				indicatorClass: 'animation-test-indicator'
			});
			let sawEnding = false;
			const observer = new MutationObserver(() => {
				const indicator = document.querySelector('[data-testid="indicator"]');
				if (indicator?.hasAttribute('data-ending-style')) sawEnding = true;
			});
			observer.observe(document.body, { attributes: true, childList: true, subtree: true });

			await page.getByRole('button', { name: 'Toggle' }).click();
			await expect.poll(() => indicatorCount()).toBe(0);
			observer.disconnect();

			expect(sawEnding).toBe(true);
		});

		it('removes every indicator in one step when several radios are cleared', async () => {
			render(RadioIndicatorHarness, {
				initiallyChecked: true,
				count: 10,
				css: ENDING_CSS,
				indicatorClass: 'animation-test-indicator'
			});
			expect(indicatorCount()).toBe(10);

			const counts: number[] = [];
			const observer = new MutationObserver(() => {
				counts.push(indicatorCount());
			});
			observer.observe(document.body, { attributes: true, childList: true, subtree: true });

			await page.getByRole('button', { name: 'Toggle' }).click();
			await expect.poll(() => indicatorCount()).toBe(0);
			observer.disconnect();

			expect(counts).toContain(0);
			expect(counts.every((count) => count === 0 || count === 10)).toBe(true);
		});
	});

	describe('native Svelte', () => {
		it('preventDefault in onclick skips selecting the radio', async () => {
			render(RadioGroupHarness, { scenario: 'prevented' });

			clickRadio('B');

			await expect.element(page.getByTestId('radio-a')).toBeChecked();
			await expect.element(page.getByTestId('radio-b')).not.toBeChecked();
			expect(calls()).toEqual([]);
		});

		it('passes consumer attachments to the input', async () => {
			render(RadioAttachHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('INPUT');
		});

		it('render snippet draws the box with the input inside', async () => {
			render(RadioAttachHarness, { custom: true });
			const custom = document.querySelector('.custom-host');

			expect(custom?.getAttribute('data-state')).toBe('off');
			expect(input().parentElement).toBe(custom);
			input().click();
			await expect.poll(() => custom?.getAttribute('data-state')).toBe('on');
		});
	});
});

describe('Radio labels', () => {
	ariaLabelPreferenceCases('radio');
});

describe('Radio.Root consumer preventDefault', () => {
	it('keeps the checked radio when arrow keys focus a radio whose onfocus calls preventDefault', async () => {
		render(PreventedHandlerHarness, {
			part: 'radio',
			handlers: { onfocus: (event: Event) => event.preventDefault() }
		});
		await userEvent.click(page.getByRole('radio', { name: 'A' }));
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('radio', { name: 'B' })).toHaveFocus();
		await expect.element(page.getByRole('radio', { name: 'B' })).not.toBeChecked();
		await expect.element(page.getByRole('radio', { name: 'A' })).toBeChecked();
	});
});
