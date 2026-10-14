// Assertions follow Base UI v1.9.0
// packages/react/src/combobox/positioner/ComboboxPositioner.test.tsx and
// packages/react/test/positionerConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only) and the conformance cases that assert
// `transform`, because this positioner uses `top` and `left`. The scroll-lock case rerenders
// with a fresh empty value in place of React's effect-driven second commit.
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';

const positioner = () => page.getByTestId('positioner');

describe('Combobox.Positioner', () => {
	it('does not lock body scroll when a controlled empty value rerenders', async () => {
		const view = render(ComboboxHarness, { value: [], root: { multiple: true } });
		await view.rerender({ value: [] });

		await new Promise((resolve) => setTimeout(resolve, 500));

		expect(document.body.style.overflowX).not.toBe('hidden');
		expect(document.body.style.overflowY).not.toBe('hidden');
		expect(document.documentElement.style.overflowX).not.toBe('hidden');
		expect(document.documentElement.style.overflowY).not.toBe('hidden');
	});

	describe('offsets', () => {
		const anchorWidth = 72;
		const anchorHeight = 36;
		const popupWidth = 52;
		const baselineX = (anchorWidth - popupWidth) / 2;
		const baselineY = anchorHeight;

		function renderPositioned(props: Record<string, unknown>) {
			render(ComboboxHarness, {
				open: true,
				input: { style: `width:${anchorWidth}px;height:${anchorHeight}px;box-sizing:border-box` },
				popup: { style: `width:${popupWidth}px;height:24px` },
				positioner: { align: 'center', ...props }
			});
		}

		async function offsetFromInput() {
			const element = positioner().element() as HTMLElement;
			await expect.poll(() => element.style.top).not.toBe('');
			const box = element.getBoundingClientRect();
			const anchor = page.getByTestId('input').element().getBoundingClientRect();
			return { x: box.x - anchor.x, y: box.y - anchor.y };
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
			it('offsets the positioner by a number', async () => {
				renderPositioned({ [prop]: 7 });

				await expect.poll(offsetFromInput).toMatchObject(numberPosition(7));
			});

			it('offsets the positioner by a function', async () => {
				renderPositioned({ [prop]: offsetFunction });

				await expect.poll(offsetFromInput).toMatchObject(functionPosition);
			});
		});

		it('does not keep stale coordinates while closed and kept mounted', async () => {
			render(ComboboxHarness, {
				open: true,
				staticItems: [{ value: 'a' }],
				portal: { keepMounted: true },
				input: { style: `width:${anchorWidth}px` }
			});
			const element = positioner().element() as HTMLElement;
			await expect.poll(() => element.style.top).not.toBe('');
			await userEvent.click(page.getByTestId('input'));

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => (positioner().element() as HTMLElement).hidden).toBe(true);
			const closed = positioner().element() as HTMLElement;
			await expect.poll(() => closed.style.position).toBe('fixed');
			expect(closed.style.top).toBe('0px');
			expect(closed.style.left).toBe('0px');
		});
	});

	describe('fixed anchor near the viewport bottom', () => {
		let wrapper: HTMLDivElement | undefined;

		afterEach(() => wrapper?.remove());

		// https://github.com/mui/base-ui/issues/5118
		it('keeps the preferred side when the capped height fits below', async () => {
			wrapper = document.createElement('div');
			wrapper.style.cssText = 'position: fixed; bottom: 120px; left: 100px';
			document.body.append(wrapper);
			const items = Array.from({ length: 40 }, (_, index) => `item-${index}`);

			render(ComboboxHarness, {
				target: wrapper,
				props: {
					open: true,
					items,
					positioner: { side: 'bottom', sideOffset: 0 },
					listProps: {
						style: 'max-height: min(80px, var(--available-height)); overflow-y: auto'
					}
				}
			});

			await expect.element(positioner()).toHaveAttribute('data-side', 'bottom');
		});
	});

	describe('default anchor', () => {
		it('uses the input when the input group is absent', async () => {
			let anchorWidth = 0;
			render(ComboboxHarness, {
				open: true,
				trigger: true,
				staticItems: [{ value: 'One' }],
				input: { style: 'width: 120px' },
				triggerProps: { style: 'width: 240px' },
				positioner: {
					sideOffset: (data: { anchor: { width: number } }) => {
						anchorWidth = data.anchor.width;
						return 0;
					}
				}
			});
			const inputWidth = page.getByTestId('input').element().getBoundingClientRect().width;

			await expect.poll(() => Math.round(anchorWidth)).toBe(Math.round(inputWidth));
			expect(Math.round(anchorWidth)).not.toBe(240);
		});

		it('uses the input group when present', async () => {
			let anchorWidth = 0;
			render(ComboboxHarness, {
				open: true,
				trigger: true,
				inputGroup: true,
				inputGroupProps: { style: 'width: 240px' },
				staticItems: [{ value: 'One' }],
				input: { style: 'width: 120px' },
				positioner: {
					sideOffset: (data: { anchor: { width: number } }) => {
						anchorWidth = data.anchor.width;
						return 0;
					}
				}
			});

			await expect.poll(() => Math.round(anchorWidth)).toBe(240);
		});
	});
});
