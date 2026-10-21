// Assertions follow Base UI v1.8.0
// packages/react/src/checkbox/root/CheckboxRoot.test.tsx and
// packages/react/src/checkbox/indicator/CheckboxIndicator.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases from upstream commit d8afb3717 follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// Sveltery: the checkbox is a real `<input type="checkbox">` over a painted box, so `checked`,
// `indeterminate`, `disabled` and `required` are the input's own, and native events replace
// `onCheckedChange` (docs/upstream-differences.md).
// Field and Form cases are in src/lib/field/choice-controls.svelte.spec.ts.
// Cases under "native Svelte" have no upstream counterpart.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ariaLabelPreferenceCases } from '../../tests/aria-label-preference-cases.js';
import CheckboxAttachHarness from '../../tests/CheckboxAttachHarness.svelte';
import CheckboxBindHarness from '../../tests/CheckboxBindHarness.svelte';
import CheckboxClickHarness from '../../tests/CheckboxClickHarness.svelte';
import CheckboxFormHarness from '../../tests/CheckboxFormHarness.svelte';
import CheckboxIndicatorHarness from '../../tests/CheckboxIndicatorHarness.svelte';
import CheckboxLabelHarness from '../../tests/CheckboxLabelHarness.svelte';
import CheckboxStyleHarness from '../../tests/CheckboxStyleHarness.svelte';
import { controllableRootCases } from '../../tests/controllable-root-cases.js';
import { Checkbox } from './index.js';
import { AnimationFrame } from '@sveltery/utils';

const ENDING_CSS = `
	@keyframes checkbox-test-anim { to { opacity: 0; } }
	.animation-test-indicator[data-ending-style] { animation: checkbox-test-anim 40ms; }
`;

const HELD_ENDING_CSS = `
	@keyframes checkbox-test-anim { to { opacity: 0; } }
	.animation-test-indicator[data-ending-style] { animation: checkbox-test-anim 600s; }
`;

function checkboxEl(name?: string) {
	return name ? page.getByRole('checkbox', { name }) : page.getByRole('checkbox');
}

/** The Base checkbox input: the one inside a box. */
function input() {
	const element = document.querySelector('span > input[type="checkbox"]:not([hidden])');
	if (!(element instanceof HTMLInputElement)) throw new Error('expected the checkbox input');
	return element;
}

function box() {
	const element = input().parentElement;
	if (!element) throw new Error('expected the checkbox box');
	return element;
}

function clickCheckbox() {
	input().click();
}

const checked = () => input().checked;

function values() {
	return JSON.parse(page.getByTestId('values').element().textContent ?? '[]') as (string | null)[];
}

function indicatorCount() {
	return document.querySelectorAll('[data-testid^="indicator"]').length;
}

describe('Checkbox', () => {
	describe('interactions', () => {
		it('should change its state when clicked', async () => {
			render(Checkbox.Root);

			await expect.poll(checked).toBe(false);
			expect(input().checked).toBe(false);
			clickCheckbox();
			await expect.poll(checked).toBe(true);
			expect(input().checked).toBe(true);
			clickCheckbox();
			await expect.poll(checked).toBe(false);
			expect(input().checked).toBe(false);
		});

		it('should update its state when changed from outside', async () => {
			render(CheckboxBindHarness);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });

			await expect.poll(checked).toBe(false);
			await owner.click();
			await expect.poll(checked).toBe(true);
			await owner.click();
			await expect.poll(checked).toBe(false);
		});

		it('should update its state if the underlying input is toggled', async () => {
			render(Checkbox.Root);

			input().click();

			await expect.poll(checked).toBe(true);
		});

		it('can be activated with Space', async () => {
			render(Checkbox.Root);

			await expect.poll(checked).toBe(false);
			input().focus();
			await userEvent.keyboard('{Space}');
			await expect.poll(checked).toBe(true);
		});

		it('does not activate with Enter', async () => {
			render(Checkbox.Root);

			input().focus();
			await userEvent.keyboard('{Enter}');
			expect(checked()).toBe(false);
		});

		it('submits the form on Enter without ticking', async () => {
			render(CheckboxFormHarness);

			input().focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => values()).toEqual([null]);
			await expect.poll(checked).toBe(false);
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		});
	});

	describe('prop: onclick', () => {
		it('should call onclick when clicked', async () => {
			const handleClick = vi.fn();
			render(Checkbox.Root, { onclick: handleClick });

			clickCheckbox();

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('propagates a single click event to ancestors per user click', async () => {
			render(CheckboxClickHarness, { scenario: 'bubble' });

			await checkboxEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.poll(checked).toBe(true);
		});

		it('does not propagate to ancestors when stopPropagation() is called', async () => {
			render(CheckboxClickHarness, { scenario: 'stop' });

			await checkboxEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.poll(checked).toBe(true);
		});
	});

	describe('prop: disabled', () => {
		it('should not change its state when clicked', async () => {
			render(Checkbox.Root, { disabled: true });

			await expect.poll(checked).toBe(false);
			input().click();
			await expect.poll(checked).toBe(false);
		});
	});

	describe('prop: readOnly', () => {
		it('should have the aria-readonly attribute', async () => {
			render(Checkbox.Root, { readonly: true });
			expect(input().getAttribute('aria-readonly')).toBe('true');
		});

		it('should not have the aria attribute when readOnly is not set', async () => {
			render(Checkbox.Root);
			expect(input().hasAttribute('aria-readonly')).toBe(false);
		});

		it('should not change its state when clicked', async () => {
			render(Checkbox.Root, { readonly: true });

			await expect.poll(checked).toBe(false);
			clickCheckbox();
			await expect.poll(checked).toBe(false);
		});

		it('should not change its state when its label is clicked', async () => {
			render(CheckboxLabelHarness, { scenario: 'readonly' });

			await expect.poll(checked).toBe(false);
			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.poll(checked).toBe(false);
			expect(input().checked).toBe(false);
		});
	});

	describe('prop: indeterminate', () => {
		it('sets the input indeterminate', async () => {
			render(Checkbox.Root, { indeterminate: true });
			await expect.poll(() => input().indeterminate).toBe(true);
		});

		it('stays indeterminate when clicked', async () => {
			render(Checkbox.Root, { indeterminate: true });

			await expect.poll(() => input().indeterminate).toBe(true);
			clickCheckbox();
			await expect.poll(() => input().indeterminate).toBe(true);
		});

		it('should not have the mixed aria attribute when indeterminate is not set', async () => {
			render(Checkbox.Root);
			expect(input().indeterminate).toBe(false);
		});

		it('should not be overridden by the checked prop', async () => {
			render(Checkbox.Root, { indeterminate: true, checked: true });
			await expect.poll(() => input().indeterminate).toBe(true);
		});

		it('sets the native input state when indeterminate', async () => {
			render(Checkbox.Root, { indeterminate: true });
			await expect.poll(() => input().indeterminate).toBe(true);
		});

		it('keeps the native input indeterminate when checked changes', async () => {
			render(Checkbox.Root, { indeterminate: true });

			clickCheckbox();

			await expect.poll(() => input().checked).toBe(true);
			await expect.poll(() => input().indeterminate).toBe(true);
			await expect.poll(() => input().indeterminate).toBe(true);
		});

		it('sets indeterminate style hooks on the root and indicator', async () => {
			render(CheckboxIndicatorHarness, { indeterminate: true });

			await expect.poll(() => box().hasAttribute('data-indeterminate')).toBe(true);
			await expect.poll(() => box().hasAttribute('data-checked')).toBe(false);
			await expect.poll(() => box().hasAttribute('data-unchecked')).toBe(false);
			await expect.element(page.getByTestId('indicator')).toHaveAttribute('data-indeterminate', '');
		});
	});

	it('should place the style hooks on the root and the indicator', async () => {
		render(CheckboxStyleHarness);
		const indicator = page.getByTestId('indicator');

		await expect.poll(() => box().hasAttribute('data-checked')).toBe(true);
		await expect.poll(() => box().hasAttribute('data-disabled')).toBe(true);
		await expect.poll(() => box().hasAttribute('data-readonly')).toBe(true);
		await expect.poll(() => box().hasAttribute('data-required')).toBe(true);
		await expect.element(indicator).toHaveAttribute('data-checked', '');
		await expect.element(indicator).toHaveAttribute('data-disabled', '');
		await expect.element(indicator).toHaveAttribute('data-readonly', '');
		await expect.element(indicator).toHaveAttribute('data-required', '');

		await page.getByRole('button', { name: 'Enable' }).click();
		clickCheckbox();

		await expect.poll(() => box().hasAttribute('data-unchecked')).toBe(true);
		await expect.poll(() => box().hasAttribute('data-checked')).toBe(false);
		await expect.poll(() => indicatorCount()).toBe(0);
	});

	it('should set the name attribute only on the input', async () => {
		render(Checkbox.Root, { name: 'checkbox-name' });

		expect(input().getAttribute('name')).toBe('checkbox-name');
		expect(box().hasAttribute('name')).toBe(false);
	});

	it('should not set the value attribute by default', async () => {
		render(Checkbox.Root);
		expect(input().hasAttribute('value')).toBe(false);
	});

	it('should set the value attribute only on the input', async () => {
		render(Checkbox.Root, { value: '1' });

		expect(input().getAttribute('value')).toBe('1');
		expect(box().hasAttribute('value')).toBe(false);
	});

	describe('with native label', () => {
		it('should toggle the checkbox when a wrapping label is clicked', async () => {
			render(CheckboxLabelHarness, { scenario: 'wrap' });

			await expect.element(checkboxEl()).toHaveAccessibleName('Toggle');
			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.poll(checked).toBe(true);
		});

		it('should toggle the checkbox when an explicitly linked label is clicked', async () => {
			render(CheckboxLabelHarness, { scenario: 'sibling' });

			await expect.element(checkboxEl()).toHaveAccessibleName('Label');
			await page.getByText('Label').click();
			await expect.poll(checked).toBe(true);
		});
	});

	describe('form submission', () => {
		it('should include the checkbox value in form submission, matching a native checkbox', async () => {
			render(CheckboxFormHarness, { scenario: 'plain' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null]);

			clickCheckbox();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null, 'on']);
		});

		it('submits to an external form when form is provided', async () => {
			render(CheckboxFormHarness, { scenario: 'external' });

			clickCheckbox();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['on']);
		});

		it('submits uncheckedValue to an external form when off', async () => {
			render(CheckboxFormHarness, { scenario: 'unchecked-external' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['off']);
		});

		it('does not submit uncheckedValue when disabled', async () => {
			render(CheckboxFormHarness, { scenario: 'disabled' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null]);
		});

		it('submits custom value and uncheckedValue across an off/on/off cycle', async () => {
			render(CheckboxFormHarness, { scenario: 'cycle' });

			await page.getByRole('button', { name: 'Submit' }).click();
			clickCheckbox();
			await page.getByRole('button', { name: 'Submit' }).click();
			clickCheckbox();
			await page.getByRole('button', { name: 'Submit' }).click();

			await expect.poll(() => values()).toEqual(['no', 'yes', 'no']);
		});

		it('submits uncheckedValue while mixed and unticked', async () => {
			render(CheckboxFormHarness, { scenario: 'mixed-off' });

			await expect.poll(() => input().indeterminate).toBe(true);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['off']);
		});

		it('triggers native HTML validation on submit', async () => {
			render(CheckboxFormHarness, { scenario: 'required' });

			expect(input().validity.valueMissing).toBe(true);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');

			clickCheckbox();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			expect(values()).toEqual(['on']);
		});
	});

	describe('Indicator', () => {
		it('throws a descriptive error when rendered outside Checkbox.Root', async () => {
			await expect(async () => {
				await render(Checkbox.Indicator);
			}).rejects.toThrow(
				'Base UI: CheckboxRootContext is missing. Checkbox parts must be placed within <Checkbox.Root>.'
			);
		});

		it('does not render the indicator while unticked', async () => {
			render(CheckboxIndicatorHarness);
			expect(indicatorCount()).toBe(0);
		});

		it('renders the indicator when checked', async () => {
			render(CheckboxIndicatorHarness, { checked: true });
			await expect.element(page.getByTestId('indicator')).toHaveAttribute('data-checked', '');
		});

		it('renders the indicator when indeterminate', async () => {
			render(CheckboxIndicatorHarness, { indeterminate: true });
			await expect.element(page.getByTestId('indicator')).toHaveAttribute('data-indeterminate', '');
		});

		it('keeps the indicator mounted when keepMounted is set', async () => {
			render(CheckboxIndicatorHarness, { keepMounted: true });
			expect(page.getByTestId('indicator').elements()).toHaveLength(1);
		});

		it('removes the indicator when there is no exit animation', async () => {
			render(CheckboxIndicatorHarness, { checked: true });
			expect(page.getByTestId('indicator').elements()).toHaveLength(1);

			await page.getByRole('button', { name: 'Toggle' }).click();

			await expect.poll(() => indicatorCount()).toBe(0);
		});

		it('removes data-starting-style after the mount frame', async () => {
			render(CheckboxIndicatorHarness);
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
			render(CheckboxIndicatorHarness, {
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
				expect(animations.map((animation) => animation.animationName)).toEqual([
					'checkbox-test-anim'
				]);
				animations[0].finish();
			} finally {
				AnimationFrame.prototype.request = request;
			}
			await expect.poll(() => indicatorCount()).toBe(0);
		});

		it('applies data-starting-style while the indicator mounts', async () => {
			render(CheckboxIndicatorHarness);
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
			render(CheckboxIndicatorHarness, {
				checked: true,
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

		it('removes every indicator in one step when several checkboxes are unticked', async () => {
			render(CheckboxIndicatorHarness, {
				checked: true,
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
		it('one-way checked sets the value, clicks override it until the owner changes it', async () => {
			render(CheckboxBindHarness, { bound: false });
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });

			await owner.click();
			await expect.poll(checked).toBe(true);
			input().click();
			await expect.poll(checked).toBe(false);
			await expect.element(owner).toBeChecked();
			await owner.click();
			await owner.click();
			await expect.poll(checked).toBe(true);
		});

		it('preventDefault in onclick keeps the checkbox unticked', async () => {
			const onchange = vi.fn();
			render(Checkbox.Root, {
				onclick: (event: MouseEvent) => event.preventDefault(),
				onchange
			});

			clickCheckbox();

			expect(onchange).not.toHaveBeenCalled();
			expect(checked()).toBe(false);
		});

		it('fires native input and change events', async () => {
			const onchange = vi.fn((event: Event) => (event.currentTarget as HTMLInputElement).checked);
			const oninput = vi.fn();
			render(Checkbox.Root, { onchange, oninput });

			clickCheckbox();

			expect(oninput).toHaveBeenCalledTimes(1);
			expect(onchange.mock.results[0]?.value).toBe(true);
		});

		it('sends native attributes to the input, and class, style and host to the box', async () => {
			render(Checkbox.Root, {
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

		it('disables and requires the input natively', async () => {
			render(Checkbox.Root, { disabled: true, required: true });
			expect(input().disabled).toBe(true);
			expect(input().required).toBe(true);
		});

		it('passes consumer attachments to the input', async () => {
			render(CheckboxAttachHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('INPUT');
		});

		it('render snippet draws the box with the input inside', async () => {
			render(CheckboxAttachHarness, { custom: true });
			const custom = document.querySelector('.custom-host');

			expect(custom?.getAttribute('data-state')).toBe('off');
			expect(input().parentElement).toBe(custom);
			clickCheckbox();
			await expect.poll(() => custom?.getAttribute('data-state')).toBe('on');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('checkbox');
});

describe('Checkbox labels', () => {
	ariaLabelPreferenceCases('checkbox');
});
