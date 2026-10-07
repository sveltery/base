// Assertions follow Base UI v1.8.0 packages/react/src/button/Button.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance is a shared React renderer check and is not ported.
// Cases under "native Svelte" have no upstream counterpart, except the two preserved
// upstream limitations called out below.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Button from './Button.svelte';
import ButtonHarness from '../../tests/ButtonHarness.svelte';

function key(
	target: Element,
	type: 'keydown' | 'keyup',
	keyName: string,
	init: KeyboardEventInit = {}
) {
	const event = new KeyboardEvent(type, {
		key: keyName,
		bubbles: true,
		cancelable: true,
		...init
	});
	target.dispatchEvent(event);
	return event;
}

describe('Button', () => {
	describe('prop: nativeButton', () => {
		it('custom link: Space prevents scrolling and clicks without navigating', async () => {
			window.location.hash = '';
			const handleClick = vi.fn();
			render(ButtonHarness, { variant: 'link', label: 'Go', onclick: handleClick });
			const link = page.getByRole('button', { name: 'Go' });

			expect(link.element().tagName).toBe('A');
			await expect.element(link).toHaveAttribute('href', '#target');
			(link.element() as HTMLElement).focus();

			const down = key(link.element(), 'keydown', ' ');
			expect(down.defaultPrevented).toBe(true);
			key(link.element(), 'keyup', ' ');

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick.mock.calls[0]?.[0].isTrusted).toBe(false);
			// The pinned helper's untrusted click still follows the link on an http page.
			expect(window.location.hash).toBe('#target');
			window.location.hash = '';
		});

		it('custom element: applies button semantics and clicks from Enter and Space', async () => {
			const handleClick = vi.fn();
			const handleRenderClick = vi.fn();
			const handleCaptureClick = vi.fn();
			const handleAncestorClick = vi.fn();
			render(ButtonHarness, {
				variant: 'bubble',
				onclick: handleClick,
				onrender: handleRenderClick,
				oncapture: handleCaptureClick,
				onancestor: handleAncestorClick
			});
			const button = page.getByRole('button', { name: 'Save' });

			expect(button.element().tagName).toBe('SPAN');
			await expect.element(button).toHaveAttribute('role', 'button');
			await expect.element(button).toHaveAttribute('tabindex', '0');

			(button.element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');
			await userEvent.keyboard('{Space}');

			expect(handleCaptureClick).toHaveBeenCalledTimes(2);
			expect(handleRenderClick).toHaveBeenCalledTimes(2);
			expect(handleClick).toHaveBeenCalledTimes(2);
			expect(handleAncestorClick).toHaveBeenCalledTimes(2);
		});

		it('custom element: keyboard clicks carry modifier state', async () => {
			const handleClick = vi.fn();
			render(ButtonHarness, { variant: 'span', onclick: handleClick });
			const button = page.getByRole('button', { name: 'Save' });

			(button.element() as HTMLElement).focus();
			await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleClick.mock.calls[0]?.[0].shiftKey).toBe(true);
			expect(handleClick.mock.calls[0]?.[0].detail).toBe(0);
		});
	});

	describe('prop: disabled', () => {
		it('native button: uses the disabled attribute and is not focusable', async () => {
			const handleClick = vi.fn();
			const handleMouseDown = vi.fn();
			const handlePointerDown = vi.fn();
			const handleKeyDown = vi.fn();
			render(ButtonHarness, {
				disabled: true,
				onclick: handleClick,
				onmousedown: handleMouseDown,
				onpointerdown: handlePointerDown,
				onkeydown: handleKeyDown
			});
			const button = page.getByRole('button', { name: 'Save' });

			await expect.element(button).toHaveAttribute('disabled');
			await expect.element(button).toHaveAttribute('data-disabled', '');
			await expect.element(button).not.toHaveAttribute('aria-disabled');

			(button.element() as HTMLButtonElement).focus();
			expect(document.activeElement).not.toBe(button.element());

			(button.element() as HTMLButtonElement).click();
			await userEvent.keyboard('{Space}');
			await userEvent.keyboard('{Enter}');

			expect(handleClick).not.toHaveBeenCalled();
			expect(handleMouseDown).not.toHaveBeenCalled();
			expect(handlePointerDown).not.toHaveBeenCalled();
			expect(handleKeyDown).not.toHaveBeenCalled();
		});

		it('custom element: applies aria-disabled and is not focusable', async () => {
			const handleClick = vi.fn();
			const handleMouseDown = vi.fn();
			const handlePointerDown = vi.fn();
			const handleKeyDown = vi.fn();
			render(ButtonHarness, {
				variant: 'span',
				disabled: true,
				onclick: handleClick,
				onmousedown: handleMouseDown,
				onpointerdown: handlePointerDown,
				onkeydown: handleKeyDown
			});
			const button = page.getByRole('button', { name: 'Save' });

			await expect.element(button).not.toHaveAttribute('disabled');
			await expect.element(button).toHaveAttribute('data-disabled', '');
			await expect.element(button).toHaveAttribute('aria-disabled', 'true');
			await expect.element(button).toHaveAttribute('tabindex', '-1');

			(button.element() as HTMLElement).focus();
			expect(button.element().tabIndex).toBe(-1);

			(button.element() as HTMLElement).click();
			await userEvent.keyboard('{Space}');
			await userEvent.keyboard('{Enter}');

			expect(handleClick).not.toHaveBeenCalled();
			expect(handleMouseDown).not.toHaveBeenCalled();
			expect(handlePointerDown).not.toHaveBeenCalled();
			expect(handleKeyDown).not.toHaveBeenCalled();
		});
	});

	describe('prop: focusableWhenDisabled', () => {
		it('native button: prevents interactions but remains focusable', async () => {
			const handleClick = vi.fn();
			const handleMouseDown = vi.fn();
			const handlePointerDown = vi.fn();
			const handleKeyDown = vi.fn();
			render(ButtonHarness, {
				disabled: true,
				focusableWhenDisabled: true,
				onclick: handleClick,
				onmousedown: handleMouseDown,
				onpointerdown: handlePointerDown,
				onkeydown: handleKeyDown
			});
			const button = page.getByRole('button', { name: 'Save' });

			await expect.element(button).not.toHaveAttribute('disabled');
			await expect.element(button).toHaveAttribute('data-disabled', '');
			await expect.element(button).toHaveAttribute('aria-disabled', 'true');
			await expect.element(button).toHaveAttribute('tabindex', '0');

			(button.element() as HTMLButtonElement).focus();
			expect(document.activeElement).toBe(button.element());

			(button.element() as HTMLButtonElement).click();
			await userEvent.keyboard('{Space}');
			await userEvent.keyboard('{Enter}');

			expect(handleClick).not.toHaveBeenCalled();
			expect(handleMouseDown).not.toHaveBeenCalled();
			expect(handlePointerDown).not.toHaveBeenCalled();
			expect(handleKeyDown).not.toHaveBeenCalled();
		});

		it('native button: allows hover while blocking activation', async () => {
			const handleClick = vi.fn();
			const handleMouseMove = vi.fn();
			render(ButtonHarness, {
				disabled: true,
				focusableWhenDisabled: true,
				onclick: handleClick,
				onmousemove: handleMouseMove
			});
			const button = page.getByRole('button', { name: 'Save' });

			await userEvent.hover(button);
			expect(handleMouseMove).toHaveBeenCalled();

			(button.element() as HTMLButtonElement).click();
			expect(handleClick).not.toHaveBeenCalled();
		});

		it('keeps focus and suppresses interactions after becoming disabled', async () => {
			const handleClick = vi.fn();
			render(ButtonHarness, { variant: 'becomes-disabled', onclick: handleClick });
			const button = page.getByRole('button', { name: 'Save' });

			(button.element() as HTMLButtonElement).focus();
			expect(document.activeElement).toBe(button.element());

			await button.click();
			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(document.activeElement).toBe(button.element());
			await expect.element(button).toHaveAttribute('aria-disabled', 'true');
			await expect.element(button).not.toHaveAttribute('disabled');

			(button.element() as HTMLButtonElement).click();
			await userEvent.keyboard('{Enter}');
			await userEvent.keyboard('{Space}');

			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(document.activeElement).toBe(button.element());
		});

		it('custom element: prevents interactions but remains focusable', async () => {
			const handleClick = vi.fn();
			const handleMouseDown = vi.fn();
			const handlePointerDown = vi.fn();
			const handleKeyDown = vi.fn();
			const handleFocus = vi.fn();
			const handleBlur = vi.fn();
			render(ButtonHarness, {
				variant: 'span',
				disabled: true,
				focusableWhenDisabled: true,
				withAfter: false,
				onclick: handleClick,
				onmousedown: handleMouseDown,
				onpointerdown: handlePointerDown,
				onkeydown: handleKeyDown,
				onfocus: handleFocus,
				onblur: handleBlur
			});
			const button = page.getByRole('button', { name: 'Save' });

			await expect.element(button).not.toHaveAttribute('disabled');
			await expect.element(button).toHaveAttribute('data-disabled', '');
			await expect.element(button).toHaveAttribute('aria-disabled', 'true');
			await expect.element(button).toHaveAttribute('tabindex', '0');

			(button.element() as HTMLElement).focus();
			expect(document.activeElement).toBe(button.element());
			expect(handleFocus).toHaveBeenCalledTimes(1);

			(button.element() as HTMLElement).click();
			await userEvent.keyboard('{Space}');
			await userEvent.keyboard('{Enter}');

			expect(handleClick).not.toHaveBeenCalled();
			expect(handleMouseDown).not.toHaveBeenCalled();
			expect(handlePointerDown).not.toHaveBeenCalled();
			expect(handleKeyDown).not.toHaveBeenCalled();
		});

		it('Tab leaves a focusable disabled button and blur still runs', async () => {
			const handleBlur = vi.fn();
			render(ButtonHarness, {
				disabled: true,
				focusableWhenDisabled: true,
				withAfter: true,
				onblur: handleBlur
			});
			const button = page.getByRole('button', { name: 'Save' });
			const buttonElement = button.element() as HTMLButtonElement;

			buttonElement.focus();
			expect(document.activeElement).toBe(buttonElement);
			// Tab must not be canceled, or focus could not leave.
			expect(key(buttonElement, 'keydown', 'Tab').defaultPrevented).toBe(false);
			expect(key(buttonElement, 'keydown', 'Enter').defaultPrevented).toBe(true);

			(page.getByRole('button', { name: 'After' }).element() as HTMLButtonElement).focus();
			expect(document.activeElement).not.toBe(buttonElement);
			expect(handleBlur).toHaveBeenCalledTimes(1);
		});
	});

	describe('native Svelte', () => {
		it('defaults to type="button" and keeps an explicit submit type', async () => {
			const blocked = vi.fn();
			render(ButtonHarness, { variant: 'form', onsubmit: blocked });
			const plain = page.getByRole('button', { name: 'Save' });
			await expect.element(plain).toHaveAttribute('type', 'button');
			await plain.click();
			expect(blocked).not.toHaveBeenCalled();
		});

		it('type="submit" submits the form', async () => {
			const submitted = vi.fn();
			render(ButtonHarness, {
				variant: 'form',
				type: 'submit',
				label: 'Submit',
				onsubmit: submitted
			});
			const button = page.getByRole('button', { name: 'Submit' });
			await expect.element(button).toHaveAttribute('type', 'submit');
			await button.click();
			expect(submitted).toHaveBeenCalledTimes(1);
		});

		it('passes form, tabindex and data attributes through', async () => {
			render(Button, { form: 'other', tabindex: 3, 'data-testid': 'save' });
			const button = page.getByTestId('save');
			await expect.element(button).toHaveAttribute('form', 'other');
			await expect.element(button).toHaveAttribute('tabindex', '3');
			await expect.element(button).toHaveAttribute('type', 'button');
		});

		it('passes consumer attachments to the default button', async () => {
			render(ButtonHarness, { variant: 'attach' });
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(ButtonHarness, { variant: 'attach', custom: true, label: 'Custom' });
			const host = page.getByRole('button', { name: 'Custom' });
			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await expect.element(host).toHaveAttribute('data-disabled-state', 'no');
		});

		it('Enter preventDefault skips a custom click; Space keyup preventDefault does too', async () => {
			const handleClick = vi.fn();
			render(ButtonHarness, {
				variant: 'span',
				onclick: handleClick,
				onkeydown: (event) => {
					if (event.key === 'Enter') event.preventDefault();
				},
				onkeyup: (event) => {
					if (event.key === ' ') event.preventDefault();
				}
			});
			const button = page.getByRole('button', { name: 'Save' });
			(button.element() as HTMLElement).focus();

			await userEvent.keyboard('{Enter}');
			await userEvent.keyboard('{Space}');
			expect(handleClick).not.toHaveBeenCalled();
		});

		it('preserves the upstream Space limitation: a prevented keydown still clicks on keyup', async () => {
			const handleClick = vi.fn();
			render(ButtonHarness, {
				variant: 'span',
				onclick: handleClick,
				onkeydown: (event) => {
					if (event.key === ' ') event.preventDefault();
				}
			});
			const button = page.getByRole('button', { name: 'Save' });
			(button.element() as HTMLElement).focus();

			key(button.element(), 'keydown', ' ');
			expect(handleClick).not.toHaveBeenCalled();
			key(button.element(), 'keyup', ' ');
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('preserves issue 66: disabled mousedown does not cancel its default', async () => {
			render(ButtonHarness, { disabled: true, focusableWhenDisabled: true });
			const button = page.getByRole('button', { name: 'Save' }).element();
			const mouse = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
			const pointer = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
			button.dispatchEvent(pointer);
			button.dispatchEvent(mouse);
			expect(pointer.defaultPrevented).toBe(true);
			expect(mouse.defaultPrevented).toBe(false);
		});
	});
});
