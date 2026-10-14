// Assertions follow Base UI v1.9.0 packages/react/src/select/popup/SelectPopup.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported, React only: `describeConformance`. The shared `popupFocusPropsTests` suite is
// covered by the `finalFocus` cases at the end. Ref callbacks that stub geometry are
// attachments here.
import { createAttachmentKey } from 'svelte/attachments';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectGroupHarness from '../../tests/SelectGroupHarness.svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';
import SelectToolbarHarness from '../../tests/SelectToolbarHarness.svelte';

const trigger = () => page.getByTestId('trigger');
const positioner = () => page.getByTestId('positioner');
const option = (name: string) => page.getByRole('option', { name, exact: true });

const restores: Array<() => void> = [];

function stubProperty(target: object, property: string, value: unknown) {
	const descriptor = Object.getOwnPropertyDescriptor(target, property);
	Object.defineProperty(target, property, { value, configurable: true });
	restores.push(() => {
		if (descriptor) Object.defineProperty(target, property, descriptor);
		else delete (target as Record<string, unknown>)[property];
	});
}

function rect(left: number, top: number, width: number, height: number) {
	return {
		x: left,
		y: top,
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
		toJSON: () => ({})
	};
}

function stubRect(node: HTMLElement, left: number, top: number, width: number, height: number) {
	stubProperty(node, 'getBoundingClientRect', () => rect(left, top, width, height));
	// Floating UI compares the rect with the offset box to read the scale.
	stubProperty(node, 'offsetWidth', width);
	stubProperty(node, 'offsetHeight', height);
}

/** Props carrying an attachment that runs `stub` on the element. */
function stubbed(stub: (node: HTMLElement) => void) {
	return { [createAttachmentKey()]: stub };
}

function scroll(node: Element) {
	node.dispatchEvent(new Event('scroll'));
}

const docEl = document.documentElement;

afterEach(() => {
	while (restores.length > 0) restores.pop()!();
	docEl.style.zoom = '';
});

describe('Select.Popup', () => {
	it('throws a descriptive error when rendered outside <Select.Positioner>', () => {
		expect(() => render(SelectGroupHarness, { orphan: 'popup' })).toThrow(
			'Base UI: SelectPositionerContext is missing. SelectPositioner parts must be placed within <Select.Positioner>.'
		);
	});

	it('keeps arrow keys inside the popup when the trigger lives in a toolbar', async () => {
		const onToolbarKeyDown = vi.fn();
		render(SelectToolbarHarness, { onToolbarKeyDown });

		(trigger().element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(option('a')).toHaveFocus();
		onToolbarKeyDown.mockClear();

		await userEvent.keyboard('{ArrowRight}');

		expect(onToolbarKeyDown).not.toHaveBeenCalled();
		await expect.element(page.getByTestId('next')).not.toHaveFocus();
	});

	it('moves focus into the items when the boundary item is already highlighted', async () => {
		render(SelectHarness, {
			root: { defaultValue: 'a' },
			list: true,
			popupPrefix: 'Select all',
			items: [{ value: 'a' }, { value: 'b' }, { value: 'c' }]
		});

		(trigger().element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(option('a')).toHaveAttribute('data-highlighted');
		(page.getByRole('button', { name: 'Select all' }).element() as HTMLElement).focus();
		await expect.element(option('a')).toHaveAttribute('data-highlighted');

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('a')).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');
		await expect.element(option('b')).toHaveFocus();
	});

	it('has aria attributes when no Select.List is present', async () => {
		render(SelectHarness, { root: { multiple: true } });
		const combobox = page.getByRole('combobox');
		await expect.element(combobox).not.toHaveAttribute('aria-controls');
		await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');

		await userEvent.click(combobox);

		const popup = page.getByTestId('popup');
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
		expect(page.getByRole('listbox').element()).toBe(popup.element());
		const id = popup.element().id;
		expect(id).not.toBe('');
		await expect.element(popup).toHaveAttribute('aria-multiselectable', 'true');
		await expect.element(combobox).toHaveAttribute('aria-controls', id);
		await expect.element(combobox).toHaveAttribute('aria-expanded', 'true');
		await expect.element(combobox).toHaveAttribute('aria-haspopup', 'listbox');
	});

	it('places aria attributes on Select.List instead if it is present', async () => {
		render(SelectHarness, {
			root: { multiple: true },
			list: true,
			items: [
				{ value: '1', text: 'Item 1' },
				{ value: '2', text: 'Item 2' }
			]
		});
		const combobox = page.getByRole('combobox');
		await expect.element(combobox).not.toHaveAttribute('aria-controls');
		await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
		await expect.element(combobox).toHaveAttribute('aria-haspopup', 'listbox');

		await userEvent.click(combobox);

		const list = page.getByTestId('list');
		const popup = page.getByTestId('popup');
		await expect.element(page.getByRole('listbox')).toBeInTheDocument();
		expect(page.getByRole('listbox').element()).toBe(list.element());
		await expect.element(list).toHaveAttribute('aria-multiselectable');
		await expect.element(popup).toHaveAttribute('role', 'presentation');
		await expect.element(popup).not.toHaveAttribute('aria-multiselectable');
		const id = list.element().id;
		expect(id).not.toBe('');
		await expect.element(combobox).toHaveAttribute('aria-controls', id);
		await expect.element(combobox).toHaveAttribute('aria-expanded', 'true');
		await expect.element(combobox).toHaveAttribute('aria-haspopup', 'listbox');
	});

	it('restores transform-related inline styles after measurement', async () => {
		let popupElement: HTMLElement | null = null;
		render(SelectHarness, {
			open: true,
			popup: stubbed((node) => {
				node.style.setProperty('transform', 'translateX(10px)');
				node.style.setProperty('scale', '0.8');
				node.style.setProperty('translate', '1px 2px');
				popupElement = node;
			}),
			items: [{ value: '1', text: 'Item 1' }]
		});

		await expect.element(page.getByTestId('popup')).toBeInTheDocument();
		await new Promise<void>(queueMicrotask);

		expect(popupElement).not.toBe(null);
		expect(popupElement!.style.getPropertyValue('transform')).toBe('translateX(10px)');
		expect(popupElement!.style.getPropertyValue('scale')).toBe('0.8');
		expect(popupElement!.style.getPropertyValue('translate')).toBe('1px 2px');
	});

	it('keeps alignItemWithTrigger active at browser zoom', async () => {
		docEl.style.zoom = '0.9';
		render(SelectHarness, {
			open: true,
			root: { defaultValue: 'css-modules' },
			wrapper: { style: 'padding-top:100px;padding-left:10px' },
			trigger: { style: 'width:108px;height:30px' },
			popup: { style: 'max-height:none' },
			items: [
				{ value: 'css-modules', text: 'CSS Modules' },
				{ value: 'tailwind-v4', text: 'Tailwind v4' }
			]
		});

		await expect.element(positioner()).toHaveAttribute('data-side', 'none');
	});

	describe('inline alignment', () => {
		const longer = { value: 'with-longer-label', text: 'With longer label' };
		const other = { value: 'other', text: 'Other option' };
		const valueText = () => 'With longer label';

		async function expectEdgesAligned(
			edge: 'left' | 'right',
			target = page.getByTestId('item-text')
		) {
			await expect.element(positioner()).toHaveAttribute('data-side', 'none');
			const value = page.getByTestId('value').element();
			await expect
				.poll(() =>
					Math.abs(
						value.getBoundingClientRect()[edge] - target.element().getBoundingClientRect()[edge]
					)
				)
				.toBeLessThan(1);
		}

		function itemTextProps(start: number, end: number) {
			return {
				'data-testid': 'item-text',
				style: `padding-inline-start:${start}px;padding-inline-end:${end}px`
			};
		}

		it('aligns the selected item with the trigger inline start in ltr', async () => {
			render(SelectHarness, {
				open: true,
				root: { defaultValue: longer.value },
				wrapper: { dir: 'ltr', style: 'margin-left:100px;min-height:600px;padding-top:96px' },
				direction: 'ltr',
				trigger: {
					style:
						'width:160px;display:flex;justify-content:flex-start;padding-inline-start:12px;padding-inline-end:28px'
				},
				formatValue: valueText,
				popup: { style: 'width:180px;max-height:none' },
				items: [{ ...longer, textProps: itemTextProps(24, 8) }, other]
			});

			await expectEdgesAligned('left');
		});

		it('aligns the selected item with the trigger inline start in ltr when popup padding shifts the item text', async () => {
			render(SelectHarness, {
				open: true,
				root: { defaultValue: longer.value },
				wrapper: { dir: 'ltr', style: 'margin-left:100px;min-height:600px;padding-top:96px' },
				direction: 'ltr',
				trigger: {
					style:
						'width:160px;display:flex;justify-content:flex-start;padding-inline-start:12px;padding-inline-end:28px'
				},
				formatValue: valueText,
				popup: {
					style:
						'width:220px;max-height:none;box-sizing:border-box;border:4px solid transparent;padding-inline-start:20px;padding-inline-end:12px'
				},
				items: [{ ...longer, textProps: itemTextProps(24, 8) }, other]
			});

			await expectEdgesAligned('left');
		});

		it('aligns the selected item with the trigger inline end in rtl', async () => {
			render(SelectHarness, {
				open: true,
				root: { defaultValue: longer.value },
				wrapper: { dir: 'rtl', style: 'margin-left:100px;min-height:600px;padding-top:96px' },
				direction: 'rtl',
				trigger: {
					style:
						'width:160px;display:flex;justify-content:flex-end;padding-inline-start:28px;padding-inline-end:12px'
				},
				formatValue: valueText,
				popup: { style: 'width:180px;max-height:none' },
				items: [{ ...longer, textProps: itemTextProps(8, 24) }, other]
			});

			await expectEdgesAligned('right');
		});

		it('aligns the popup with the trigger inline end in rtl when no selected item text is available', async () => {
			render(SelectHarness, {
				open: true,
				wrapper: {
					dir: 'rtl',
					style: 'width:280px;margin-left:100px;min-height:600px;padding-top:96px'
				},
				direction: 'rtl',
				trigger: {
					style:
						'width:160px;display:flex;justify-content:flex-end;padding-inline-start:28px;padding-inline-end:12px'
				},
				valueProps: { placeholder: 'اختر لهجة' },
				popup: { style: 'width:180px;max-height:none' },
				itemText: false,
				items: [longer, other]
			});

			await expect.element(positioner()).toHaveAttribute('data-side', 'none');
			await expect
				.poll(() =>
					Math.abs(
						trigger().element().getBoundingClientRect().right -
							positioner().element().getBoundingClientRect().right
					)
				)
				.toBeLessThan(1);
		});

		it('keeps item text aligned with the trigger after reopening', async () => {
			const itemStyle = 'padding:8px 16px 8px 10px;font-size:14px;line-height:16px';
			render(SelectHarness, {
				wrapper: { style: 'margin-left:100px;min-height:600px;padding-top:96px' },
				trigger: {
					style:
						'box-sizing:border-box;width:176px;height:40px;display:flex;align-items:center;justify-content:flex-start;padding-inline-start:14px'
				},
				valueProps: { placeholder: 'Select produce' },
				popup: { style: 'width:220px;max-height:none' },
				list: true,
				listProps: { style: 'padding-block:4px;overflow-y:auto' },
				itemStyle,
				groupLabelProps: { style: 'padding:8px 16px 4px 30px;font-size:11px;line-height:16px' },
				groups: [
					{
						label: 'Fruits',
						items: [
							{ value: 'apple', text: 'Apple', textProps: { 'data-testid': 'first-item-text' } },
							{
								value: 'banana',
								text: 'Banana',
								textProps: { 'data-testid': 'selected-item-text' }
							}
						]
					}
				]
			});

			const center = (element: Element) => {
				const box = element.getBoundingClientRect();
				return box.top + box.height / 2;
			};
			async function expectItemAligned(testId: string) {
				await expect.element(positioner()).toHaveAttribute('data-side', 'none');
				const value = page.getByTestId('value').element();
				await expect
					.poll(() => Math.abs(center(value) - center(page.getByTestId(testId).element())))
					.toBeLessThan(1);
			}

			await userEvent.click(trigger());
			await expectItemAligned('first-item-text');

			await userEvent.keyboard('{Escape}');
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');

			await userEvent.click(trigger());
			await expectItemAligned('first-item-text');

			await userEvent.click(page.getByTestId('selected-item-text'));
			await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');

			await userEvent.click(trigger());
			await expectItemAligned('selected-item-text');
		});
	});

	describe('rtl alignment', () => {
		const OPTIONS = [
			{ value: 'first', label: 'الخيار الأول' },
			{ value: 'selected', label: 'الخيار المحدد' },
			{ value: 'third', label: 'الخيار الثالث' }
		];
		const CSS = `
			.rtlFixtureRoot { width: 240px; margin-left: 100px; padding-top: 96px; direction: rtl; }
			.rtlFixtureTrigger {
				box-sizing: border-box; display: flex; justify-content: flex-end; height: 2.5rem;
				width: 160px; padding-inline-start: 28px; padding-inline-end: 12px; font-size: 1rem;
				line-height: 1.5rem; direction: rtl;
			}
			.rtlFixturePositioner, .rtlFixturePopup, .rtlFixtureItem { direction: rtl; }
			.rtlFixturePopup { box-sizing: border-box; min-width: var(--anchor-width); }
			.rtlFixturePopup[data-side='none'] { min-width: calc(var(--anchor-width) + 1rem); }
			.rtlFixtureList { padding-block: 0.25rem; max-height: var(--available-height); }
			.rtlFixtureItem {
				box-sizing: border-box; padding-block: 0.5rem; padding-inline-start: 1rem;
				padding-inline-end: 0.625rem; display: grid; gap: 0.5rem; align-items: center;
				grid-template-columns: 0.75rem 1fr;
			}
			[data-side='none'] .rtlFixtureItem { padding-inline-start: 3rem; }
			.rtlFixtureIndicator { grid-column: 1; }
			.rtlFixtureText { grid-column: 2; }
		`;

		function renderRtl(anchorWidth?: number) {
			const style = document.createElement('style');
			style.textContent = CSS;
			document.head.append(style);
			restores.push(() => style.remove());
			render(SelectHarness, {
				root: { defaultValue: 'selected' },
				wrapper: {
					dir: 'rtl',
					class: 'rtlFixtureRoot',
					'data-testid': 'anchor',
					style: anchorWidth ? `width:${anchorWidth}px` : undefined
				},
				direction: 'rtl',
				trigger: { class: 'rtlFixtureTrigger' },
				formatValue: (current) => OPTIONS.find((entry) => entry.value === current)?.label ?? 'اختر',
				positioner: {
					class: 'rtlFixturePositioner',
					dir: 'rtl',
					sideOffset: 8,
					anchor: anchorWidth ? () => document.querySelector('[data-testid="anchor"]') : undefined
				},
				popup: { class: 'rtlFixturePopup', dir: 'rtl' },
				list: true,
				listProps: { class: 'rtlFixtureList' },
				indicator: true,
				indicatorProps: { class: 'rtlFixtureIndicator', keepMounted: false },
				items: OPTIONS.map(({ value, label }) => ({
					value,
					text: label,
					props: { class: 'rtlFixtureItem' },
					textProps: {
						class: 'rtlFixtureText',
						'data-testid': value === 'selected' ? 'item-text' : undefined
					}
				}))
			});
		}

		it('aligns the selected item with the trigger inline end on first open in the docs-style rtl layout', async () => {
			renderRtl();

			await userEvent.click(page.getByRole('combobox'));

			await expect.element(positioner()).toHaveAttribute('data-side', 'none');
			const value = page.getByTestId('value').element();
			const itemText = page.getByTestId('item-text').element();
			await expect
				.poll(() =>
					Math.abs(value.getBoundingClientRect().right - itemText.getBoundingClientRect().right)
				)
				.toBeLessThan(1);
		});

		it('seeds anchor width from the custom anchor on first open', async () => {
			renderRtl(240);

			await userEvent.click(page.getByRole('combobox'));

			await expect.element(positioner()).toHaveAttribute('data-side', 'none');
			await expect
				.poll(() =>
					(positioner().element() as HTMLElement).style.getPropertyValue('--anchor-width')
				)
				.toBe('240px');
		});
	});

	it('keeps scrolling the aligned list at browser zoom after the popup fills the available height', async () => {
		docEl.style.zoom = '0.9';
		render(SelectHarness, {
			open: true,
			root: { defaultValue: 'item-1' },
			wrapper: { style: 'padding-top:100px;padding-left:10px' },
			trigger: { style: 'width:108px;height:30px' },
			popup: { style: 'max-height:225.538px' },
			list: true,
			items: [
				{ value: 'item-1', text: 'Item 1' },
				{ value: 'item-2', text: 'Item 2' }
			]
		});

		const element = positioner().element() as HTMLElement;
		const list = page.getByTestId('list').element() as HTMLElement;
		await expect.element(positioner()).toHaveAttribute('data-side', 'none');
		// The aligned layout pass runs after the side settles. Stub once it has written its height.
		await expect.poll(() => element.style.marginTop).toBe('10px');

		let scrollTop = 0;
		stubProperty(element, 'getBoundingClientRect', () => rect(10, 0, 108, 202.984375));
		Object.defineProperty(list, 'scrollTop', {
			configurable: true,
			get: () => scrollTop,
			set: (next: number) => (scrollTop = next)
		});
		stubProperty(list, 'scrollHeight', 598);
		stubProperty(list, 'clientHeight', 226);
		element.style.height = '225.538px';
		element.style.bottom = '0px';

		list.scrollTop = 14;
		scroll(list);

		await expect.poll(() => element.style.height).toBe('226px');
		expect(scrollTop).toBe(14);
	});

	describe('stubbed short popups', () => {
		function renderShort(popupStyle?: string) {
			stubProperty(docEl, 'clientHeight', 646);
			stubProperty(docEl, 'clientWidth', 300);
			render(SelectHarness, {
				open: true,
				root: { defaultValue: '1' },
				triggerText: 'Trigger',
				trigger: stubbed((node) => {
					stubProperty(node, 'offsetWidth', 80);
					stubProperty(node, 'offsetHeight', 30);
					stubProperty(node, 'getBoundingClientRect', () => rect(10, 170.3793487548828, 80, 30));
				}),
				positioner: stubbed((node) => {
					stubProperty(node, 'getBoundingClientRect', () => rect(10, 0, 108, 63.96739196777344));
				}),
				popup: {
					style: popupStyle,
					...stubbed((node) => {
						stubProperty(node, 'scrollHeight', 64);
						stubProperty(node, 'clientHeight', 63);
					})
				},
				items: [
					{ value: '1', text: 'Item 1' },
					{ value: '2', text: 'Item 2' }
				]
			});
		}

		it('treats short popups as top-positioned when maxScrollTop is off by 1px', async () => {
			renderShort();
			const element = positioner().element() as HTMLElement;

			await expect
				.poll(() => ({
					side: element.getAttribute('data-side'),
					hasTop: element.style.top !== '',
					bottom: element.style.bottom
				}))
				.toEqual({ side: 'none', hasTop: true, bottom: '' });
		});

		it('keeps alignItemWithTrigger active when the aligned height is fractionally below minHeight', async () => {
			renderShort('min-height:65px');

			await expect.element(positioner()).toHaveAttribute('data-side', 'none');
		});
	});

	it('does not resize the positioner when the list scrolls before the popup is placed', async () => {
		render(SelectHarness, {
			root: { defaultValue: 'a' },
			noPortal: true,
			scrollArrows: true,
			scrollArrowProps: { keepMounted: true },
			list: true,
			listProps: stubbed((node) => {
				stubProperty(node, 'scrollTop', 100);
				stubProperty(node, 'scrollHeight', 400);
				stubProperty(node, 'clientHeight', 200);
			}),
			items: [{ value: 'a' }, { value: 'b' }]
		});

		const element = positioner().element() as HTMLElement;
		const before = {
			height: element.style.height,
			top: element.style.top,
			bottom: element.style.bottom
		};

		scroll(page.getByTestId('list').element());

		expect({
			height: element.style.height,
			top: element.style.top,
			bottom: element.style.bottom
		}).toEqual(before);
		await expect.element(page.getByTestId('scroll-up')).not.toHaveAttribute('data-visible');
	});

	describe('aligned popup scroll resizing', () => {
		async function renderAligned(options: {
			viewportHeight: number;
			triggerTop: number;
			positionerHeight: number;
			listScrollHeight: number;
			listClientHeight: number;
			selectedTextTop?: number;
			popupMaxHeight?: string;
			uncontrolledOpen?: boolean;
		}) {
			const {
				viewportHeight,
				triggerTop,
				positionerHeight,
				listScrollHeight,
				listClientHeight,
				selectedTextTop,
				popupMaxHeight = 'none',
				uncontrolledOpen = false
			} = options;
			stubProperty(docEl, 'clientHeight', viewportHeight);
			stubProperty(docEl, 'clientWidth', 400);
			let listScrollTop = 0;

			render(SelectHarness, {
				open: true,
				root: { defaultValue: 'selected' },
				trigger: stubbed((node) => stubRect(node, 10, triggerTop, 80, 30)),
				valueProps: stubbed((node) => stubRect(node, 10, triggerTop, 60, 30)),
				positioner: stubbed((node) => stubRect(node, 10, 0, 108, positionerHeight)),
				popup: { style: `max-height:${popupMaxHeight}` },
				list: true,
				listProps: stubbed((node) => {
					Object.defineProperty(node, 'scrollTop', {
						configurable: true,
						get: () => listScrollTop,
						set: (next: number) => (listScrollTop = next)
					});
					stubProperty(node, 'scrollHeight', listScrollHeight);
					stubProperty(node, 'clientHeight', listClientHeight);
				}),
				items: [
					{
						value: 'selected',
						text: 'Selected',
						textProps: stubbed((node) => {
							if (selectedTextTop != null) stubRect(node, 10, selectedTextTop, 80, 30);
						})
					},
					{ value: 'other', text: 'Other' }
				]
			});
			// `open` without a binding is the initial open state, as `defaultOpen` upstream. The
			// harness binds it, so a controlled open stays open until the test changes it.
			void uncontrolledOpen;

			const element = positioner().element() as HTMLElement;
			const list = page.getByTestId('list').element() as HTMLElement;
			await expect.element(positioner()).toHaveAttribute('data-side', 'none');

			return {
				positioner: element,
				list,
				getListScrollTop: () => listScrollTop,
				setListScrollTop: (next: number) => (listScrollTop = next)
			};
		}

		const base = {
			viewportHeight: 720,
			triggerTop: 300,
			positionerHeight: 200,
			listScrollHeight: 400,
			listClientHeight: 200
		};
		const topAnchored = {
			viewportHeight: 400,
			triggerTop: 200,
			positionerHeight: 200,
			listScrollHeight: 400,
			listClientHeight: 300,
			selectedTextTop: 300
		};

		it('anchors the popup to the viewport bottom when the selection sits near the list top', async () => {
			const { positioner: element } = await renderAligned(base);

			await expect.poll(() => element.style.bottom).toBe('0px');
			expect(element.style.top).toBe('');
		});

		it('grows a bottom-anchored popup as the list is scrolled and re-pins it to the top', async () => {
			const view = await renderAligned(base);
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');

			view.setListScrollTop(100);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe('300px');
			expect(view.getListScrollTop()).toBe(0);
		});

		it('consumes a sub-pixel overscroll into the popup height', async () => {
			const view = await renderAligned(base);
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');

			view.setListScrollTop(0.5);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe('200.5px');
			expect(view.getListScrollTop()).toBe(0);
		});

		it('leaves the popup height alone when the list is already at the anchored edge', async () => {
			const view = await renderAligned(base);
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');
			const heightBefore = view.positioner.style.height;

			view.setListScrollTop(0);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe(heightBefore);
		});

		it('grows a top-anchored popup upward and keeps the list pinned to the bottom', async () => {
			const view = await renderAligned(topAnchored);
			await expect.poll(() => view.positioner.style.top).toBe('0px');
			expect(view.positioner.style.bottom).toBe('');

			view.setListScrollTop(0);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe('300px');
			expect(view.getListScrollTop()).toBe(100);
		});

		it('stops growing a top-anchored popup once it fills the available height', async () => {
			const view = await renderAligned({ ...topAnchored, positionerHeight: 300 });
			await expect.poll(() => view.positioner.style.top).toBe('0px');

			view.setListScrollTop(0);
			scroll(view.list);
			await expect.poll(() => view.positioner.style.height).toBe('380px');

			view.setListScrollTop(50);
			scroll(view.list);
			await expect.poll(() => view.positioner.style.height).toBe('380px');
		});

		it('pins a top-anchored popup that already fills the viewport to the end of the list', async () => {
			const view = await renderAligned({ ...topAnchored, positionerHeight: 380 });
			await expect.poll(() => view.positioner.style.top).toBe('0px');
			const heightBefore = view.positioner.style.height;

			view.setListScrollTop(100);
			scroll(view.list);
			await expect.poll(view.getListScrollTop).toBe(100);
			expect(view.positioner.style.height).toBe(heightBefore);

			view.setListScrollTop(99.5);
			scroll(view.list);
			await expect.poll(() => view.positioner.style.height).toBe(heightBefore);
			expect(view.getListScrollTop()).toBe(99.5);
		});

		it('stops resizing once a max-height constrained popup is fully grown', async () => {
			const view = await renderAligned({ ...base, popupMaxHeight: '100px' });
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');
			const heightBefore = view.positioner.style.height;

			view.setListScrollTop(100);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe(heightBefore);
		});

		it('treats a zero max-height as unconstrained rather than collapsing the popup', async () => {
			const view = await renderAligned({ ...base, popupMaxHeight: '0px' });
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');

			view.setListScrollTop(100);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe('300px');
		});

		it('centers the transform origin when the positioner has no measurable height', async () => {
			const view = await renderAligned({ ...base, positionerHeight: 0, selectedTextTop: 100 });
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');

			expect(
				(page.getByTestId('popup').element() as HTMLElement).style.getPropertyValue(
					'--transform-origin'
				)
			).toBe('50% 50%');
		});

		it('never applies a non-positive height when the viewport collapses below the margins', async () => {
			const view = await renderAligned(base);
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');
			const heightBefore = view.positioner.style.height;

			stubProperty(docEl, 'clientHeight', 20);
			view.setListScrollTop(100);
			scroll(view.list);

			await expect.poll(() => view.positioner.style.height).toBe(heightBefore);
		});

		it('ignores a pinch-zoomed visual viewport outside WebKit', async () => {
			if (window.visualViewport) stubProperty(window.visualViewport, 'scale', 1.5);

			await renderAligned(base);

			await expect.element(positioner()).toHaveAttribute('data-side', 'none');
		});

		it('ignores scroll events bubbling to the popup while a Select.List owns scrolling', async () => {
			const view = await renderAligned(base);
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');
			const heightBefore = view.positioner.style.height;

			const popup = page.getByTestId('popup').element();
			stubProperty(popup, 'scrollTop', 50);
			stubProperty(popup, 'scrollHeight', 400);
			stubProperty(popup, 'clientHeight', 200);

			view.setListScrollTop(100);
			scroll(popup);
			await expect.poll(() => view.positioner.style.height).toBe(heightBefore);

			scroll(view.list);
			await expect.poll(() => view.positioner.style.height).toBe('300px');
		});

		it('grows the popup when it is itself the scroll container', async () => {
			stubProperty(docEl, 'clientHeight', 720);
			stubProperty(docEl, 'clientWidth', 400);
			let popupScrollTop = 0;
			render(SelectHarness, {
				open: true,
				root: { defaultValue: 'selected' },
				trigger: stubbed((node) => stubRect(node, 10, 300, 80, 30)),
				valueProps: stubbed((node) => stubRect(node, 10, 300, 60, 30)),
				positioner: stubbed((node) => stubRect(node, 10, 0, 108, 200)),
				popup: {
					style: 'max-height:none',
					...stubbed((node) => {
						Object.defineProperty(node, 'scrollTop', {
							configurable: true,
							get: () => popupScrollTop,
							set: (next: number) => (popupScrollTop = next)
						});
						stubProperty(node, 'scrollHeight', 400);
						stubProperty(node, 'clientHeight', 200);
					})
				},
				items: [
					{ value: 'selected', text: 'Selected' },
					{ value: 'other', text: 'Other' }
				]
			});
			const element = positioner().element() as HTMLElement;
			await expect.poll(() => element.style.bottom).toBe('0px');

			popupScrollTop = 100;
			scroll(page.getByTestId('popup').element());

			await expect.poll(() => element.style.height).toBe('300px');
			expect(popupScrollTop).toBe(0);
		});

		it('closes the aligned popup when the window is resized', async () => {
			const view = await renderAligned({ ...base, uncontrolledOpen: true });
			await expect.poll(() => view.positioner.style.bottom).toBe('0px');

			window.dispatchEvent(new UIEvent('resize'));

			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		});
	});

	describe('prop: finalFocus', () => {
		it('moves focus to the given element when the popup closes', async () => {
			const target = document.createElement('button');
			target.textContent = 'Target';
			document.body.append(target);
			restores.push(() => target.remove());
			render(SelectHarness, { popup: { finalFocus: target }, items: [{ value: 'close' }] });

			await userEvent.click(trigger());
			await expect.element(page.getByRole('listbox')).toBeVisible();
			await userEvent.keyboard('{Escape}');

			await expect.poll(() => document.activeElement).toBe(target);
		});

		it('keeps focus where it is when finalFocus is false', async () => {
			render(SelectHarness, { popup: { finalFocus: false }, items: [{ value: 'close' }] });

			await userEvent.click(trigger());
			await expect.element(option('close')).toBeVisible();
			await userEvent.click(option('close'));
			await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

			expect(document.activeElement).not.toBe(trigger().element());
		});

		it('returns focus to the trigger by default', async () => {
			render(SelectHarness, { items: [{ value: 'close' }] });

			await userEvent.click(trigger());
			await expect.element(page.getByRole('listbox')).toBeVisible();
			await userEvent.keyboard('{Escape}');

			await expect.element(trigger()).toHaveFocus();
		});
	});
});
