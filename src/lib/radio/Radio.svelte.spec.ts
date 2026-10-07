// Assertions follow Base UI v1.8.0
// packages/react/src/radio/root/RadioRoot.test.tsx and
// packages/react/src/radio/indicator/RadioIndicator.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field and RadioGroup are not ported. Group cases below set the context Radio.Root
// already reads. Arrow-key roving focus belongs to RadioGroup and is not covered.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RadioAttachHarness from '../../tests/RadioAttachHarness.svelte';
import RadioClickHarness from '../../tests/RadioClickHarness.svelte';
import RadioFormHarness from '../../tests/RadioFormHarness.svelte';
import RadioGroupHarness from '../../tests/RadioGroupHarness.svelte';
import RadioIndicatorHarness from '../../tests/RadioIndicatorHarness.svelte';
import RadioLabelHarness from '../../tests/RadioLabelHarness.svelte';
import RadioStyleHarness from '../../tests/RadioStyleHarness.svelte';
import { Radio } from './index.js';

const ENDING_CSS = `
	@keyframes radio-test-anim { to { opacity: 0; } }
	.animation-test-indicator[data-ending-style] { animation: radio-test-anim 40ms; }
`;

function radioEl(name?: string) {
	return name ? page.getByRole('radio', { name }) : page.getByRole('radio');
}

function clickRadio(name?: string) {
	(radioEl(name).element() as HTMLElement).click();
}

function hiddenInputs() {
	return [...document.querySelectorAll('input[type="radio"][aria-hidden="true"]')].filter(
		(node): node is HTMLInputElement => node instanceof HTMLInputElement
	);
}

function hiddenInput() {
	const input = hiddenInputs()[0];
	if (!input) throw new Error('expected a hidden radio');
	return input;
}

function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as {
		value: string;
		reason: string;
		canceled: boolean;
	}[];
}

function groupValue() {
	return page.getByTestId('value').element().textContent ?? '';
}

function indicatorCount() {
	return document.querySelectorAll('[data-testid^="indicator"]').length;
}

describe('Radio', () => {
	describe('without a group', () => {
		it('is checked only when value is the empty string', async () => {
			render(Radio.Root, { value: '' });

			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'true');
			await expect.element(radioEl()).toHaveAttribute('data-checked', '');
			await expect.element(radioEl()).toHaveAttribute('data-composite-item-active', '');
			expect(hiddenInput().checked).toBe(true);
			expect(hiddenInput().value).toBe('');
		});

		it('stays unchecked for any other value, including after click and Space', async () => {
			render(Radio.Root, { value: 'blue' });

			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
			await expect.element(radioEl()).toHaveAttribute('data-unchecked', '');
			await expect.element(radioEl()).not.toHaveAttribute('data-checked');
			await expect.element(radioEl()).not.toHaveAttribute('value');
			expect(hiddenInput().checked).toBe(false);
			expect(hiddenInput().value).toBe('blue');

			clickRadio();
			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);

			(radioEl().element() as HTMLElement).focus();
			await userEvent.keyboard('{Space}');
			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it('does not activate with Enter and does not submit the form', async () => {
			render(RadioFormHarness, { scenario: 'enter' });

			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
			(radioEl().element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');
			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');
		});

		it('serializes null as an empty input value without selecting the radio', async () => {
			render(Radio.Root, { value: null });

			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().value).toBe('');
			expect(hiddenInput().checked).toBe(false);
		});

		it('serializes numbers and objects onto the hidden input only', async () => {
			render(Radio.Root, { value: { id: 1 } });

			expect(hiddenInput().value).toBe('{"id":1}');
			await expect.element(radioEl()).not.toHaveAttribute('value');
		});
	});

	describe('in a group', () => {
		it('sets checked and unchecked data attributes', async () => {
			render(RadioGroupHarness, { scenario: 'select' });

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('data-checked', '');
			await expect.element(page.getByTestId('radio-a')).not.toHaveAttribute('data-unchecked');
			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('data-unchecked', '');
			await expect.element(page.getByTestId('radio-b')).not.toHaveAttribute('data-checked');
		});

		it('does not forward the value prop', async () => {
			render(RadioGroupHarness, { scenario: 'select' });
			await expect.element(page.getByTestId('radio-a')).not.toHaveAttribute('value');
		});

		it('selects the clicked radio and clears the previous one', async () => {
			render(RadioGroupHarness, { scenario: 'select' });

			clickRadio('B');

			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInputs().map((input) => input.checked)).toEqual([false, true]);
			expect(groupValue()).toBe('"b"');
			expect(calls()).toEqual([{ value: '"b"', reason: 'none', canceled: false }]);
		});

		it('allows a null value', async () => {
			render(RadioGroupHarness, { scenario: 'null' });

			clickRadio('None');
			await expect.element(page.getByTestId('radio-null')).toHaveAttribute('aria-checked', 'true');
			expect(groupValue()).toBe('null');

			clickRadio('A');
			await expect.element(page.getByTestId('radio-null')).toHaveAttribute('aria-checked', 'false');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
		});

		it('keeps the previous value when the change is canceled', async () => {
			render(RadioGroupHarness, { scenario: 'cancel' });

			clickRadio('B');

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInputs()[1]?.checked).toBe(false);
			expect(calls()).toEqual([{ value: '"b"', reason: 'none', canceled: true }]);
		});

		it('selects by the value reference passed to the group', async () => {
			render(RadioGroupHarness, { scenario: 'object' });

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'false');
			clickRadio('One');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
			expect(hiddenInputs()[0]?.value).toBe('{"id":1}');

			clickRadio('Two');
			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'false');
		});

		it('selects the hidden input that was clicked', async () => {
			render(RadioGroupHarness, { scenario: 'select' });

			hiddenInputs()[1]?.click();

			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
		});

		it('associates id with the native button when nativeButton is true', async () => {
			render(RadioGroupHarness, { scenario: 'native' });

			const radioA = page.getByTestId('radio-a');
			await expect.element(radioA).toHaveAttribute('id', 'myRadio');
			expect(hiddenInputs()[0]?.id).not.toBe('myRadio');
			expect(radioA.element().tagName).toBe('BUTTON');

			await expect.element(radioA).toHaveAttribute('aria-checked', 'false');
			await page.getByTestId('label').click();
			await expect.element(radioA).toHaveAttribute('aria-checked', 'true');
		});

		it('selects a radio when its wrapping label is clicked', async () => {
			render(RadioGroupHarness, { scenario: 'label' });

			await page.getByText('Pick A').click();
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
			expect(calls()).toHaveLength(1);
		});

		it('selects the radio that receives focus while the group is touched', async () => {
			render(RadioGroupHarness, { scenario: 'touched' });

			(page.getByTestId('radio-b').element() as HTMLElement).focus();

			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
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
			expect(hiddenInputs().every((input) => input.name === 'color')).toBe(true);
		});

		it('blocks submit until a required group has a selection', async () => {
			render(RadioGroupHarness, { scenario: 'required' });

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('data-required', '');
			await expect.element(page.getByTestId('radio-a')).not.toHaveAttribute('aria-required');
			expect(hiddenInputs()[0]?.validity.valueMissing).toBe(true);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');

			clickRadio('A');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			expect(page.getByTestId('values').element().textContent).toContain('["a"]');
		});
	});

	describe('extra props', () => {
		it('should override the built-in attributes', async () => {
			render(Radio.Root, { value: 'a', role: 'checkbox', 'data-testid': 'radio' });
			await expect.element(page.getByTestId('radio')).toHaveAttribute('role', 'checkbox');
		});

		it('sets aria-labelledby from a sibling label associated with the hidden input', async () => {
			render(RadioLabelHarness, { scenario: 'sibling' });

			const label = page.getByText('Label');
			await expect.poll(() => label.element().id).not.toBe('');
			await expect.element(radioEl()).toHaveAttribute('aria-labelledby', label.element().id);
		});

		it('updates fallback aria-labelledby when the hidden input id changes', async () => {
			render(RadioLabelHarness, { scenario: 'radio-id' });

			const labelA = page.getByText('Label A');
			await expect.poll(() => labelA.element().id).not.toBe('');
			await expect.element(radioEl()).toHaveAttribute('aria-labelledby', labelA.element().id);

			await page.getByRole('button', { name: 'Toggle' }).click();

			const labelB = page.getByText('Label B');
			await expect.poll(() => labelB.element().id).not.toBe('');
			expect(labelA.element().id).not.toBe(labelB.element().id);
			await expect.element(radioEl()).toHaveAttribute('aria-labelledby', labelB.element().id);
		});
	});

	describe('prop: onclick', () => {
		it('propagates a single click event to ancestors per user click', async () => {
			render(RadioGroupHarness, { scenario: 'bubble' });

			await page.getByTestId('radio-a').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
		});

		it('does not propagate to ancestors when stopPropagation() is called', async () => {
			render(RadioGroupHarness, { scenario: 'stop' });

			clickRadio('A');

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
		});

		it('propagates a single click event to ancestors with a native button', async () => {
			render(RadioGroupHarness, { scenario: 'native-bubble' });

			await page.getByTestId('radio-a').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
		});

		it('does not propagate to ancestors when stopPropagation() is called with a native button', async () => {
			render(RadioGroupHarness, { scenario: 'native-stop' });

			clickRadio('A');

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
		});

		it('propagates one click and does not select a radio that has no group', async () => {
			render(RadioClickHarness, { scenario: 'bubble' });

			await page.getByRole('radio').click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(radioEl()).toHaveAttribute('aria-checked', 'false');
		});
	});

	describe('prop: disabled', () => {
		it('uses aria-disabled instead of HTML disabled', async () => {
			render(Radio.Root, { value: 'a', disabled: true });
			await expect.element(radioEl()).not.toHaveAttribute('disabled');
			await expect.element(radioEl()).toHaveAttribute('aria-disabled', 'true');
			await expect.element(radioEl()).toHaveAttribute('data-disabled', '');
			expect(hiddenInput().disabled).toBe(true);
		});

		it('does not change a grouped radio when clicked', async () => {
			render(RadioGroupHarness, { scenario: 'disabled' });

			clickRadio('B');

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
			expect(calls()).toEqual([]);
			expect(hiddenInputs().every((input) => input.disabled)).toBe(true);
		});
	});

	describe('prop: readOnly', () => {
		it('sets data-readonly and the hidden input without aria-readonly', async () => {
			render(Radio.Root, { value: 'a', readOnly: true });
			await expect.element(radioEl()).not.toHaveAttribute('aria-readonly');
			await expect.element(radioEl()).toHaveAttribute('data-readonly', '');
			expect(hiddenInput().readOnly).toBe(true);
		});

		it('should not have the readonly hook when readOnly is not set', async () => {
			render(Radio.Root, { value: 'a' });
			await expect.element(radioEl()).not.toHaveAttribute('data-readonly');
			expect(hiddenInput().readOnly).toBe(false);
		});

		it('does not change a grouped radio when clicked', async () => {
			render(RadioGroupHarness, { scenario: 'readonly' });

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
			clickRadio('B');
			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toEqual([]);
			expect(hiddenInputs()[1]?.checked).toBe(false);
		});
	});

	describe('prop: required', () => {
		it('sets data-required and the hidden input without aria-required', async () => {
			render(Radio.Root, { value: 'a', required: true });
			await expect.element(radioEl()).not.toHaveAttribute('aria-required');
			await expect.element(radioEl()).toHaveAttribute('data-required', '');
			expect(hiddenInput().required).toBe(true);
		});

		it('should not have the required hook when required is not set', async () => {
			render(Radio.Root, { value: 'a' });
			await expect.element(radioEl()).not.toHaveAttribute('data-required');
		});

		it('does not block submit for a required radio that has no name', async () => {
			render(RadioFormHarness, { scenario: 'required' });

			expect(hiddenInput().required).toBe(true);
			expect(hiddenInput().validity.valueMissing).toBe(false);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		});

		it('submits a standalone required radio whose value is empty', async () => {
			render(RadioFormHarness, { scenario: 'required-checked' });

			expect(hiddenInput().validity.valueMissing).toBe(false);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		});
	});

	it('should place the style hooks on the root and the indicator', async () => {
		render(RadioStyleHarness);
		const indicator = page.getByTestId('indicator');

		await expect.element(radioEl()).toHaveAttribute('data-checked', '');
		await expect.element(radioEl()).toHaveAttribute('data-disabled', '');
		await expect.element(radioEl()).toHaveAttribute('data-readonly', '');
		await expect.element(radioEl()).toHaveAttribute('data-required', '');
		await expect.element(indicator).toHaveAttribute('data-checked', '');
		await expect.element(indicator).toHaveAttribute('data-disabled', '');

		await page.getByRole('button', { name: 'Enable' }).click();

		await expect.element(radioEl()).toHaveAttribute('data-unchecked', '');
		await expect.element(radioEl()).not.toHaveAttribute('data-checked');
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

			await expect.element(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toEqual([]);
		});

		it('passes consumer attachments to the default host', async () => {
			render(RadioAttachHarness);

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
			await radioEl().click();
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(RadioAttachHarness, { custom: true });
			const host = page.getByRole('radio', { name: 'Custom' });

			await expect.element(host).toHaveAttribute('data-state', 'on');
			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await expect.element(host).toHaveAttribute('aria-checked', 'true');
		});
	});
});
