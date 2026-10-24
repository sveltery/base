// Each case runs against the Svelte InputOTP and the React input-otp 1.4.2 reference.
// The tests follow input-otp v1.4.2 apps/test/src/tests/*.spec.ts
// (commit 81ccdb48c010d800b24942aa231909f0c971b1ca). MIT, see THIRD_PARTY_NOTICES.md.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import type { InputOTPCase } from './cases.js';

function open(page: Page, scenario: InputOTPCase, reference: boolean) {
	return openFixture(page, 'input-otp', scenario, reference);
}

// Upstream's keys reach a local dev build slower than selectionchange. On a busy runner a key can
// land first, so each step waits for the selection the slots mirror before the next key.
async function selected(input: Locator, start: number, end: number) {
	await expect(input).toHaveAttribute('data-input-otp-mss', String(start));
	await expect(input).toHaveAttribute('data-input-otp-mse', String(end));
	await expect
		.poll(() => input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd]))
		.toEqual([start, end]);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test.describe('Base tests - Typing', () => {
			test('should start as empty value', async ({ page }) => {
				const { errors } = await open(page, 'base', reference);
				await expect(page.getByRole('textbox')).toHaveValue('');
				expect(errors).toEqual([]);
			});

			test('should change the input value', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('1');
				await expect(input).toHaveValue('1');
				await input.pressSequentially('23456');
				await expect(input).toHaveValue('123456');
			});

			test('should prevent typing greater than max length', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('123456');
				await selected(input, 5, 6);
				await input.press('7');
				await expect(input).toHaveValue('123457');
			});
		});

		test.describe('Base tests - Selections', () => {
			test('should replace selected char if another is pressed', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('123');
				await input.press('ArrowLeft');
				await selected(input, 2, 3);
				await input.pressSequentially('1');
				await expect(input).toHaveValue('121');
			});

			test('should replace multi-selected chars if another is pressed', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('123456');
				await page.waitForTimeout(100);
				await input.press('Shift+ArrowLeft');
				await input.press('Shift+ArrowLeft');
				await page.waitForTimeout(100);
				await input.pressSequentially('1');
				await expect(input).toHaveValue('1231');
			});
		});

		test.describe('Backspace', () => {
			test('should backspace previous word (even if there is not a selected character)', async ({
				page
			}) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('1234');
				await expect(input).toHaveValue('1234');
				await input.press('ControlOrMeta+Backspace');
				await expect(input).toHaveValue('');
			});

			test('should backspace selected char', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('123456');
				await expect(input).toHaveValue('123456');
				await selected(input, 5, 6);
				await input.press('ArrowLeft');
				await selected(input, 4, 5);
				await input.press('ArrowLeft');
				await selected(input, 3, 4);
				await input.press('ControlOrMeta+Backspace');
				await expect(input).toHaveValue('12356');
			});
		});

		test.describe('Delete', () => {
			test('should forward-delete character when pressing delete', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('123456');
				await expect(input).toHaveValue('123456');
				await selected(input, 5, 6);
				await input.press('Delete');
				await expect(input).toHaveValue('12345');
				await selected(input, 5, 5);
				for (const start of [4, 3, 2, 1, 0]) {
					await input.press('ArrowLeft');
					await selected(input, start, start + 1);
				}
				await input.press('Delete');
				await expect(input).toHaveValue('2345');
				await selected(input, 0, 1);
				await input.press('ArrowRight');
				await selected(input, 1, 2);
				await input.press('ArrowRight');
				await selected(input, 2, 3);
				await input.press('Delete');
				await expect(input).toHaveValue('235');
			});
		});

		test.describe('Base tests - Slots', () => {
			test('should expose the slot value', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('1');
				await expect(input).toHaveValue('1');
				await expect(page.getByTestId('slot-0')).toHaveAttribute('data-test-char', '1');
				await expect(page.getByTestId('slot-1')).not.toHaveAttribute('data-test-char');
				await input.pressSequentially('23456');
				await expect(input).toHaveValue('123456');
				for (const [index, char] of ['2', '3', '4', '5', '6'].entries()) {
					await expect(page.getByTestId(`slot-${index + 1}`)).toHaveAttribute(
						'data-test-char',
						char
					);
				}
			});
		});

		test.describe('Base tests - Render', () => {
			test('should expose focus flags', async ({ page }) => {
				await open(page, 'base', reference);
				const input = page.getByRole('textbox');
				const renderer = page.getByTestId('input-otp-renderer');
				await input.focus();
				await expect(renderer).toHaveAttribute('data-test-render-is-focused', 'true');
				await input.blur();
				await page.waitForTimeout(100);
				await expect(renderer).not.toHaveAttribute('data-test-render-is-focused');
			});

			test('should expose hover flags', async ({ page }) => {
				await open(page, 'base', reference);
				const renderer = page.getByTestId('input-otp-renderer');
				await expect(renderer).not.toHaveAttribute('data-test-render-is-hovering');
				const rect = (await renderer.boundingBox({ timeout: 2_000 }))!;
				expect(rect).not.toBeNull();
				await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
				await expect(renderer).toHaveAttribute('data-test-render-is-hovering', 'true');
			});
		});

		test.describe('Props tests', () => {
			test('should receive props accordingly', async ({ page }) => {
				const { errors } = await open(page, 'props', reference);
				const container4 = page.locator(
					`[data-input-otp-container]:has([data-testid="input-otp-4"])`
				);
				await expect(page.getByTestId('input-otp-1')).toBeDisabled();
				await expect(page.getByTestId('input-otp-2')).toHaveAttribute('inputmode', 'numeric');
				await expect(page.getByTestId('input-otp-3')).toHaveAttribute('inputmode', 'text');
				await expect(container4).toHaveClass('testclassname');
				await expect(page.getByTestId('input-otp-5')).toHaveAttribute('maxLength', '3');
				await expect(page.getByTestId('input-otp-6')).toHaveAttribute('id', 'testid');
				await expect(page.getByTestId('input-otp-6')).toHaveAttribute('name', 'testname');
				await expect(page.getByTestId('input-otp-7')).toHaveAttribute('pattern', ' ');
				expect(errors).toEqual([]);
			});
		});

		test.describe('With autofocus tests', () => {
			test('should autofocus', async ({ page }) => {
				await open(page, 'with-autofocus', reference);
				await expect(page.getByRole('textbox')).toBeFocused();
			});
		});

		test.describe('With on complete tests', () => {
			test('should change the input value', async ({ page }) => {
				await open(page, 'with-on-complete', reference);
				const input = page.getByRole('textbox');
				await input.pressSequentially('123456');
				await expect(input).toHaveValue('123456');
				await expect(input).toBeDisabled();
			});
		});
	});
}

test('svelte SSR renders the input with its value and attributes before hydration', async ({
	request
}) => {
	const html = await (await request.get('/fixtures/input-otp?case=props')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('data-input-otp-container="true"');
	expect(html).toMatch(/<input\b[^>]*\sdata-testid="input-otp-5"[^>]*\smaxlength="3"/);
	expect(html).toMatch(/<input\b[^>]*\sautocomplete="one-time-code"/);
});
