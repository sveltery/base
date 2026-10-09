// Assertions follow Base UI v1.8.0
// packages/react/src/checkbox/root/CheckboxRoot.test.tsx and
// packages/react/src/checkbox/indicator/CheckboxIndicator.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field, CheckboxGroup, and Form error clearing are not ported.
// Form cases below use the hidden input with a native <form>.
// Cases under "native Svelte" have no upstream counterpart.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CheckboxAttachHarness from '../../tests/CheckboxAttachHarness.svelte';
import CheckboxBindHarness from '../../tests/CheckboxBindHarness.svelte';
import CheckboxClickHarness from '../../tests/CheckboxClickHarness.svelte';
import CheckboxFormHarness from '../../tests/CheckboxFormHarness.svelte';
import CheckboxIndicatorHarness from '../../tests/CheckboxIndicatorHarness.svelte';
import CheckboxLabelHarness from '../../tests/CheckboxLabelHarness.svelte';
import CheckboxStyleHarness from '../../tests/CheckboxStyleHarness.svelte';
import { controllableRootCases } from '../../tests/controllable-root-cases.js';
import { Checkbox } from './index.js';
import { AnimationFrame } from '../internal/timeout.js';

const ENDING_CSS = `
	@keyframes checkbox-test-anim { to { opacity: 0; } }
	.animation-test-indicator[data-ending-style] { animation: checkbox-test-anim 40ms; }
`;

function checkboxEl(name?: string) {
	return name ? page.getByRole('checkbox', { name }) : page.getByRole('checkbox');
}

function clickCheckbox(init?: MouseEventInit) {
	const element = checkboxEl().element() as HTMLElement;
	if (init) {
		element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
		return;
	}
	element.click();
}

function hiddenInput() {
	const input = document.querySelector('input[type="checkbox"][aria-hidden="true"]');
	if (!(input instanceof HTMLInputElement)) throw new Error('expected a hidden checkbox');
	return input;
}

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

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
			clickCheckbox();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
			expect(hiddenInput().checked).toBe(true);
			clickCheckbox();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it('should update its state when changed from outside', async () => {
			render(CheckboxBindHarness);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			const box = checkboxEl('Notifications');

			await expect.element(box).toHaveAttribute('aria-checked', 'false');
			await owner.click();
			await expect.element(box).toHaveAttribute('aria-checked', 'true');
			await owner.click();
			await expect.element(box).toHaveAttribute('aria-checked', 'false');
		});

		it('should update its state if the underlying input is toggled', async () => {
			render(Checkbox.Root);

			hiddenInput().click();

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('ignores a hidden input click canceled before the handler runs', async () => {
			const handleCheckedChange = vi.fn();
			render(Checkbox.Root, { onCheckedChange: handleCheckedChange });

			const event = new MouseEvent('click', { bubbles: true, cancelable: true });
			event.preventDefault();
			hiddenInput().dispatchEvent(event);

			expect(handleCheckedChange).not.toHaveBeenCalled();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it('can be activated with Space', async () => {
			render(Checkbox.Root);

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			(checkboxEl().element() as HTMLElement).focus();
			await userEvent.keyboard('{Space}');
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('does not activate with Enter', async () => {
			render(Checkbox.Root);

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			(checkboxEl().element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it('submits the form on Enter without ticking', async () => {
			render(CheckboxFormHarness);

			(checkboxEl().element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => values()).toEqual([null]);
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		});
	});

	describe('extra props', () => {
		it('should override the built-in attributes', async () => {
			render(Checkbox.Root, { role: 'switch', 'data-testid': 'box' });
			await expect.element(page.getByTestId('box')).toHaveAttribute('role', 'switch');
		});

		it('sets aria-labelledby from a sibling label associated with the hidden input', async () => {
			render(CheckboxLabelHarness, { scenario: 'sibling' });

			const label = page.getByText('Label');
			await expect.poll(() => label.element().id).not.toBe('');
			await expect.element(checkboxEl()).toHaveAttribute('aria-labelledby', label.element().id);
		});

		it('updates fallback aria-labelledby when the hidden input id changes', async () => {
			render(CheckboxLabelHarness, { scenario: 'checkbox-id' });

			const labelA = page.getByText('Label A');
			await expect.poll(() => labelA.element().id).not.toBe('');
			await expect.element(checkboxEl()).toHaveAttribute('aria-labelledby', labelA.element().id);

			await page.getByRole('button', { name: 'Toggle' }).click();

			const labelB = page.getByText('Label B');
			await expect.poll(() => labelB.element().id).not.toBe('');
			expect(labelA.element().id).not.toBe(labelB.element().id);
			await expect.element(checkboxEl()).toHaveAttribute('aria-labelledby', labelB.element().id);
		});
	});

	describe('prop: onCheckedChange', () => {
		it('should call onCheckedChange when clicked', async () => {
			const handleChange = vi.fn();
			render(Checkbox.Root, { onCheckedChange: handleChange });

			clickCheckbox();

			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange.mock.calls[0]?.[0]).toBe(true);
		});

		it('should report keyboard modifier event properties when calling onCheckedChange', async () => {
			const handleChange = vi.fn();
			render(Checkbox.Root, { onCheckedChange: handleChange });

			clickCheckbox({ shiftKey: true });

			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange.mock.calls[0]?.[1].event.shiftKey).toBe(true);
		});

		it('does not change state when canceled via a root click', async () => {
			render(Checkbox.Root, {
				onCheckedChange: (_checked: boolean, eventDetails: { cancel: () => void }) =>
					eventDetails.cancel()
			});

			clickCheckbox();

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it('does not change state when canceled via a hidden input click', async () => {
			render(Checkbox.Root, {
				onCheckedChange: (_checked: boolean, eventDetails: { cancel: () => void }) =>
					eventDetails.cancel()
			});

			hiddenInput().click();

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
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
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('does not propagate to ancestors when stopPropagation() is called', async () => {
			render(CheckboxClickHarness, { scenario: 'stop' });

			await checkboxEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('propagates a single click event to ancestors with a native button', async () => {
			render(CheckboxClickHarness, { scenario: 'native' });

			await checkboxEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('does not propagate to ancestors when stopPropagation() is called with a native button', async () => {
			render(CheckboxClickHarness, { scenario: 'native-stop' });

			await checkboxEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('prop: disabled', () => {
		it('uses aria-disabled instead of HTML disabled', async () => {
			render(Checkbox.Root, { disabled: true });
			await expect.element(checkboxEl()).not.toHaveAttribute('disabled');
			await expect.element(checkboxEl()).toHaveAttribute('aria-disabled', 'true');
		});

		it('should not change its state when clicked', async () => {
			render(Checkbox.Root, { disabled: true });

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			(checkboxEl().element() as HTMLElement).click();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
		});
	});

	describe('prop: readOnly', () => {
		it('should have the aria-readonly attribute', async () => {
			render(Checkbox.Root, { readOnly: true });
			await expect.element(checkboxEl()).toHaveAttribute('aria-readonly', 'true');
		});

		it('should not have the aria attribute when readOnly is not set', async () => {
			render(Checkbox.Root);
			await expect.element(checkboxEl()).not.toHaveAttribute('aria-readonly');
		});

		it('should not change its state when clicked', async () => {
			render(Checkbox.Root, { readOnly: true });

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			clickCheckbox();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
		});

		it('should not change its state when its label is clicked', async () => {
			render(CheckboxLabelHarness, { scenario: 'readonly' });

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});
	});

	describe('prop: required', () => {
		it('should have the aria-required attribute', async () => {
			render(Checkbox.Root, { required: true });
			await expect.element(checkboxEl()).toHaveAttribute('aria-required', 'true');
		});

		it('should not have the aria attribute when required is not set', async () => {
			render(Checkbox.Root);
			await expect.element(checkboxEl()).not.toHaveAttribute('aria-required');
		});
	});

	describe('prop: indeterminate', () => {
		it('should set the aria-checked attribute as mixed', async () => {
			render(Checkbox.Root, { indeterminate: true });
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'mixed');
		});

		it('keeps aria-checked mixed when clicked', async () => {
			render(Checkbox.Root, { indeterminate: true });

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'mixed');
			clickCheckbox();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'mixed');
		});

		it('should not have the mixed aria attribute when indeterminate is not set', async () => {
			render(Checkbox.Root);
			await expect.element(checkboxEl()).not.toHaveAttribute('aria-checked', 'mixed');
		});

		it('should not be overridden by the checked prop', async () => {
			render(Checkbox.Root, { indeterminate: true, checked: true });
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'mixed');
		});

		it('sets the native input state when indeterminate', async () => {
			render(Checkbox.Root, { indeterminate: true });
			await expect.poll(() => hiddenInput().indeterminate).toBe(true);
		});

		it('keeps the native input indeterminate when checked changes', async () => {
			render(Checkbox.Root, { indeterminate: true });

			clickCheckbox();

			await expect.poll(() => hiddenInput().checked).toBe(true);
			await expect.poll(() => hiddenInput().indeterminate).toBe(true);
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'mixed');
		});

		it('sets indeterminate style hooks on the root and indicator', async () => {
			render(CheckboxIndicatorHarness, { indeterminate: true });

			await expect.element(checkboxEl()).toHaveAttribute('data-indeterminate', '');
			await expect.element(checkboxEl()).not.toHaveAttribute('data-checked');
			await expect.element(checkboxEl()).not.toHaveAttribute('data-unchecked');
			await expect.element(page.getByTestId('indicator')).toHaveAttribute('data-indeterminate', '');
		});
	});

	it('should place the style hooks on the root and the indicator', async () => {
		render(CheckboxStyleHarness);
		const indicator = page.getByTestId('indicator');

		await expect.element(checkboxEl()).toHaveAttribute('data-checked', '');
		await expect.element(checkboxEl()).toHaveAttribute('data-disabled', '');
		await expect.element(checkboxEl()).toHaveAttribute('data-readonly', '');
		await expect.element(checkboxEl()).toHaveAttribute('data-required', '');
		await expect.element(indicator).toHaveAttribute('data-checked', '');
		await expect.element(indicator).toHaveAttribute('data-disabled', '');
		await expect.element(indicator).toHaveAttribute('data-readonly', '');
		await expect.element(indicator).toHaveAttribute('data-required', '');

		await page.getByRole('button', { name: 'Enable' }).click();
		clickCheckbox();

		await expect.element(checkboxEl()).toHaveAttribute('data-unchecked', '');
		await expect.element(checkboxEl()).not.toHaveAttribute('data-checked');
		await expect.poll(() => indicatorCount()).toBe(0);
	});

	it('should set the name attribute only on the input', async () => {
		render(Checkbox.Root, { name: 'checkbox-name' });

		expect(hiddenInput().getAttribute('name')).toBe('checkbox-name');
		await expect.element(checkboxEl()).not.toHaveAttribute('name');
	});

	it('should not set the value attribute by default', async () => {
		render(Checkbox.Root);
		expect(hiddenInput().hasAttribute('value')).toBe(false);
	});

	it('should set the value attribute only on the input', async () => {
		render(Checkbox.Root, { value: '1' });

		expect(hiddenInput().getAttribute('value')).toBe('1');
		await expect.element(checkboxEl()).not.toHaveAttribute('value');
	});

	describe('with native label', () => {
		it('should toggle the checkbox when a wrapping label is clicked', async () => {
			render(CheckboxLabelHarness, { scenario: 'wrap' });

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			await page.getByTestId('label').click();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('should toggle the checkbox when an explicitly linked label is clicked', async () => {
			render(CheckboxLabelHarness, { scenario: 'sibling' });

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			await page.getByText('Label').click();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('should associate id with the native button when nativeButton is true', async () => {
			render(CheckboxLabelHarness, { scenario: 'native' });

			await expect.element(checkboxEl()).toHaveAttribute('id', 'myCheckbox');
			expect(hiddenInput().getAttribute('id')).not.toBe('myCheckbox');

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
			await page.getByTestId('label').click();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
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

			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'mixed');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['off']);
		});

		it('triggers native HTML validation on submit', async () => {
			render(CheckboxFormHarness, { scenario: 'required' });

			expect(hiddenInput().validity.valueMissing).toBe(true);
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
				css: ENDING_CSS,
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

	it('can render a native button', async () => {
		render(CheckboxClickHarness, { scenario: 'native' });

		expect(checkboxEl().element().tagName).toBe('BUTTON');
		await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
		await expect.element(checkboxEl()).toHaveAttribute('type', 'button');

		(checkboxEl().element() as HTMLElement).focus();
		expect(document.activeElement).toBe(checkboxEl().element());

		await userEvent.keyboard('{Enter}');
		await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
		await userEvent.keyboard('{Space}');
		await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'true');
		await checkboxEl().click();
		await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
	});

	describe('native Svelte', () => {
		it('one-way checked sets the value, clicks override it until the owner changes it', async () => {
			render(CheckboxBindHarness, { bound: false });
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			const box = checkboxEl('Notifications');

			await owner.click();
			await expect.element(box).toHaveAttribute('aria-checked', 'true');
			await box.click();
			await expect.element(box).toHaveAttribute('aria-checked', 'false');
			await expect.element(owner).toBeChecked();
			await owner.click();
			await owner.click();
			await expect.element(box).toHaveAttribute('aria-checked', 'true');
		});

		it('preventDefault in onclick skips the checkbox handler', async () => {
			const handleChange = vi.fn();
			render(Checkbox.Root, {
				onclick: (event: MouseEvent) => event.preventDefault(),
				onCheckedChange: handleChange
			});

			clickCheckbox();

			expect(handleChange).not.toHaveBeenCalled();
			await expect.element(checkboxEl()).toHaveAttribute('aria-checked', 'false');
		});

		it('passes consumer attachments to the default host', async () => {
			render(CheckboxAttachHarness);

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
			await checkboxEl().click();
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(CheckboxAttachHarness, { custom: true });
			const host = page.getByRole('checkbox', { name: 'Custom' });

			await expect.element(host).toHaveAttribute('data-state', 'off');
			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await host.click();
			await expect.element(host).toHaveAttribute('aria-checked', 'true');
			await expect.element(host).toHaveAttribute('data-state', 'on');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('checkbox');
});
