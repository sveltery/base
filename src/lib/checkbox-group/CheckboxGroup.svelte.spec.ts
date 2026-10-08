// Assertions follow Base UI v1.8.0
// packages/react/src/checkbox-group/CheckboxGroup.test.tsx and
// packages/react/src/checkbox-group/useCheckboxGroupParent.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field registration, validation, and describeConformance are not ported.
// Strict Mode isolation is covered without double-mounting.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { controllableRootCases } from '../../tests/controllable-root-cases.js';
import CheckboxGroupHarness from '../../tests/CheckboxGroupHarness.svelte';

function box(name: string) {
	return page.getByRole('checkbox', { name, exact: true });
}

function byId(id: string) {
	return page.getByTestId(id);
}

function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as {
		value: string[];
		reason: string;
		canceled: boolean;
	}[];
}

function checkedCalls() {
	return JSON.parse(page.getByTestId('checked-calls').element().textContent ?? '[]') as {
		checked: boolean;
		canceled: boolean;
	}[];
}

function values() {
	return JSON.parse(page.getByTestId('values').element().textContent ?? '[]') as (string | null)[];
}

function elementId(id: string) {
	return (byId(id).element() as HTMLElement).id;
}

describe('CheckboxGroup', () => {
	describe('props', () => {
		it('forwards id and lets extra props override the role', async () => {
			render(CheckboxGroupHarness, { scenario: 'override' });
			const root = byId('root');
			await expect.element(root).toHaveAttribute('id', 'group-id');
			await expect.element(root).toHaveAttribute('role', 'region');
		});

		it('checks the box whose name is in the value', async () => {
			render(CheckboxGroupHarness, { scenario: 'initial' });
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('green')).toHaveAttribute('aria-checked', 'false');
			await byId('green').click();
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('green')).toHaveAttribute('aria-checked', 'true');
			expect(calls().at(-1)?.value).toEqual(['red', 'green']);
		});
	});

	describe('prop: value', () => {
		it('toggles each checkbox without clearing the others', async () => {
			render(CheckboxGroupHarness, { scenario: 'plain' });
			await byId('red').click();
			await byId('green').click();
			await byId('blue').click();
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('green')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('blue')).toHaveAttribute('aria-checked', 'true');
			expect(calls().map((call) => call.value)).toEqual([
				['red'],
				['red', 'green'],
				['red', 'green', 'blue']
			]);

			await byId('green').click();
			await expect.element(byId('green')).toHaveAttribute('aria-checked', 'false');
			expect(calls().at(-1)?.value).toEqual(['red', 'blue']);
		});

		it('supports an empty string item value', async () => {
			render(CheckboxGroupHarness, { scenario: 'empty' });
			await expect.element(byId('empty')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('other')).toHaveAttribute('aria-checked', 'false');
			await byId('empty').click();
			await expect.element(byId('empty')).toHaveAttribute('aria-checked', 'false');
			expect(calls()[0]?.value).toEqual([]);
		});

		it('treats a value that becomes undefined as an empty array', async () => {
			render(CheckboxGroupHarness, { scenario: 'clear' });
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'true');
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'false');
		});

		it('uses name when value is omitted', async () => {
			render(CheckboxGroupHarness, { scenario: 'name-key' });
			await byId('red').click();
			await byId('green').click();
			await byId('red').click();
			expect(calls().map((call) => call.value)).toEqual([['red'], ['red', 'green'], ['green']]);
		});
	});

	describe('prop: onValueChange', () => {
		it('reports reason none and does not update when canceled', async () => {
			render(CheckboxGroupHarness, { scenario: 'cancel' });
			await byId('red').click();
			expect(calls()).toEqual([{ value: ['red'], reason: 'none', canceled: true }]);
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('green')).toHaveAttribute('aria-checked', 'false');
		});

		it('starts from an empty array when value is omitted', async () => {
			render(CheckboxGroupHarness, { scenario: 'name-key' });
			await byId('red').click();
			expect(calls()[0]).toEqual({ value: ['red'], reason: 'none', canceled: false });
		});
	});

	describe('prop: disabled', () => {
		it('disables every checkbox and ignores clicks', async () => {
			render(CheckboxGroupHarness, { scenario: 'disabled' });
			const group = page.getByRole('group', { name: 'Colors' });
			await expect.element(group).toHaveAttribute('data-disabled', '');
			await expect.element(byId('red')).toHaveAttribute('aria-disabled', 'true');
			await expect.element(byId('green')).toHaveAttribute('aria-disabled', 'true');
			(byId('red').element() as HTMLElement).click();
			expect(calls()).toEqual([]);
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'false');
		});

		it('does not disable checkboxes when disabled is false', async () => {
			render(CheckboxGroupHarness, { scenario: 'enabled' });
			await expect.element(byId('red')).not.toHaveAttribute('aria-disabled', 'true');
			await expect
				.element(page.getByRole('group', { name: 'Colors' }))
				.not.toHaveAttribute('data-disabled');
		});

		it('keeps a checkbox disabled when the group is disabled and the checkbox opts out', async () => {
			render(CheckboxGroupHarness, { scenario: 'disabled-override' });
			await expect.element(byId('red')).toHaveAttribute('aria-disabled', 'true');
			await expect.element(byId('green')).toHaveAttribute('aria-disabled', 'true');
		});
	});

	describe('parent', () => {
		it('checks and clears every child from the parent without child callbacks', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent' });
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('parent')).toHaveAttribute('data-parent', '');

			await byId('parent').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('b')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('c')).toHaveAttribute('aria-checked', 'true');
			expect(calls()).toEqual([{ value: ['a', 'b', 'c'], reason: 'none', canceled: false }]);
			expect(checkedCalls()).toEqual([]);

			await byId('parent').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toHaveLength(2);
			expect(checkedCalls()).toEqual([]);
		});

		it('marks the parent mixed when one child is checked', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent' });
			await byId('a').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'mixed');
			await expect.element(byId('parent')).toHaveAttribute('data-indeterminate', '');
			expect(checkedCalls()).toEqual([{ checked: true, canceled: false }]);
			expect(calls()).toEqual([{ value: ['a'], reason: 'none', canceled: false }]);
		});

		it('starts mixed when one value is set and becomes checked when the rest are ticked', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-initial' });
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'mixed');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
			await byId('b').click();
			await byId('c').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'true');
		});

		it('returns to the partial snapshot after the parent cycles', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent' });
			await byId('a').click();
			await byId('parent').click();
			await expect.element(byId('b')).toHaveAttribute('aria-checked', 'true');
			await byId('parent').click();
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
			await byId('parent').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'mixed');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('b')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('c')).toHaveAttribute('aria-checked', 'false');
		});

		it('lets the parent checkbox cancel before the group hears the change', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-cancel-parent' });
			await byId('parent').click();
			expect(checkedCalls()).toEqual([{ checked: true, canceled: true }]);
			expect(calls()).toEqual([]);
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
		});

		it('lets a child cancel before the group hears the change', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-cancel-child' });
			await byId('a').click();
			expect(checkedCalls()).toEqual([{ checked: true, canceled: true }]);
			expect(calls()).toEqual([]);
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
		});

		it('retries the same parent transition when the group cancels', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-cancel-group' });
			await byId('parent').click();
			await byId('parent').click();
			expect(calls().map((call) => call.value)).toEqual([
				['a', 'b', 'c'],
				['a', 'b', 'c']
			]);
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'mixed');
		});

		it('keeps the all-checked snapshot when a child change is canceled', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-cancel-snapshot' });
			await byId('a').click();
			await byId('parent').click();
			expect(calls().map((call) => call.value)).toEqual([['b', 'c'], []]);
		});

		it('leaves an unchecked disabled child out of the parent selection', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-disabled-off' });
			await byId('parent').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'mixed');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
			await expect.element(byId('b')).toHaveAttribute('aria-checked', 'true');
		});

		it('keeps a checked disabled child selected when the parent clears', async () => {
			render(CheckboxGroupHarness, { scenario: 'parent-disabled-on' });
			await byId('parent').click();
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('b')).toHaveAttribute('aria-checked', 'true');
			await byId('parent').click();
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('b')).toHaveAttribute('aria-checked', 'false');
		});

		it('does not select a child that has no value', async () => {
			render(CheckboxGroupHarness, { scenario: 'no-value' });
			await byId('parent').click();
			await expect.element(byId('parent')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('no-value')).toHaveAttribute('aria-checked', 'false');
			const input = document.querySelector('input[type="checkbox"][id="standalone"]');
			expect(input).not.toBeNull();
		});

		it('keeps two groups from sharing a parent click', async () => {
			render(CheckboxGroupHarness, { scenario: 'isolated' });
			await byId('a-1').click();
			await expect.element(byId('a-parent')).toHaveAttribute('aria-checked', 'mixed');
			await expect.element(byId('b-parent')).toHaveAttribute('aria-checked', 'false');
			await byId('b-parent').click();
			await expect.element(byId('b-1')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('b-2')).toHaveAttribute('aria-checked', 'true');
			await expect.element(byId('a-2')).toHaveAttribute('aria-checked', 'false');
		});
	});

	describe('aria-controls', () => {
		it('names each rendered child id', async () => {
			render(CheckboxGroupHarness, { scenario: 'aria' });
			await expect.element(byId('parent')).toBeVisible();
			await expect.element(byId('c')).toBeVisible();
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(
				`${elementId('a')} ${elementId('b')} ${elementId('c')}`
			);
		});

		it('keeps a custom id placed on a native button', async () => {
			render(CheckboxGroupHarness, { scenario: 'custom-id' });
			await expect.element(byId('a')).toHaveAttribute('id', 'custom');
			await expect.element(byId('parent')).toHaveAttribute('aria-controls', 'custom');
		});

		it('uses the id rendered on the child host', async () => {
			render(CheckboxGroupHarness, { scenario: 'rendered-id' });
			await expect.element(byId('parent')).toHaveAttribute('aria-controls', 'rendered');
		});

		it('names the exposed checkbox rather than the hidden input id', async () => {
			render(CheckboxGroupHarness, { scenario: 'input-id' });
			await expect.element(byId('a')).not.toHaveAttribute('id', 'custom');
			expect(document.querySelector('input[type="checkbox"][id="custom"]')).not.toBeNull();
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(
				elementId('a')
			);
		});

		it('does not read a constructor value off the prototype', async () => {
			render(CheckboxGroupHarness, { scenario: 'constructor' });
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(
				elementId('a')
			);
		});

		it('drops an unmounted child', async () => {
			render(CheckboxGroupHarness, { scenario: 'unmount' });
			await expect.element(byId('b')).toBeVisible();
			const withB = `${elementId('a')} ${elementId('b')} ${elementId('c')}`;
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(withB);
			await page.getByRole('button', { name: 'Hide B' }).click();
			await expect.element(byId('b')).not.toBeInTheDocument();
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(
				`${elementId('a')} ${elementId('c')}`
			);
		});

		it('keeps both ids for one value and retains the survivor', async () => {
			render(CheckboxGroupHarness, { scenario: 'shared' });
			await expect.element(byId('second-b')).toBeVisible();
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(
				`${elementId('a')} ${elementId('b')} ${elementId('second-b')}`
			);
			await page.getByRole('button', { name: 'Hide second' }).click();
			await expect.element(byId('second-b')).not.toBeInTheDocument();
			expect((byId('parent').element() as HTMLElement).getAttribute('aria-controls')).toBe(
				`${elementId('a')} ${elementId('b')}`
			);
		});
	});

	describe('form', () => {
		it('submits checked values and leaves the parent out', async () => {
			render(CheckboxGroupHarness, { scenario: 'form' });
			await box('A').click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['a']);

			await box('All').click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(() => values()).toEqual(['a', 'b']);
		});
	});

	describe('keyboard and label', () => {
		it('toggles with Space and ignores Enter', async () => {
			render(CheckboxGroupHarness, { scenario: 'plain' });
			(byId('red').element() as HTMLElement).focus();
			await userEvent.keyboard('{Enter}');
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'false');
			await userEvent.keyboard('{Space}');
			await expect.element(byId('red')).toHaveAttribute('aria-checked', 'true');
		});

		it('toggles from an implicit label', async () => {
			render(CheckboxGroupHarness, { scenario: 'label' });
			await page.getByTestId('label-a').click();
			await expect.element(box('Apple')).toHaveAttribute('aria-checked', 'true');
			expect(calls()[0]?.value).toEqual(['a']);
		});

		it('preventDefault on the checkbox skips the group update', async () => {
			render(CheckboxGroupHarness, { scenario: 'prevent' });
			await byId('a').click();
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toEqual([]);
		});
	});

	describe('native Svelte', () => {
		it('ignores a checked prop inside the group, then follows the click', async () => {
			render(CheckboxGroupHarness, { scenario: 'ignore-checked' });
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'false');
			await byId('a').click();
			await expect.element(byId('a')).toHaveAttribute('aria-checked', 'true');
		});

		it('follows a one-way value, including undefined', async () => {
			render(CheckboxGroupHarness, { scenario: 'controlled' });
			await expect.element(box('B')).toHaveAttribute('aria-checked', 'true');
			await page.getByRole('button', { name: 'Set A' }).click();
			await expect.element(box('A')).toHaveAttribute('aria-checked', 'true');
			await expect.element(box('B')).toHaveAttribute('aria-checked', 'false');
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect.element(box('A')).toHaveAttribute('aria-checked', 'false');
			await expect.element(box('B')).toHaveAttribute('aria-checked', 'false');
		});

		it('places style hooks on the group, the checkbox, and the indicator', async () => {
			render(CheckboxGroupHarness, { scenario: 'style' });
			await expect.element(page.getByRole('group')).toHaveAttribute('data-disabled', '');
			await expect.element(byId('on')).toHaveAttribute('data-checked', '');
			await expect.element(byId('on')).toHaveAttribute('data-disabled', '');
			await expect.element(byId('off')).toHaveAttribute('data-unchecked', '');
			await expect.element(byId('indicator')).toBeInTheDocument();
		});

		it('renders through a snippet', async () => {
			render(CheckboxGroupHarness, { scenario: 'render' });
			await expect.element(byId('custom')).toHaveAttribute('role', 'group');
			await expect.element(byId('custom')).toHaveAttribute('data-disabled-state', 'no');
			await expect.element(box('B')).toHaveAttribute('aria-checked', 'true');
		});

		it('passes a consumer attachment to the host', async () => {
			render(CheckboxGroupHarness, { scenario: 'attach' });
			await expect.element(page.getByTestId('attached')).toHaveTextContent('group');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('checkbox-group');
});
