// Assertions follow Base UI v1.8.0
// packages/react/src/switch/root/SwitchRoot.test.tsx and
// packages/react/src/switch/thumb/SwitchThumb.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field, Form error clearing, and labelable-provider registration are not ported.
// Form cases below use the hidden input with a native <form>.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SwitchAttachHarness from '../../tests/SwitchAttachHarness.svelte';
import SwitchBindHarness from '../../tests/SwitchBindHarness.svelte';
import SwitchClickHarness from '../../tests/SwitchClickHarness.svelte';
import SwitchFormHarness from '../../tests/SwitchFormHarness.svelte';
import SwitchLabelHarness from '../../tests/SwitchLabelHarness.svelte';
import SwitchStyleHarness from '../../tests/SwitchStyleHarness.svelte';
import { Switch } from './index.js';

function switchEl() {
	return page.getByRole('switch');
}

// An empty switch has no layout box, so Playwright will not pointer-click it.
// HTMLElement.click() is the testing-library path the upstream tests use.
function clickSwitch(init?: MouseEventInit) {
	const element = switchEl().element() as HTMLElement;
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

describe('Switch', () => {
	describe('interactions', () => {
		it('should change its state when clicked', async () => {
			render(Switch.Root);

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			clickSwitch();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('should update its state when changed from outside', async () => {
			render(SwitchBindHarness);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			await owner.click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
			await owner.click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
		});

		it('should update its state if the underlying input is toggled', async () => {
			render(Switch.Root);

			hiddenInput().click();

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('ignores a hidden input click canceled before the handler runs', async () => {
			const handleCheckedChange = vi.fn();
			render(Switch.Root, { onCheckedChange: handleCheckedChange });

			const event = new MouseEvent('click', { bubbles: true, cancelable: true });
			event.preventDefault();
			hiddenInput().dispatchEvent(event);

			expect(handleCheckedChange).not.toHaveBeenCalled();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it.each(['Enter', 'Space'])('can be activated with %s key', async (key) => {
			render(Switch.Root);

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			(switchEl().element() as HTMLElement).focus();
			await userEvent.keyboard(`{${key}}`);
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('extra props', () => {
		it('should override the built-in attributes', async () => {
			render(Switch.Root, { role: 'checkbox', 'data-testid': 'switch' });
			await expect.element(page.getByTestId('switch')).toHaveAttribute('role', 'checkbox');
		});

		it('sets aria-labelledby from a sibling label associated with the hidden input', async () => {
			render(SwitchLabelHarness, { scenario: 'sibling' });

			const label = page.getByText('Label');
			await expect.poll(() => label.element().id).not.toBe('');
			await expect.element(switchEl()).toHaveAttribute('aria-labelledby', label.element().id);
		});

		it('updates fallback aria-labelledby when the hidden input id changes', async () => {
			render(SwitchLabelHarness, { scenario: 'switch-id' });

			const labelA = page.getByText('Label A');
			await expect.poll(() => labelA.element().id).not.toBe('');
			await expect.element(switchEl()).toHaveAttribute('aria-labelledby', labelA.element().id);

			await page.getByRole('button', { name: 'Toggle' }).click();

			const labelB = page.getByText('Label B');
			await expect.poll(() => labelB.element().id).not.toBe('');
			expect(labelA.element().id).not.toBe(labelB.element().id);
			await expect.element(switchEl()).toHaveAttribute('aria-labelledby', labelB.element().id);
		});
	});

	describe('prop: onCheckedChange', () => {
		it('should call onCheckedChange when clicked', async () => {
			const handleChange = vi.fn();
			render(Switch.Root, { onCheckedChange: handleChange });

			clickSwitch();

			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange.mock.calls[0]?.[0]).toBe(true);
		});

		it('should report keyboard modifier event properties when calling onCheckedChange', async () => {
			const handleChange = vi.fn();
			render(Switch.Root, { onCheckedChange: handleChange });

			clickSwitch({ shiftKey: true });

			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange.mock.calls[0]?.[1].event.shiftKey).toBe(true);
		});

		it('does not change state when canceled via a root click', async () => {
			render(Switch.Root, {
				onCheckedChange: (_checked: boolean, eventDetails: { cancel: () => void }) =>
					eventDetails.cancel()
			});

			clickSwitch();

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});

		it('does not change state when canceled via a hidden input click', async () => {
			render(Switch.Root, {
				onCheckedChange: (_checked: boolean, eventDetails: { cancel: () => void }) =>
					eventDetails.cancel()
			});

			hiddenInput().click();

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});
	});

	describe('prop: onclick', () => {
		it('should call onclick when clicked', async () => {
			const handleClick = vi.fn();
			render(Switch.Root, { onclick: handleClick });

			clickSwitch();

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('propagates a single click event to ancestors per user click', async () => {
			render(SwitchClickHarness, { scenario: 'bubble' });

			await switchEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('does not propagate to ancestors when stopPropagation() is called', async () => {
			render(SwitchClickHarness, { scenario: 'stop' });

			await switchEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('propagates a single click event to ancestors with a native button', async () => {
			render(SwitchClickHarness, { scenario: 'native' });

			await switchEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('1');
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('does not propagate to ancestors when stopPropagation() is called with a native button', async () => {
			render(SwitchClickHarness, { scenario: 'native-stop' });

			await switchEl().click();

			await expect.element(page.getByTestId('parent-clicks')).toHaveTextContent('0');
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('prop: disabled', () => {
		it('uses aria-disabled instead of HTML disabled', async () => {
			render(Switch.Root, { disabled: true });
			await expect.element(switchEl()).not.toHaveAttribute('disabled');
			await expect.element(switchEl()).toHaveAttribute('aria-disabled', 'true');
		});

		it('should not have the disabled attribute when disabled is not set', async () => {
			render(Switch.Root);
			await expect.element(switchEl()).not.toHaveAttribute('disabled');
		});

		it('should not change its state when clicked', async () => {
			render(Switch.Root, { disabled: true });

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			(switchEl().element() as HTMLElement).click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
		});
	});

	describe('prop: readOnly', () => {
		it('should have the aria-readonly attribute', async () => {
			render(Switch.Root, { readOnly: true });
			await expect.element(switchEl()).toHaveAttribute('aria-readonly', 'true');
		});

		it('should not have the aria attribute when readOnly is not set', async () => {
			render(Switch.Root);
			await expect.element(switchEl()).not.toHaveAttribute('aria-readonly');
		});

		it('should not change its state when clicked', async () => {
			render(Switch.Root, { readOnly: true });

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			clickSwitch();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
		});

		it('should not change its state when its label is clicked', async () => {
			render(SwitchLabelHarness, { scenario: 'readonly' });

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			(page.getByTestId('label').element() as HTMLElement).click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput().checked).toBe(false);
		});
	});

	describe('prop: required', () => {
		it('should have the aria-required attribute', async () => {
			render(Switch.Root, { required: true });
			await expect.element(switchEl()).toHaveAttribute('aria-required', 'true');
		});

		it('should not have the aria attribute when required is not set', async () => {
			render(Switch.Root);
			await expect.element(switchEl()).not.toHaveAttribute('aria-required');
		});
	});

	it('should place the style hooks on the root and the thumb', async () => {
		render(SwitchStyleHarness);
		const thumb = page.getByTestId('thumb');

		await expect.element(switchEl()).toHaveAttribute('data-checked', '');
		await expect.element(switchEl()).toHaveAttribute('data-disabled', '');
		await expect.element(switchEl()).toHaveAttribute('data-readonly', '');
		await expect.element(switchEl()).toHaveAttribute('data-required', '');
		await expect.element(thumb).toHaveAttribute('data-checked', '');
		await expect.element(thumb).toHaveAttribute('data-disabled', '');
		await expect.element(thumb).toHaveAttribute('data-readonly', '');
		await expect.element(thumb).toHaveAttribute('data-required', '');

		await page.getByRole('button', { name: 'Enable' }).click();
		clickSwitch();

		await expect.element(switchEl()).toHaveAttribute('data-unchecked', '');
		await expect.element(switchEl()).not.toHaveAttribute('data-checked');
		await expect.element(thumb).toHaveAttribute('data-unchecked', '');
		await expect.element(thumb).not.toHaveAttribute('data-checked');
	});

	it('should set the name attribute only on the input', async () => {
		render(Switch.Root, { name: 'switch-name' });

		expect(hiddenInput().getAttribute('name')).toBe('switch-name');
		await expect.element(switchEl()).not.toHaveAttribute('name');
	});

	it('should not set the value attribute by default', async () => {
		render(Switch.Root);
		expect(hiddenInput().hasAttribute('value')).toBe(false);
	});

	it('should set the value attribute only on the input', async () => {
		render(Switch.Root, { value: '1' });

		expect(hiddenInput().getAttribute('value')).toBe('1');
		await expect.element(switchEl()).not.toHaveAttribute('value');
	});

	describe('with native label', () => {
		it('should toggle the switch when a wrapping label is clicked', async () => {
			render(SwitchLabelHarness, { scenario: 'wrap' });

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			await page.getByTestId('label').click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('should toggle the switch when an explicitly linked label is clicked', async () => {
			render(SwitchLabelHarness, { scenario: 'sibling' });

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			await page.getByText('Label').click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('should associate id with the native button when nativeButton is true', async () => {
			render(SwitchLabelHarness, { scenario: 'native' });

			await expect.element(switchEl()).toHaveAttribute('id', 'mySwitch');
			expect(hiddenInput().getAttribute('id')).not.toBe('mySwitch');

			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			await page.getByTestId('label').click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('form submission', () => {
		it('should include the switch value in form submission, matching a native checkbox', async () => {
			render(SwitchFormHarness, { scenario: 'plain' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null]);

			clickSwitch();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null, 'on']);
		});

		it('submits to an external form when form is provided', async () => {
			render(SwitchFormHarness, { scenario: 'external' });

			clickSwitch();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['on']);
		});

		it('submits uncheckedValue to an external form when off', async () => {
			render(SwitchFormHarness, { scenario: 'unchecked-external' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['off']);
		});

		it('does not submit uncheckedValue when disabled', async () => {
			render(SwitchFormHarness, { scenario: 'disabled' });

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual([null]);
		});

		it('submits custom value and uncheckedValue across an off/on/off cycle', async () => {
			render(SwitchFormHarness, { scenario: 'cycle' });

			await page.getByRole('button', { name: 'Submit' }).click();
			clickSwitch();
			await page.getByRole('button', { name: 'Submit' }).click();
			clickSwitch();
			await page.getByRole('button', { name: 'Submit' }).click();

			await expect.poll(() => values()).toEqual(['no', 'yes', 'no']);
		});

		it('triggers native HTML validation on submit', async () => {
			render(SwitchFormHarness, { scenario: 'required' });

			expect(hiddenInput().validity.valueMissing).toBe(true);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');

			clickSwitch();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			expect(values()).toEqual(['on']);
		});
	});

	describe('Thumb', () => {
		it('throws a descriptive error when rendered outside Switch.Root', async () => {
			await expect(async () => {
				await render(Switch.Thumb);
			}).rejects.toThrow(
				'Base UI: SwitchRootContext is missing. Switch parts must be placed within <Switch.Root>.'
			);
		});
	});

	it('can render a native button', async () => {
		render(SwitchClickHarness, { scenario: 'native' });

		expect(switchEl().element().tagName).toBe('BUTTON');
		await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
		await expect.element(switchEl()).toHaveAttribute('type', 'button');

		(switchEl().element() as HTMLElement).focus();
		expect(document.activeElement).toBe(switchEl().element());

		await userEvent.keyboard('{Enter}');
		await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		await userEvent.keyboard('{Space}');
		await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
		await switchEl().click();
		await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
	});

	describe('native Svelte', () => {
		it('one-way checked sets the value, clicks override it until the owner changes it', async () => {
			render(SwitchBindHarness, { bound: false });
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });

			await owner.click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
			await switchEl().click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
			await expect.element(owner).toBeChecked();
			await owner.click();
			await owner.click();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'true');
		});

		it('preventDefault in onclick skips the switch handler', async () => {
			const handleChange = vi.fn();
			render(Switch.Root, {
				onclick: (event: MouseEvent) => event.preventDefault(),
				onCheckedChange: handleChange
			});

			clickSwitch();

			expect(handleChange).not.toHaveBeenCalled();
			await expect.element(switchEl()).toHaveAttribute('aria-checked', 'false');
		});

		it('passes consumer attachments to the default host', async () => {
			render(SwitchAttachHarness);

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
			await switchEl().click();
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(SwitchAttachHarness, { custom: true });
			const host = page.getByRole('switch', { name: 'Custom' });

			await expect.element(host).toHaveAttribute('data-state', 'off');
			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await host.click();
			await expect.element(host).toHaveAttribute('aria-checked', 'true');
			await expect.element(host).toHaveAttribute('data-state', 'on');
		});
	});
});
