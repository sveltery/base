// Kit's `.as()` spread onto each Base control, with the spread as the field's only name.
// `mode=errors` passes Kit's issues to Form `errors`; `mode=match` sets Field.Root `invalid` and
// Field.Error `match` and revalidates on input. `&root` also puts the name on Field.Root.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { debug, error, field, open } from '../../form/shared/helpers.js';

interface Case {
	/** Fixture folder and `?v=` variant. */
	path: string;
	field: string;
	/** Puts in the value the server rejects. */
	bad: (page: Page) => Promise<void>;
	/** Edits it to a value the server accepts. */
	good: (page: Page) => Promise<void>;
	issue: string;
	received: Record<string, unknown>;
	/** The element Kit's `aria-invalid` lands on, or null where the control drops it. */
	invalid: ((page: Page) => Locator) | null;
	/** Without JS: put in the rejected value, check it came back, put in the accepted one. */
	noJs: {
		bad: (page: Page) => Promise<void>;
		restored: (page: Page) => Promise<void>;
		good: (page: Page) => Promise<void>;
	};
}

const testid = (id: string) => (page: Page) => page.getByTestId(id);
const pick = async (page: Page, option: string) => {
	await page.getByTestId('control').click();
	await page.getByRole('option', { name: option }).click();
};
const named = (page: Page, prefix: string) => page.locator(`input[name^="${prefix}/"]`);
/**
 * Sets the named input as the control would. Without JS a composite control can't be edited, so
 * this stands in for one to show what the server does with the post.
 */
const setNamed = (prefix: string, value: string) => (page: Page) =>
	named(page, prefix).evaluate((input: HTMLInputElement, next) => {
		input.value = next;
	}, value);
const label = (text: string) => (page: Page) => page.getByText(text, { exact: true }).click();

const email: Omit<Case, 'path'> = {
	field: 'email',
	bad: (page) => page.getByTestId('control').fill('taken@example.com'),
	good: (page) => page.getByTestId('control').fill('ada@example.com'),
	issue: 'Email already taken',
	received: { email: 'ada@example.com' },
	invalid: testid('control'),
	noJs: {
		bad: (page) => page.getByTestId('control').fill('taken@example.com'),
		restored: (page) => expect(page.getByTestId('control')).toHaveValue('taken@example.com'),
		good: (page) => page.getByTestId('control').fill('ada@example.com')
	}
};

const boolean = (key: string, text: string, issue: string): Omit<Case, 'path'> => ({
	field: key,
	bad: async () => {},
	good: (page) => page.getByTestId('control').click(),
	issue,
	received: { [key]: true },
	invalid: testid('control'),
	noJs: {
		bad: async () => {},
		restored: (page) =>
			expect(page.getByTestId('control')).toHaveAttribute('aria-checked', 'false'),
		good: label(text)
	}
});

const number: Omit<Case, 'path'> = {
	field: 'age',
	bad: async (page) => {
		await page.getByTestId('control').fill('12');
		await page.getByTestId('control').blur();
	},
	good: async (page) => {
		await page.getByTestId('control').fill('20');
		await page.getByTestId('control').blur();
	},
	issue: 'You must be 18 or older',
	received: { age: 20 },
	invalid: (page) => page.locator('[data-field="age"] > div').first(),
	noJs: {
		bad: setNamed('n:age', '12'),
		restored: (page) => expect(page.getByTestId('control')).toHaveValue('12'),
		good: setNamed('n:age', '20')
	}
};

const combobox: Omit<Case, 'path'> = {
	field: 'fruit',
	bad: async (page) => {
		await page.getByTestId('control').fill('Dur');
		await page.getByRole('option', { name: 'Durian' }).click();
	},
	good: async (page) => {
		await page.getByTestId('control').fill('App');
		await page.getByRole('option', { name: 'Apple' }).click();
	},
	issue: 'Durian is not allowed',
	received: { fruit: 'Apple' },
	invalid: null,
	noJs: {
		bad: setNamed('fruit', 'Durian'),
		restored: async (page) => {
			await expect(named(page, 'fruit')).toHaveValue('Durian');
			await expect(page.getByTestId('control')).toHaveValue('Durian');
		},
		good: setNamed('fruit', 'Apple')
	}
};

const autocompleteType = (text: string) => async (page: Page) => {
	await page.getByTestId('control').fill(text);
	await page.keyboard.press('Escape');
};

const cases: Case[] = [
	{ path: 'field-control', ...email },
	{ path: 'input', ...email },
	{ path: 'checkbox', ...boolean('agree', 'Agree', 'Accept the terms') },
	{ path: 'switch', ...boolean('notify', 'Notify', 'Turn notifications on') },
	{ path: 'number-field', ...number },
	{
		path: 'slider?v=copy-value',
		field: 'volume',
		bad: async (page) => {
			await page.getByRole('slider').focus();
			await page.keyboard.press('End');
		},
		good: async (page) => {
			await page.getByRole('slider').focus();
			await page.keyboard.press('Home');
		},
		issue: 'Keep the volume at 80 or below',
		received: { volume: 0 },
		invalid: (page) => page.locator('[data-field="volume"] > div').first(),
		noJs: {
			bad: setNamed('n:volume', '100'),
			restored: (page) => expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '100'),
			good: setNamed('n:volume', '0')
		}
	},
	{
		path: 'select',
		field: 'country',
		bad: (page) => pick(page, 'France'),
		good: (page) => pick(page, 'United States'),
		issue: 'We do not ship to France',
		received: { country: 'us' },
		invalid: null,
		noJs: {
			bad: setNamed('country', 'fr'),
			restored: async (page) => {
				await expect(named(page, 'country')).toHaveValue('fr');
				await expect(page.getByTestId('control')).toHaveText(/France/);
			},
			good: setNamed('country', 'us')
		}
	},
	{ path: 'combobox', ...combobox },
	{
		path: 'autocomplete',
		field: 'fruit',
		bad: autocompleteType('Durian'),
		good: autocompleteType('Apple'),
		issue: 'Durian is not allowed',
		received: { fruit: 'Apple' },
		invalid: null,
		noJs: {
			bad: (page) => page.getByTestId('control').fill('Durian'),
			restored: (page) => expect(page.getByTestId('control')).toHaveValue('Durian'),
			good: (page) => page.getByTestId('control').fill('Apple')
		}
	},
	{
		path: 'otp-field',
		field: 'code',
		bad: (page) => page.getByTestId('digit-0').pressSequentially('000000'),
		good: (page) => page.getByTestId('digit-5').fill('1'),
		issue: 'That code has expired',
		received: { code: '000001' },
		invalid: (page) => page.locator('[data-field="code"] [role="group"]'),
		noJs: {
			bad: setNamed('code', '000000'),
			restored: (page) => expect(page.getByTestId('digit-5')).toHaveValue('0'),
			good: setNamed('code', '000001')
		}
	},
	{
		path: 'radio-group',
		field: 'plan',
		bad: (page) => page.getByTestId('radio-free').click(),
		good: (page) => page.getByTestId('radio-pro').click(),
		issue: 'The free plan is full',
		received: { plan: 'pro' },
		invalid: testid('control'),
		noJs: {
			bad: label('free'),
			restored: (page) => expect(page.locator('input[value="free"]')).toBeChecked(),
			good: label('pro')
		}
	},
	{
		path: 'checkbox-group?v=each-ungrouped',
		field: 'toppings',
		bad: (page) => page.getByTestId('box-olives').click(),
		good: async (page) => {
			await page.getByTestId('box-olives').click();
			await page.getByTestId('box-cheese').click();
		},
		issue: 'Olives are sold out',
		received: { toppings: ['cheese'] },
		invalid: testid('box-olives'),
		noJs: {
			bad: label('olives'),
			restored: (page) =>
				expect(page.getByTestId('box-olives')).toHaveAttribute('aria-checked', 'true'),
			good: async (page) => {
				await label('olives')(page);
				await label('cheese')(page);
			}
		}
	}
];

const url = (path: string, query: string) =>
	`/fixtures/remote-mapping/spread/${path}${path.includes('?') ? '&' : '?'}${query}`;
const submit = (page: Page) => page.getByRole('button', { name: 'Submit' }).click();

for (const mode of ['errors', 'match']) {
	test.describe(`with JS, ${mode}`, () => {
		for (const c of cases) {
			test(c.path, async ({ page }) => {
				const errors = await open(page, url(c.path, `mode=${mode}`));
				await c.bad(page);
				await submit(page);
				await expect(error(page, c.field), 'the issue shows').toHaveText(c.issue);
				await expect(field(page, c.field)).toHaveAttribute('data-invalid', '');
				if (c.invalid) await expect(c.invalid(page)).toHaveAttribute('aria-invalid', 'true');

				await c.good(page);
				await expect(error(page, c.field), 'the issue clears on edit').toHaveCount(0);
				if (c.invalid) {
					// Kit's `aria-invalid` follows Kit's issues: only `validate()` clears them before a submit.
					if (mode === 'errors')
						await expect(c.invalid(page)).toHaveAttribute('aria-invalid', 'true');
					else await expect(c.invalid(page)).not.toHaveAttribute('aria-invalid');
				}

				await submit(page);
				await expect
					.poll(async () => (await debug(page)).result, { message: 'the typed value arrives' })
					.toEqual({ received: c.received });
				expect(errors, 'no page errors, form_field_unbound included').toEqual([]);
			});
		}
	});
}

test.describe('without JS', () => {
	test.use({ javaScriptEnabled: false });

	// Form `errors` keyed by the spread's name finds no field on the server: the control registers
	// its name only after mount, so Field.Error needs the name on Field.Root as well.
	for (const query of ['mode=errors', 'mode=errors&root', 'mode=match']) {
		test.describe(query, () => {
			for (const c of cases) {
				test(c.path, async ({ page }) => {
					await page.goto(url(c.path, query));
					await c.noJs.bad(page);
					await submit(page);
					if (query === 'mode=errors') await expect(error(page, c.field)).toHaveCount(0);
					else await expect(error(page, c.field)).toHaveText(c.issue);
					if (c.invalid) await expect(c.invalid(page)).toHaveAttribute('aria-invalid', 'true');
					await c.noJs.restored(page);

					await c.noJs.good(page);
					await submit(page);
					await expect(field(page, c.field)).toBeVisible();
					expect((await debug(page)).result).toEqual({ received: c.received });
				});
			}
		});
	}
});

test.describe('spreads that fail', () => {
	// Kit defines `value` as a non-configurable getter, and Svelte's server `spread_props` copies the
	// descriptor, so naming `value` after the spread throws "Cannot redefine property: value".
	for (const path of ['number-field?v=value', 'combobox?v=value', 'slider?v=value']) {
		test(`${path}: a value prop after the spread fails the server render`, async ({ page }) => {
			const response = await page.goto(url(path, 'mode=errors'));
			expect(response?.status()).toBe(500);
		});
	}

	test('slider: the string value from .as() fails the server render', async ({ page }) => {
		const response = await page.goto(url('slider', 'mode=errors'));
		expect(response?.status()).toBe(500);
	});

	test('checkbox-group (group): the boxes get no name, so nothing submits', async ({ page }) => {
		await open(page, url('checkbox-group?v=group', 'mode=errors'));
		await expect(page.getByTestId('group')).toHaveAttribute('name', /^toppings\[\]\//);
		await page.getByTestId('box-olives').click();
		const entries = await page
			.locator('form')
			.evaluate((form: HTMLFormElement) => [...new FormData(form)].length);
		expect(entries).toBe(0);
	});

	test('checkbox-group (each, grouped): Form errors never reach Field.Error', async ({ page }) => {
		await open(page, url('checkbox-group?v=each', 'mode=errors'));
		await page.getByTestId('box-olives').click();
		await submit(page);
		await expect.poll(async () => (await debug(page)).kit).toEqual({ toppings: [''] });
		await expect(page.getByTestId('box-olives')).toHaveAttribute('aria-invalid', 'true');
		await expect(error(page, 'toppings')).toHaveCount(0);
	});

	test('checkbox-group (each, grouped): match shows the issue', async ({ page }) => {
		await open(page, url('checkbox-group?v=each', 'mode=match'));
		await page.getByTestId('box-olives').click();
		await submit(page);
		await expect(error(page, 'toppings')).toHaveText('Olives are sold out');
		await page.getByTestId('box-olives').click();
		await page.getByTestId('box-cheese').click();
		await expect(error(page, 'toppings')).toHaveCount(0);
		await submit(page);
		await expect
			.poll(async () => (await debug(page)).result)
			.toEqual({ received: { toppings: ['cheese'] } });
	});

	test.describe('without JS', () => {
		test.use({ javaScriptEnabled: false });

		test('checkbox-group (each, grouped): a ticked box submits an empty string', async ({
			page
		}) => {
			await page.goto(url('checkbox-group?v=each', 'mode=match'));
			await label('olives')(page);
			await submit(page);
			await expect(field(page, 'toppings')).toBeVisible();
			expect((await debug(page)).result).toEqual({ received: { toppings: [''] } });
		});
	});
});
