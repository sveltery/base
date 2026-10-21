// Assertions follow Base UI v1.8.0
// packages/react/src/checkbox-group/CheckboxGroup.test.tsx and
// packages/react/src/checkbox-group/useCheckboxGroupParent.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Sveltery: each checkbox is a real `<input type="checkbox">`, and native `change` events and
// `bind:value` replace `onValueChange`.
// Field cases are in src/lib/field/choice-controls.svelte.spec.ts. describeConformance is not ported.
// Strict Mode isolation is covered without double-mounting.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { controllableRootCases } from '../../tests/controllable-root-cases.js';
import CheckboxGroupHarness from '../../tests/CheckboxGroupHarness.svelte';

/** The checkbox input with this test id. */
function input(id: string) {
	const element = page.getByTestId(id).element();
	if (!(element instanceof HTMLInputElement)) throw new Error(`expected input ${id}`);
	return element;
}

/** The painted box around the input with this test id. */
function box(id: string) {
	const element = input(id).parentElement;
	if (!element) throw new Error(`expected the box around ${id}`);
	return element;
}

function click(id: string) {
	return page.getByTestId(id).click();
}

const checked = (id: string) => () => input(id).checked;
const mixed = (id: string) => () => input(id).indeterminate;

function read<T>(id: string) {
	return () => JSON.parse(page.getByTestId(id).element().textContent ?? 'null') as T;
}

const value = read<string[] | null>('value');
const changes = read<string[]>('changes');
const values = read<(string | null)[] | null>('values');

const controls = (id: string) => input(id).getAttribute('aria-controls');

describe('CheckboxGroup', () => {
	describe('props', () => {
		it('renders a fieldset and forwards id', async () => {
			render(CheckboxGroupHarness, { scenario: 'override' });
			const root = page.getByTestId('root');
			await expect.element(root).toHaveAttribute('id', 'group-id');
			expect(root.element().tagName).toBe('FIELDSET');
			await expect.element(page.getByRole('group')).toBeInTheDocument();
		});

		it('is named by a Fieldset.Legend inside it', async () => {
			render(CheckboxGroupHarness, { scenario: 'legend' });
			await expect.element(page.getByTestId('root')).toHaveAccessibleName('Toppings');
		});

		it('checks the box whose name is in the value', async () => {
			render(CheckboxGroupHarness, { scenario: 'initial' });
			await expect.poll(checked('red')).toBe(true);
			expect(input('green').checked).toBe(false);
			await click('green');
			await expect.poll(checked('green')).toBe(true);
			expect(input('red').checked).toBe(true);
			await expect.poll(value).toEqual(['red', 'green']);
		});
	});

	describe('prop: value', () => {
		it('toggles each checkbox without clearing the others', async () => {
			render(CheckboxGroupHarness, { scenario: 'plain' });
			await click('red');
			await expect.poll(value).toEqual(['red']);
			await click('green');
			await expect.poll(value).toEqual(['red', 'green']);
			await click('blue');
			await expect.poll(value).toEqual(['red', 'green', 'blue']);
			expect([checked('red')(), checked('green')(), checked('blue')()]).toEqual([true, true, true]);

			await click('green');
			await expect.poll(checked('green')).toBe(false);
			await expect.poll(value).toEqual(['red', 'blue']);
		});

		it('fires a native change event on the group for each tick', async () => {
			render(CheckboxGroupHarness, { scenario: 'plain' });
			await click('red');
			await click('green');
			await click('red');
			await expect.poll(changes).toEqual(['red', 'green', 'red']);
		});

		it('supports an empty string item value', async () => {
			render(CheckboxGroupHarness, { scenario: 'empty' });
			await expect.poll(checked('empty')).toBe(true);
			expect(input('other').checked).toBe(false);
			await click('empty');
			await expect.poll(checked('empty')).toBe(false);
			await expect.poll(value).toEqual([]);
		});

		it('treats a value that becomes undefined as an empty array', async () => {
			render(CheckboxGroupHarness, { scenario: 'clear' });
			await expect.poll(checked('red')).toBe(true);
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect.poll(checked('red')).toBe(false);
		});

		it('uses name when value is omitted', async () => {
			render(CheckboxGroupHarness, { scenario: 'name-key' });
			await click('red');
			await expect.poll(value).toEqual(['red']);
			await click('green');
			await expect.poll(value).toEqual(['red', 'green']);
			await click('red');
			await expect.poll(value).toEqual(['green']);
		});
	});

	describe('prop: disabled', () => {
		it('disables every checkbox and ignores clicks', async () => {
			render(CheckboxGroupHarness, { scenario: 'disabled' });
			const group = page.getByRole('group', { name: 'Colors' });
			await expect.element(group).toHaveAttribute('data-disabled', '');
			await expect.element(group).toHaveAttribute('disabled');
			expect(input('red').disabled).toBe(true);
			expect(input('green').disabled).toBe(true);
			input('red').click();
			await expect.poll(checked('red')).toBe(false);
			expect(value()).toEqual([]);
			expect(changes()).toEqual([]);
		});

		it('does not disable checkboxes when disabled is false', async () => {
			render(CheckboxGroupHarness, { scenario: 'enabled' });
			expect(input('red').disabled).toBe(false);
			const group = page.getByRole('group', { name: 'Colors' });
			await expect.element(group).not.toHaveAttribute('data-disabled');
			await expect.element(group).not.toHaveAttribute('disabled');
		});

		it('keeps a checkbox disabled when the group is disabled and the checkbox opts out', async () => {
			render(CheckboxGroupHarness, { scenario: 'disabled-override' });
			await expect.poll(() => input('red').disabled).toBe(true);
			expect(input('green').disabled).toBe(true);
		});
	});

	describe('parent', () => {
		it('checks and clears every child from the parent', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent' });
			await expect.poll(checked('a')).toBe(false);
			expect(box('parent').hasAttribute('data-parent')).toBe(true);

			await click('parent');
			await expect.poll(checked('parent')).toBe(true);
			expect(input('parent').indeterminate).toBe(false);
			expect([checked('a')(), checked('b')(), checked('c')()]).toEqual([true, true, true]);
			await expect.poll(value).toEqual(['a', 'b', 'c']);

			await click('parent');
			await expect.poll(checked('parent')).toBe(false);
			expect(input('a').checked).toBe(false);
			await expect.poll(value).toEqual([]);
		});

		it('marks the parent mixed when one child is checked', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent' });
			await click('a');
			await expect.poll(mixed('parent')).toBe(true);
			expect(input('parent').checked).toBe(false);
			expect(box('parent').hasAttribute('data-indeterminate')).toBe(true);
			await expect.poll(value).toEqual(['a']);
		});

		it('starts mixed when one value is set and becomes checked when the rest are ticked', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-initial' });
			await expect.poll(mixed('parent')).toBe(true);
			expect(input('a').checked).toBe(true);
			await click('b');
			await click('c');
			await expect.poll(checked('parent')).toBe(true);
			expect(input('parent').indeterminate).toBe(false);
		});

		it('returns to the partial snapshot after the parent cycles', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent' });
			await click('a');
			await click('parent');
			await expect.poll(checked('b')).toBe(true);
			await click('parent');
			await expect.poll(checked('a')).toBe(false);
			await click('parent');
			await expect.poll(mixed('parent')).toBe(true);
			expect([checked('a')(), checked('b')(), checked('c')()]).toEqual([true, false, false]);
		});

		it('leaves the group value unchanged when a child click is prevented', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-prevent' });
			await click('a');
			await expect.poll(checked('a')).toBe(false);
			expect(input('parent').checked).toBe(false);
			expect(input('parent').indeterminate).toBe(false);
			expect(value()).toEqual([]);
			expect(changes()).toEqual([]);
		});

		it('leaves an unchecked disabled child out of the parent selection', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-disabled-off' });
			await click('parent');
			await expect.poll(mixed('parent')).toBe(true);
			expect(input('a').checked).toBe(false);
			expect(input('b').checked).toBe(true);
		});

		it('keeps a checked disabled child selected when the parent clears', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-disabled-on' });
			await click('parent');
			await expect.poll(checked('b')).toBe(true);
			expect(input('a').checked).toBe(true);
			await click('parent');
			await expect.poll(checked('b')).toBe(false);
			expect(input('a').checked).toBe(true);
		});

		it('does not select a child that has no value', async () => {
			render(CheckboxGroupHarness, { scenario: 'no-value' });
			await click('parent');
			await expect.poll(checked('parent')).toBe(true);
			expect(input('a').checked).toBe(true);
			expect(input('no-value').checked).toBe(false);
			expect(input('no-value').id).toBe('standalone');
		});

		it('keeps two groups from sharing a parent click', async () => {
			render(CheckboxGroupHarness, { scenario: 'isolated' });
			await click('a-1');
			await expect.poll(mixed('a-parent')).toBe(true);
			expect(input('b-parent').checked).toBe(false);
			expect(input('b-parent').indeterminate).toBe(false);
			await click('b-parent');
			await expect.poll(checked('b-1')).toBe(true);
			expect(input('b-2').checked).toBe(true);
			expect(input('a-2').checked).toBe(false);
		});
	});

	describe('aria-controls', () => {
		it('names each rendered child id', async () => {
			render(CheckboxGroupHarness, { scenario: 'aria' });
			await expect
				.poll(() => controls('parent'))
				.toBe(`${input('a').id} ${input('b').id} ${input('c').id}`);
		});

		it('uses a custom id given to the child', async () => {
			render(CheckboxGroupHarness, { scenario: 'input-id' });
			expect(input('a').id).toBe('custom');
			await expect.poll(() => controls('parent')).toBe('custom');
		});

		it('does not read a constructor value off the prototype', async () => {
			render(CheckboxGroupHarness, { scenario: 'constructor' });
			await expect.poll(() => controls('parent')).toBe(input('a').id);
		});

		it('drops an unmounted child', async () => {
			render(CheckboxGroupHarness, { scenario: 'unmount' });
			await expect
				.poll(() => controls('parent'))
				.toBe(`${input('a').id} ${input('b').id} ${input('c').id}`);
			await page.getByRole('button', { name: 'Hide B' }).click();
			await expect.element(page.getByTestId('b')).not.toBeInTheDocument();
			await expect.poll(() => controls('parent')).toBe(`${input('a').id} ${input('c').id}`);
		});

		it('keeps both ids for one value and retains the survivor', async () => {
			render(CheckboxGroupHarness, { scenario: 'shared' });
			await expect
				.poll(() => controls('parent'))
				.toBe(`${input('a').id} ${input('b').id} ${input('second-b').id}`);
			await page.getByRole('button', { name: 'Hide second' }).click();
			await expect.element(page.getByTestId('second-b')).not.toBeInTheDocument();
			await expect.poll(() => controls('parent')).toBe(`${input('a').id} ${input('b').id}`);
		});
	});

	describe('form', () => {
		it('submits checked values and leaves the parent out', async () => {
			render(CheckboxGroupHarness, { scenario: 'form' });
			await click('a');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(values).toEqual(['a']);

			await click('parent');
			// The named children change from code and fire the change event a click on each would.
			await expect.poll(changes).toEqual(['a', 'b', 'on']);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(values).toEqual(['a', 'b']);
		});

		it('names every child from the group name and submits nothing for unchecked ones', async () => {
			render(CheckboxGroupHarness, { scenario: 'group-name' });
			expect([input('a').name, input('b').name, input('c').name]).toEqual([
				'topping',
				'topping',
				'topping'
			]);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(values).toEqual(['a', 'c']);

			await click('b');
			await click('a');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(values).toEqual(['b', 'c']);
		});
	});

	describe('keyboard and label', () => {
		it('toggles with Space and ignores Enter', async () => {
			render(CheckboxGroupHarness, { scenario: 'plain' });
			input('red').focus();
			await userEvent.keyboard('{Enter}');
			expect(input('red').checked).toBe(false);
			await userEvent.keyboard('{Space}');
			await expect.poll(checked('red')).toBe(true);
			await expect.poll(value).toEqual(['red']);
		});

		it('toggles from an implicit label', async () => {
			render(CheckboxGroupHarness, { scenario: 'label' });
			await expect.element(page.getByRole('checkbox', { name: 'Apple' })).toBeInTheDocument();
			await page.getByTestId('label-a').click();
			await expect.poll(checked('a')).toBe(true);
			await expect.poll(value).toEqual(['a']);
		});

		it('preventDefault on the checkbox skips the group update', async () => {
			render(CheckboxGroupHarness, { scenario: 'prevent' });
			await click('a');
			await expect.poll(checked('a')).toBe(false);
			expect(value()).toEqual([]);
			expect(changes()).toEqual([]);
		});
	});

	describe('native Svelte', () => {
		it('adds a box ticked by its own checked prop to the group, then follows the click', async () => {
			render(CheckboxGroupHarness, { scenario: 'adopt-checked' });
			await expect.poll(checked('a')).toBe(true);
			await expect.poll(value).toEqual(['a']);
			await click('a');
			await expect.poll(checked('a')).toBe(false);
			await expect.poll(value).toEqual([]);
		});

		it('follows a one-way value, including undefined', async () => {
			render(CheckboxGroupHarness, { scenario: 'controlled' });
			await expect.poll(checked('b')).toBe(true);
			await page.getByRole('button', { name: 'Set A' }).click();
			await expect.poll(checked('a')).toBe(true);
			expect(input('b').checked).toBe(false);
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect.poll(checked('a')).toBe(false);
			expect(input('b').checked).toBe(false);
		});

		it('places style hooks on the group, the checkbox box, and the indicator', async () => {
			render(CheckboxGroupHarness, { scenario: 'style' });
			await expect.element(page.getByRole('group')).toHaveAttribute('data-disabled', '');
			await expect.element(page.getByTestId('indicator')).toBeInTheDocument();
			expect(box('on').hasAttribute('data-checked')).toBe(true);
			expect(box('on').hasAttribute('data-disabled')).toBe(true);
			expect(box('off').hasAttribute('data-unchecked')).toBe(true);
		});

		it('renders through a snippet', async () => {
			render(CheckboxGroupHarness, { scenario: 'render' });
			const custom = page.getByTestId('custom');
			await expect.element(custom).toHaveAttribute('data-disabled-state', 'no');
			expect(custom.element().tagName).toBe('FIELDSET');
			await expect.poll(checked('b')).toBe(true);
			expect(input('a').checked).toBe(false);
		});

		it('passes a consumer attachment to the host', async () => {
			render(CheckboxGroupHarness, { scenario: 'attach' });
			await expect.element(page.getByTestId('attached')).toHaveTextContent('fieldset');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('checkbox-group');
});
