// Assertions follow Base UI v1.9.0 packages/react/src/select/{group,group-label,item-text,
// item-indicator,positioner}/*.test.tsx and packages/react/test/positionerConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: `describeConformance` for every part (ref forwarding and render-prop
// cloning), the GroupLabel ref-churn and Strict Mode cases, and store.test.tsx (React store
// transactions and ref callbacks during commit). The positioner conformance cases that assert
// `transform` are not ported, because this positioner uses `top` and `left`.
import { tick, type ComponentProps } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import SelectGroupHarness from '../../tests/SelectGroupHarness.svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';

const group = () => page.getByRole('group');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const ab = [{ value: 'a' }, { value: 'b' }];

describe('Select.Group', () => {
	it('should render group with label', async () => {
		render(SelectGroupHarness, { items: ['apple', 'banana'] });

		await expect.element(group()).toHaveAttribute('aria-labelledby');
		await expect.element(page.getByText('Fruits')).toBeVisible();
	});

	it('should associate label with group', async () => {
		render(SelectGroupHarness, {
			labels: [{ key: 'vegetables', text: 'Vegetables' }],
			items: ['carrot', 'lettuce']
		});

		const label = page.getByText('Vegetables').element();
		await expect.element(group()).toHaveAttribute('aria-labelledby', label.id);
	});
});

describe('Select.GroupLabel', () => {
	it('is hidden from the accessibility tree by default', async () => {
		render(SelectGroupHarness);

		await expect.element(page.getByText('Fruits')).toHaveAttribute('aria-hidden', 'true');
	});

	it('allows overriding aria-hidden', async () => {
		render(SelectGroupHarness, {
			labels: [{ key: 'fruits', text: 'Fruits', props: { 'aria-hidden': undefined } }]
		});

		await expect.element(page.getByText('Fruits')).not.toHaveAttribute('aria-hidden');
	});

	it('throws a descriptive error when rendered outside <Select.Group>', () => {
		expect(() => render(SelectGroupHarness, { orphan: 'group-label' })).toThrow(
			'Base UI: SelectGroupContext is missing. SelectGroup parts must be placed within <Select.Group>.'
		);
	});

	it('removes the group aria-labelledby attribute when unmounted', async () => {
		const props = renderBound(SelectGroupHarness, {
			labels: [{ key: 'fruits', id: 'group-label', text: 'Fruits' }]
		});
		await expect.element(group()).toHaveAttribute('aria-labelledby', 'group-label');

		props.labels = [];
		await tick();

		await expect.element(page.getByText('Fruits')).not.toBeInTheDocument();
		await expect.element(group()).not.toHaveAttribute('aria-labelledby');
	});

	it('does not let an older label cleanup clear a newer label', async () => {
		const old = { key: 'old', id: 'old-label', text: 'Old' };
		const next = { key: 'new', id: 'new-label', text: 'New' };
		const props = renderBound(SelectGroupHarness, { labels: [old] });
		await expect.element(group()).toHaveAttribute('aria-labelledby', 'old-label');

		props.labels = [old, next];
		await tick();
		await expect.element(group()).toHaveAttribute('aria-labelledby', 'new-label');

		props.labels = [next];
		await tick();
		await expect.element(group()).toHaveAttribute('aria-labelledby', 'new-label');
	});

	it('updates explicit and generated ids', async () => {
		const props = renderBound(SelectGroupHarness, { labels: [{ key: 'fruits', text: 'Fruits' }] });
		const generatedId = page.getByText('Fruits').element().id;
		await expect.element(group()).toHaveAttribute('aria-labelledby', generatedId);

		props.labels = [{ key: 'fruits', id: 'custom-label', text: 'Fruits' }];
		await tick();
		await expect.element(group()).toHaveAttribute('aria-labelledby', 'custom-label');

		props.labels = [{ key: 'fruits', text: 'Fruits' }];
		await tick();
		await expect.element(group()).toHaveAttribute('aria-labelledby', generatedId);
	});
});

describe('Select.ItemText', () => {
	it('throws a descriptive error when rendered outside <Select.Item>', () => {
		expect(() => render(SelectGroupHarness, { orphan: 'item-text' })).toThrow(
			'Base UI: SelectItemContext is missing. SelectItem parts must be placed within <Select.Item>.'
		);
	});
});

describe('Select.ItemIndicator', () => {
	type HarnessProps = ComponentProps<typeof SelectHarness>;
	const indicator = () => page.getByTestId('indicator-a');

	function setup(initial: HarnessProps) {
		return renderBound(SelectHarness, { open: true, items: ab, indicator: true, ...initial });
	}

	it('settles out of its transition state after the item is deselected', async () => {
		setup({
			root: { multiple: true, defaultValue: ['a'] },
			indicatorProps: { keepMounted: true }
		});
		await expect.element(indicator()).toHaveAttribute('data-selected');

		await userEvent.click(option('a'));

		await expect.element(indicator()).not.toHaveAttribute('data-selected');
		await expect.element(indicator()).not.toHaveAttribute('data-ending-style');
	});

	it('mounts only while selected when keepMounted is false', async () => {
		const props = setup({ value: 'b' });
		await expect.element(indicator()).not.toBeInTheDocument();

		props.value = 'a';
		await tick();
		await expect.element(indicator()).toHaveAttribute('data-selected');
		await expect.element(indicator()).toHaveAttribute('aria-hidden', 'true');
		await expect.element(indicator()).not.toHaveAttribute('selected');

		props.value = 'b';
		await tick();
		await expect.element(indicator()).not.toBeInTheDocument();

		props.value = 'a';
		await tick();
		await expect.element(indicator()).toHaveAttribute('data-selected');
	});

	it('preserves the kept-mounted element across selection changes', async () => {
		const props = setup({ value: 'b', indicatorProps: { keepMounted: true } });
		const element = indicator().element();
		expect(element.hasAttribute('data-selected')).toBe(false);

		props.value = 'a';
		await tick();
		expect(indicator().element()).toBe(element);
		await expect.element(indicator()).toHaveAttribute('data-selected');

		props.value = 'b';
		await tick();
		expect(indicator().element()).toBe(element);
		await expect.element(indicator()).not.toHaveAttribute('data-selected');
		await expect.element(indicator()).not.toHaveAttribute('data-ending-style');

		props.value = 'a';
		await tick();
		expect(indicator().element()).toBe(element);
		await expect.element(indicator()).toHaveAttribute('data-selected');
	});
});

describe('Select.Positioner', () => {
	const anchorWidth = 72;
	const anchorHeight = 36;
	const popupWidth = 52;
	const baselineX = (anchorWidth - popupWidth) / 2;
	const baselineY = anchorHeight;

	function renderPositioned(positioner: Record<string, unknown>) {
		render(SelectHarness, {
			open: true,
			trigger: { style: `width:${anchorWidth}px;height:${anchorHeight}px` },
			popup: { style: `width:${popupWidth}px;height:24px` },
			positioner: { align: 'center', alignItemWithTrigger: false, ...positioner }
		});
	}

	async function offsetFromTrigger() {
		const element = page.getByTestId('positioner').element() as HTMLElement;
		await expect.poll(() => element.style.top).not.toBe('');
		const positioner = element.getBoundingClientRect();
		const trigger = page.getByTestId('trigger').element().getBoundingClientRect();
		return { x: positioner.x - trigger.x, y: positioner.y - trigger.y };
	}

	describe.each([
		{
			prop: 'sideOffset' as const,
			numberPosition: (offset: number) => ({ x: baselineX, y: baselineY + offset }),
			offsetFunction: (data: { positioner: { width: number }; anchor: { width: number } }) =>
				data.positioner.width + data.anchor.width,
			functionPosition: { x: baselineX, y: baselineY + popupWidth + anchorWidth }
		},
		{
			prop: 'alignOffset' as const,
			numberPosition: (offset: number) => ({ x: baselineX + offset, y: baselineY }),
			offsetFunction: (data: { positioner: { width: number } }) => data.positioner.width,
			functionPosition: { x: baselineX + popupWidth, y: baselineY }
		}
	])('prop: $prop', ({ prop, numberPosition, offsetFunction, functionPosition }) => {
		it('offsets the positioner when a number is specified', async () => {
			renderPositioned({ [prop]: 7 });

			await expect.poll(offsetFromTrigger).toMatchObject(numberPosition(7));
		});

		it('offsets the positioner when a function is specified', async () => {
			renderPositioned({ [prop]: offsetFunction });

			await expect.poll(offsetFromTrigger).toMatchObject(functionPosition);
		});
	});

	describe('kept-mounted positioner', () => {
		it('does not retain stale coordinates while closed', async () => {
			renderPositioned({});
			const positioner = page.getByTestId('positioner');
			await expect.poll(() => (positioner.element() as HTMLElement).style.top).not.toBe('');
			await expect.element(page.getByRole('listbox')).toHaveFocus();

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => (positioner.element() as HTMLElement).hidden).toBe(true);
			const closed = positioner.element() as HTMLElement;
			await expect.poll(() => closed.style.position).toBe('fixed');
			expect(closed.style.transform).toBe('');
			expect(closed.style.top).toBe('0px');
			expect(closed.style.left).toBe('0px');
		});
	});
});
