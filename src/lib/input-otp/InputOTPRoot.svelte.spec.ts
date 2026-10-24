// Assertions follow input-otp v1.4.2 apps/test/src/tests/*.spec.ts
// (commit 81ccdb48c010d800b24942aa231909f0c971b1ca). MIT, see THIRD_PARTY_NOTICES.md.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createAttachmentKey } from 'svelte/attachments';
import InputOTPHarness from '../../tests/InputOTPHarness.svelte';
import InputOTPContextHarness from '../../tests/InputOTPContextHarness.svelte';

const input = () => page.getByRole('textbox');

// userEvent sends keys faster than selectionchange can widen the caret, so each step waits for
// the selection the slots mirror before the next key.
async function selected(start: number, end: number) {
	await expect.element(input()).toHaveAttribute('data-input-otp-mss', String(start));
	await expect.element(input()).toHaveAttribute('data-input-otp-mse', String(end));
	await expect
		.poll(() => {
			const field = input().element() as HTMLInputElement;
			return [field.selectionStart, field.selectionEnd];
		})
		.toEqual([start, end]);
}

describe('InputOTP', () => {
	describe('Base tests - Typing', () => {
		it('should start as empty value', async () => {
			render(InputOTPHarness);

			await expect.element(input()).toHaveValue('');
		});

		it('should change the input value', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '1');
			await expect.element(input()).toHaveValue('1');

			await userEvent.keyboard('23456');
			await expect.element(input()).toHaveValue('123456');
		});

		it('should prevent typing greater than max length', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '123456');
			await selected(5, 6);
			await userEvent.keyboard('7');
			await expect.element(input()).toHaveValue('123457');
		});
	});

	describe('Base tests - Selections', () => {
		it('should replace selected char if another is pressed', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '123');
			await userEvent.keyboard('{ArrowLeft}');
			await selected(2, 3);
			await userEvent.keyboard('1');
			await expect.element(input()).toHaveValue('121');
		});

		it('should replace multi-selected chars if another is pressed', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '123456');
			await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}');
			await userEvent.keyboard('1');
			await expect.element(input()).toHaveValue('1231');
		});

		it('should replace last char if another one is pressed', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '123456');
			await selected(5, 6);
			await userEvent.keyboard('7');
			await expect.element(input()).toHaveValue('123457');
		});
	});

	describe('Backspace', () => {
		it('should backspace previous word (even if there is not a selected character)', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '1234');
			await expect.element(input()).toHaveValue('1234');

			await userEvent.keyboard('{Control>}{Backspace}{/Control}');
			await expect.element(input()).toHaveValue('');
		});

		it('should backspace selected char', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '123456');
			await expect.element(input()).toHaveValue('123456');

			await selected(5, 6);
			await userEvent.keyboard('{ArrowLeft}');
			await selected(4, 5);
			await userEvent.keyboard('{ArrowLeft}');
			await selected(3, 4);
			await userEvent.keyboard('{Control>}{Backspace}{/Control}');
			await expect.element(input()).toHaveValue('12356');
		});
	});

	describe('Delete', () => {
		it('should forward-delete character when pressing delete', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '123456');
			await expect.element(input()).toHaveValue('123456');

			await selected(5, 6);
			await userEvent.keyboard('{Delete}');
			await expect.element(input()).toHaveValue('12345');
			await selected(5, 5);
			for (const start of [4, 3, 2, 1, 0]) {
				await userEvent.keyboard('{ArrowLeft}');
				await selected(start, start + 1);
			}
			await userEvent.keyboard('{Delete}');
			await expect.element(input()).toHaveValue('2345');
			await selected(0, 1);
			await userEvent.keyboard('{ArrowRight}');
			await selected(1, 2);
			await userEvent.keyboard('{ArrowRight}');
			await selected(2, 3);
			await userEvent.keyboard('{Delete}');
			await expect.element(input()).toHaveValue('235');
		});
	});

	describe('Base tests - Slots', () => {
		it('should expose the slot value', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '1');
			await expect.element(input()).toHaveValue('1');

			await expect.element(page.getByTestId('slot-0')).toHaveAttribute('data-test-char', '1');
			await expect.element(page.getByTestId('slot-1')).not.toHaveAttribute('data-test-char');

			await userEvent.keyboard('23456');
			await expect.element(input()).toHaveValue('123456');

			for (const [index, char] of ['2', '3', '4', '5', '6'].entries()) {
				await expect
					.element(page.getByTestId(`slot-${index + 1}`))
					.toHaveAttribute('data-test-char', char);
			}
		});
	});

	describe('Base tests - Render', () => {
		it('should expose focus flags', async () => {
			render(InputOTPHarness);
			const renderer = page.getByTestId('input-otp-renderer');

			(input().element() as HTMLInputElement).focus();
			await expect.element(renderer).toHaveAttribute('data-test-render-is-focused', 'true');

			(input().element() as HTMLInputElement).blur();
			await expect.element(renderer).not.toHaveAttribute('data-test-render-is-focused');
		});

		it('should expose hover flags', async () => {
			render(InputOTPHarness);
			const renderer = page.getByTestId('input-otp-renderer');

			await expect.element(renderer).not.toHaveAttribute('data-test-render-is-hovering');

			await userEvent.hover(input());
			await expect.element(renderer).toHaveAttribute('data-test-render-is-hovering', 'true');
		});
	});

	describe('Props tests', () => {
		it('should receive props accordingly', async () => {
			render(InputOTPHarness, { 'data-testid': 'input-otp-1', disabled: true });
			render(InputOTPHarness, { 'data-testid': 'input-otp-2', inputmode: 'numeric' });
			render(InputOTPHarness, { 'data-testid': 'input-otp-3', inputmode: 'text' });
			render(InputOTPHarness, { 'data-testid': 'input-otp-4', containerClass: 'testclassname' });
			render(InputOTPHarness, { 'data-testid': 'input-otp-5', maxlength: 3 });
			render(InputOTPHarness, { 'data-testid': 'input-otp-6', id: 'testid', name: 'testname' });
			render(InputOTPHarness, { 'data-testid': 'input-otp-7', pattern: ' ' });
			const container4 = page
				.getByTestId('input-otp-4')
				.element()
				.closest('[data-input-otp-container]');

			await expect.element(page.getByTestId('input-otp-1')).toBeDisabled();
			await expect.element(page.getByTestId('input-otp-2')).toHaveAttribute('inputmode', 'numeric');
			await expect.element(page.getByTestId('input-otp-3')).toHaveAttribute('inputmode', 'text');
			expect(container4?.getAttribute('class')).toBe('testclassname');
			await expect.element(page.getByTestId('input-otp-5')).toHaveAttribute('maxLength', '3');
			await expect.element(page.getByTestId('input-otp-6')).toHaveAttribute('id', 'testid');
			await expect.element(page.getByTestId('input-otp-6')).toHaveAttribute('name', 'testname');
			await expect.element(page.getByTestId('input-otp-7')).toHaveAttribute('pattern', ' ');
		});
	});

	describe('With autofocus tests', () => {
		it('should autofocus', async () => {
			render(InputOTPHarness, { autofocus: true });

			await expect.element(input()).toHaveFocus();
		});
	});

	describe('With on complete tests', () => {
		it('should change the input value', async () => {
			render(InputOTPHarness, { disableOnComplete: true });

			await userEvent.type(input(), '123456');
			await expect.element(input()).toHaveValue('123456');

			await expect.element(input()).toBeDisabled();
		});
	});

	describe('native Svelte', () => {
		it('binds the value and calls onComplete once when the last slot fills', async () => {
			const onComplete = vi.fn();
			render(InputOTPHarness, { onComplete });

			await userEvent.type(input(), '12345');
			await expect.element(page.getByTestId('value')).toHaveTextContent('12345');
			expect(onComplete).not.toHaveBeenCalled();

			await userEvent.keyboard('6');
			await expect.element(page.getByTestId('value')).toHaveTextContent('123456');
			expect(onComplete).toHaveBeenCalledExactlyOnceWith('123456');

			await userEvent.keyboard('7');
			await expect.element(input()).toHaveValue('123457');
			expect(onComplete).toHaveBeenCalledOnce();
		});

		it('drops input that does not match the pattern', async () => {
			render(InputOTPHarness, { pattern: '^\\d+$' });

			await userEvent.type(input(), '1a2');
			await expect.element(input()).toHaveValue('12');
		});

		it('shows placeholder characters only while the value is empty', async () => {
			render(InputOTPHarness, { placeholder: '••••••' });

			await expect.element(page.getByTestId('slot-0')).toHaveTextContent('•');
			await userEvent.type(input(), '1');
			await expect.element(page.getByTestId('slot-1')).not.toHaveTextContent('•');
		});

		it('marks the active empty slot with a fake caret', async () => {
			render(InputOTPHarness);

			await userEvent.type(input(), '12');
			await expect.element(page.getByTestId('slot-2')).toHaveAttribute('data-test-active', 'true');
			await expect.element(page.getByTestId('slot-2')).toHaveAttribute('data-test-caret', 'true');
			await expect.element(page.getByTestId('slot-1')).not.toHaveAttribute('data-test-active');
		});

		it('rewrites pasted text with pasteTransformer', async () => {
			render(InputOTPHarness, { pasteTransformer: (pasted: string) => pasted.replaceAll('-', '') });
			const field = input().element() as HTMLInputElement;
			field.focus();

			const clipboardData = new DataTransfer();
			clipboardData.setData('text/plain', '12-34');
			field.dispatchEvent(
				new ClipboardEvent('paste', { clipboardData, cancelable: true, bubbles: true })
			);

			await expect.element(input()).toHaveValue('1234');
			await expect.element(page.getByTestId('value')).toHaveTextContent('1234');
		});

		it('passes consumer attachments to the input', async () => {
			let attached: HTMLElement | null = null;
			render(InputOTPHarness, {
				[createAttachmentKey()]: (node: HTMLElement) => {
					attached = node;
				}
			});

			await expect.element(input()).toBeInTheDocument();
			expect(attached).toBe(input().element());
		});

		it('gives slots rendered as children the state through context', async () => {
			render(InputOTPContextHarness, { defaultValue: '12' });

			await expect.element(input()).toHaveValue('12');
			await expect.element(page.getByTestId('slot-1')).toHaveTextContent('2');
			(input().element() as HTMLInputElement).focus();
			await expect.element(page.getByTestId('slot-2')).toHaveAttribute('data-active', 'true');
		});
	});
});
