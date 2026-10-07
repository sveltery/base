// Assertions follow Base UI v1.8.0 packages/react/src/accordion/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, React.Activity, and preventBaseUIHandler are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccordionHarness from '../../tests/AccordionHarness.svelte';
import type { AccordionItemChangeEventDetails, AccordionRootChangeEventDetails } from './types.js';
import { Accordion } from './index.js';
import { REASONS } from '../internal/event-details.js';

const PANEL_1 = 'Panel contents 1';
const PANEL_2 = 'Panel contents 2';

const TRANSITION_CSS = `
	.transition-test-panel {
		overflow: hidden;
		height: var(--accordion-panel-height);
		transition: height 200ms linear;
	}
	.transition-test-panel[data-starting-style],
	.transition-test-panel[data-ending-style] {
		height: 0;
	}
`;

async function frames(count = 1) {
	for (let index = 0; index < count; index += 1) {
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}
	await tick();
}

const twoItems = [
	{ value: 0, label: 'Trigger 1', content: PANEL_1, testId: 'item-1' },
	{ value: 1, label: 'Trigger 2', content: PANEL_2, testId: 'item-2' }
];

describe('Accordion', () => {
	describe('context', () => {
		it('throws when Item is rendered outside Accordion.Root', async () => {
			await expect(async () => {
				await render(Accordion.Item);
			}).rejects.toThrow(
				'Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.'
			);
		});

		it('throws when Header is rendered outside Accordion.Item', async () => {
			await expect(async () => {
				await render(Accordion.Header);
			}).rejects.toThrow(
				'Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.'
			);
		});

		it('throws when Trigger is rendered outside Accordion.Item', async () => {
			await expect(async () => {
				await render(Accordion.Trigger);
			}).rejects.toThrow(
				'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.'
			);
		});
	});

	describe('ARIA attributes', () => {
		it('links the trigger and the panel', async () => {
			render(AccordionHarness, { value: [0] });
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			const panel = page.getByTestId('panel');

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger).toHaveAttribute('aria-controls', panel.element().id);
			expect(panel.element().id).toMatch(/^base-ui-/);
			await expect.element(panel).toHaveAttribute('role', 'region');
			await expect.element(panel).toHaveAttribute('aria-labelledby', trigger.element().id);
			expect(trigger.element().id).toMatch(/^base-ui-/);
		});

		it('references a manual panel id in aria-controls', async () => {
			render(AccordionHarness, {
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1, panelId: 'custom-panel-id' }]
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			const panel = page.getByTestId('panel');

			await expect.element(trigger).toHaveAttribute('aria-controls', 'custom-panel-id');
			await expect.element(panel).toHaveAttribute('id', 'custom-panel-id');
		});

		it('references a manual trigger id in aria-labelledby', async () => {
			render(AccordionHarness, {
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1, triggerId: 'custom-trigger-id' }]
			});
			const panel = page.getByTestId('panel');

			await expect.element(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id');
			await expect
				.element(page.getByRole('button', { name: 'Trigger 1' }))
				.toHaveAttribute('id', 'custom-trigger-id');
		});

		it('updates and restores panel labeling when the trigger id changes', async () => {
			render(AccordionHarness, { value: [0], showIdControls: true });
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			const panel = page.getByTestId('panel');
			const generated = trigger.element().id;

			await expect.element(panel).toHaveAttribute('aria-labelledby', generated);

			await page.getByRole('button', { name: 'Set id 1' }).click();
			await expect.element(trigger).toHaveAttribute('id', 'custom-trigger-id-1');
			await expect.element(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id-1');

			await page.getByRole('button', { name: 'Set id 2' }).click();
			await expect.element(trigger).toHaveAttribute('id', 'custom-trigger-id-2');
			await expect.element(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id-2');

			await page.getByRole('button', { name: 'Remove id' }).click();
			await expect.element(trigger).not.toHaveAttribute('id', 'custom-trigger-id-2');
			await expect.element(panel).toHaveAttribute('aria-labelledby', trigger.element().id);
			expect(trigger.element().id).toMatch(/^base-ui-/);
		});

		it('drops aria-controls and aria-labelledby when the panel or trigger unmounts', async () => {
			const view = render(AccordionHarness, {
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }]
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			const panel = page.getByTestId('panel');

			await expect.element(panel).toHaveAttribute('aria-labelledby', trigger.element().id);
			await expect.element(trigger).toHaveAttribute('aria-controls', panel.element().id);

			await view.rerender({
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1, showTrigger: false }]
			});
			await expect.element(page.getByTestId('panel')).not.toHaveAttribute('aria-labelledby');

			await view.rerender({
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }]
			});
			await expect
				.element(page.getByTestId('panel'))
				.toHaveAttribute(
					'aria-labelledby',
					page.getByRole('button', { name: 'Trigger 1' }).element().id
				);

			await view.rerender({
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1, showPanel: false }]
			});
			await expect
				.element(page.getByRole('button', { name: 'Trigger 1' }))
				.not.toHaveAttribute('aria-controls');
		});
	});

	describe('open state', () => {
		it('toggles one item closed by default', async () => {
			render(AccordionHarness);
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			const root = page.getByTestId('root');

			await expect.element(root).toHaveAttribute('data-orientation', 'vertical');
			await expect.element(root).not.toHaveAttribute('multiple');
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger).toHaveAttribute('data-panel-open', '');
			await expect.element(page.getByText(PANEL_1)).toBeVisible();
			await expect.element(page.getByTestId('panel')).toHaveAttribute('data-open', '');

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
		});

		it('starts open from value', async () => {
			render(AccordionHarness, {
				value: ['first'],
				items: [
					{ value: 'first', label: 'Trigger 1', content: PANEL_1 },
					{ value: 'second', label: 'Trigger 2', content: PANEL_2 }
				]
			});

			await expect.element(page.getByText(PANEL_1)).toBeVisible();
			await expect.element(page.getByTestId('panel')).toHaveAttribute('data-open', '');
			expect(page.getByText(PANEL_2).elements()).toHaveLength(0);
		});

		it('follows a parent value until a click, then until the parent changes it', async () => {
			render(AccordionHarness, { value: [], showValueControls: true });
			const trigger = page.getByRole('button', { name: 'Trigger 1' });

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await page.getByRole('button', { name: 'Set open' }).click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByText(PANEL_1)).toBeVisible();

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);

			await page.getByRole('button', { name: 'Set open' }).click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		});

		it('shares value with the parent when bound', async () => {
			render(AccordionHarness, {
				bound: true,
				value: [],
				showValueControls: true,
				items: [{ value: 'one', label: 'Trigger 1', content: PANEL_1 }]
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await page.getByRole('button', { name: 'Set closed' }).click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('multiple', () => {
		it('keeps every opened item when multiple is true', async () => {
			render(AccordionHarness, { multiple: true, items: twoItems });
			const root = page.getByTestId('root');
			const first = page.getByRole('button', { name: 'Trigger 1' });
			const second = page.getByRole('button', { name: 'Trigger 2' });

			await expect.element(root).not.toHaveAttribute('multiple');
			await first.click();
			await second.click();

			await expect.element(page.getByText(PANEL_1)).toHaveAttribute('data-open', '');
			await expect.element(page.getByText(PANEL_2)).toHaveAttribute('data-open', '');
			await expect.element(first).toHaveAttribute('data-panel-open', '');
			await expect.element(second).toHaveAttribute('data-panel-open', '');

			await first.click();
			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
			await expect.element(page.getByText(PANEL_2)).toHaveAttribute('data-open', '');
			await expect.element(first).not.toHaveAttribute('data-panel-open');
			await expect.element(second).toHaveAttribute('data-panel-open', '');
		});

		it('leaves only the latest item open when multiple is false', async () => {
			render(AccordionHarness, { multiple: false, items: twoItems });
			const first = page.getByRole('button', { name: 'Trigger 1' });
			const second = page.getByRole('button', { name: 'Trigger 2' });

			await first.click();
			await expect.element(page.getByText(PANEL_1)).toHaveAttribute('data-open', '');
			await second.click();

			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
			await expect.element(page.getByText(PANEL_2)).toHaveAttribute('data-open', '');
			await expect.element(first).not.toHaveAttribute('data-panel-open');
			await expect.element(second).toHaveAttribute('data-panel-open', '');
		});
	});

	describe('disabled', () => {
		it('marks every part disabled when the root is disabled', async () => {
			render(AccordionHarness, {
				value: [0],
				disabled: true,
				items: twoItems
			});
			const root = page.getByTestId('root');
			const [header1, header2] = [
				page.getByRole('heading', { name: 'Trigger 1' }),
				page.getByRole('heading', { name: 'Trigger 2' })
			];

			await expect.element(root).toHaveAttribute('data-disabled', '');
			for (const locator of [
				page.getByTestId('item-1'),
				header1,
				page.getByRole('button', { name: 'Trigger 1' }),
				page.getByText(PANEL_1),
				page.getByTestId('item-2'),
				header2,
				page.getByRole('button', { name: 'Trigger 2' })
			]) {
				await expect.element(locator).toHaveAttribute('data-disabled', '');
			}
		});

		it('marks one item disabled and still opens its sibling', async () => {
			render(AccordionHarness, {
				value: [0],
				items: [
					{ value: 0, label: 'Trigger 1', content: PANEL_1, testId: 'item-1', disabled: true },
					{ value: 1, label: 'Trigger 2', content: PANEL_2, testId: 'item-2' }
				]
			});

			await expect.element(page.getByTestId('item-1')).toHaveAttribute('data-disabled', '');
			await expect
				.element(page.getByRole('heading', { name: 'Trigger 1' }))
				.toHaveAttribute('data-disabled', '');
			await expect
				.element(page.getByRole('button', { name: 'Trigger 1' }))
				.toHaveAttribute('data-disabled', '');
			await expect.element(page.getByText(PANEL_1)).toHaveAttribute('data-disabled', '');
			await expect.element(page.getByTestId('item-2')).not.toHaveAttribute('data-disabled');

			await page.getByRole('button', { name: 'Trigger 2' }).click();
			await expect.element(page.getByText(PANEL_2)).toHaveAttribute('data-open', '');
			await expect
				.element(page.getByRole('button', { name: 'Trigger 1' }))
				.toHaveAttribute('aria-expanded', 'false');
		});

		it.each(['root', 'item'] as const)(
			'does not toggle or fire callbacks when the %s is disabled',
			async (part) => {
				const onValueChange = vi.fn();
				const onOpenChange = vi.fn();
				render(AccordionHarness, {
					disabled: part === 'root',
					items: [
						{
							value: 0,
							label: 'Trigger 1',
							content: PANEL_1,
							disabled: part === 'item',
							passTriggerDisabled: true,
							triggerDisabled: false
						}
					],
					onValueChange,
					onOpenChange
				});
				const trigger = page.getByRole('button', { name: 'Trigger 1' });

				await expect.element(trigger).toHaveAttribute('aria-disabled', 'true');
				await expect.element(trigger).not.toHaveAttribute('disabled');
				(trigger.element() as HTMLButtonElement).click();
				trigger.element().focus();
				await userEvent.keyboard('{Space}');
				await userEvent.keyboard('{Enter}');
				await tick();

				await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
				expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
				expect(onValueChange).not.toHaveBeenCalled();
				expect(onOpenChange).not.toHaveBeenCalled();
			}
		);
	});

	describe('keyboard', () => {
		it.each([true, false])(
			'toggles on Enter and Space when nativeButton is %s',
			async (nativeButton) => {
				render(AccordionHarness, {
					items: [
						{
							value: 0,
							label: 'Trigger 1',
							content: PANEL_1,
							nativeButton,
							triggerAs: nativeButton ? 'button' : 'span'
						}
					]
				});
				const trigger = page.getByRole('button', { name: 'Trigger 1' });

				await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
				if (!nativeButton) await expect.element(trigger).toHaveAttribute('tabindex', '0');
				trigger.element().focus();
				await userEvent.keyboard('{Enter}');
				await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
				await expect.element(page.getByText(PANEL_1)).toBeVisible();

				await userEvent.keyboard('{Space}');
				await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
				expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
			}
		);

		it.each([true, false])('opens on Space keyup when nativeButton is %s', async (nativeButton) => {
			const onOpenChange = vi.fn();
			render(AccordionHarness, {
				items: [
					{
						value: 0,
						label: 'Trigger 1',
						content: PANEL_1,
						nativeButton,
						triggerAs: nativeButton ? 'button' : 'span'
					}
				],
				onOpenChange
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			trigger.element().focus();

			await userEvent.keyboard('{Space>}');
			await tick();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(onOpenChange).not.toHaveBeenCalled();

			await userEvent.keyboard('{/Space}');
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			expect(onOpenChange).toHaveBeenCalledTimes(1);
			expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
		});
	});

	describe('callbacks', () => {
		it('reports trigger-press details and the next values', async () => {
			const onValueChange = vi.fn();
			render(AccordionHarness, { multiple: true, items: twoItems, onValueChange });
			const first = page.getByRole('button', { name: 'Trigger 1' });
			const second = page.getByRole('button', { name: 'Trigger 2' });

			await first.click();
			expect(onValueChange).toHaveBeenCalledTimes(1);
			const [opened, details] = onValueChange.mock.calls[0] as [
				unknown[],
				AccordionRootChangeEventDetails
			];
			expect(opened).toEqual([0]);
			expect(details.reason).toBe(REASONS.triggerPress);
			expect(details.event.type).not.toBe('base-ui');
			expect(details.isCanceled).toBe(false);

			second.element().focus();
			await userEvent.keyboard('{Space}');
			expect(onValueChange).toHaveBeenCalledTimes(2);
			expect(onValueChange.mock.calls[1]?.[0]).toEqual([0, 1]);
		});

		it('keeps custom item values in click order', async () => {
			const onValueChange = vi.fn();
			render(AccordionHarness, {
				multiple: true,
				items: [
					{ value: 'one', label: 'Trigger 1', content: '1' },
					{ value: 'two', label: 'Trigger 2', content: '2' }
				],
				onValueChange
			});

			await page.getByRole('button', { name: 'Trigger 2' }).click();
			expect(onValueChange.mock.calls[0]?.[0]).toEqual(['two']);
			await page.getByRole('button', { name: 'Trigger 1' }).click();
			expect(onValueChange.mock.calls[1]?.[0]).toEqual(['two', 'one']);
		});

		it('replaces the open value when multiple is false', async () => {
			const onValueChange = vi.fn();
			render(AccordionHarness, {
				items: [
					{ value: 'one', label: 'Trigger 1', content: '1' },
					{ value: 'two', label: 'Trigger 2', content: '2' }
				],
				onValueChange
			});

			await page.getByRole('button', { name: 'Trigger 1' }).click();
			expect(onValueChange.mock.calls[0]?.[0]).toEqual(['one']);
			await page.getByRole('button', { name: 'Trigger 2' }).click();
			expect(onValueChange.mock.calls[1]?.[0]).toEqual(['two']);
		});

		it('preventDefault on click skips the toggle', async () => {
			const onValueChange = vi.fn();
			render(AccordionHarness, { onValueChange });
			const trigger = page.getByRole('button', { name: 'Trigger 1' });
			trigger.element().addEventListener('click', (event) => event.preventDefault(), true);

			(trigger.element() as HTMLButtonElement).click();
			await tick();

			expect(onValueChange).not.toHaveBeenCalled();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('cancel', () => {
		it('item onOpenChange cancel prevents opening and skips onValueChange', async () => {
			const onValueChange = vi.fn();
			render(AccordionHarness, {
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }],
				onValueChange,
				onOpenChange: (nextOpen: boolean, details: AccordionItemChangeEventDetails) => {
					if (nextOpen) details.cancel();
				}
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('onValueChange cancel prevents opening', async () => {
			const onValueChange = vi.fn((_value: unknown[], details: AccordionRootChangeEventDetails) => {
				details.cancel();
			});
			render(AccordionHarness, {
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }],
				onValueChange
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(page.getByText(PANEL_1).elements()).toHaveLength(0);
		});

		it('onValueChange cancel prevents closing', async () => {
			const onValueChange = vi.fn((_value: unknown[], details: AccordionRootChangeEventDetails) => {
				details.cancel();
			});
			render(AccordionHarness, {
				value: [0],
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }],
				onValueChange
			});
			const trigger = page.getByRole('button', { name: 'Trigger 1' });

			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByText(PANEL_1)).toHaveAttribute('data-open', '');
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0]?.[0]).toEqual([]);
		});

		it('onValueChange cancel prevents opening while multiple', async () => {
			const onValueChange = vi.fn((_value: unknown[], details: AccordionRootChangeEventDetails) => {
				details.cancel();
			});
			render(AccordionHarness, {
				multiple: true,
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }],
				onValueChange
			});

			await page.getByRole('button', { name: 'Trigger 1' }).click();
			await expect
				.element(page.getByRole('button', { name: 'Trigger 1' }))
				.toHaveAttribute('aria-expanded', 'false');
			expect(onValueChange).toHaveBeenCalledTimes(1);
		});

		it('onValueChange cancel prevents closing while multiple', async () => {
			const onValueChange = vi.fn((_value: unknown[], details: AccordionRootChangeEventDetails) => {
				details.cancel();
			});
			render(AccordionHarness, {
				value: [0],
				multiple: true,
				items: [{ value: 0, label: 'Trigger 1', content: PANEL_1 }],
				onValueChange
			});

			await page.getByRole('button', { name: 'Trigger 1' }).click();
			await expect
				.element(page.getByRole('button', { name: 'Trigger 1' }))
				.toHaveAttribute('aria-expanded', 'true');
			expect(onValueChange).toHaveBeenCalledTimes(1);
		});
	});

	describe('item state', () => {
		it('does not show data-hidden once the item is open', async () => {
			render(AccordionHarness, {
				recordState: true,
				items: [{ value: 0, label: 'Trigger', content: 'Panel', testId: 'item' }]
			});
			const item = page.getByTestId('item');
			let sawHiddenWhileOpen = false;
			const observer = new MutationObserver(() => {
				const element = item.elements()[0];
				if (element?.hasAttribute('data-open') && element.hasAttribute('data-hidden')) {
					sawHiddenWhileOpen = true;
				}
			});
			observer.observe(document.body, { attributes: true, subtree: true, childList: true });

			await page.getByRole('button', { name: 'Trigger' }).click();
			await frames(2);
			observer.disconnect();

			expect(sawHiddenWhileOpen).toBe(false);
			await expect.element(item).toHaveAttribute('data-open', '');
			await expect.element(item).not.toHaveAttribute('data-hidden');
			await expect.element(item).toHaveAttribute('data-index', '0');
			await expect.element(page.getByTestId('state-log')).toHaveAttribute('data-saw-open', 'true');
			await expect.element(page.getByTestId('state-log')).toHaveAttribute('data-saw-bad', 'false');
		});
	});

	describe('panel mounting', () => {
		it('warns when root hiddenUntilFound overrides keepMounted={false}', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				render(AccordionHarness, { hiddenUntilFound: true, keepMounted: false });
				await tick();
				expect(warnSpy).toHaveBeenCalledWith(
					'Base UI: The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.'
				);
				expect(page.getByText(PANEL_1).element().getAttribute('hidden')).toBe('until-found');
			} finally {
				warnSpy.mockRestore();
			}
		});

		it('warns when a panel sets hiddenUntilFound and keepMounted={false}', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				render(AccordionHarness, {
					items: [
						{
							value: 0,
							label: 'Trigger 1',
							content: PANEL_1,
							passHiddenUntilFound: true,
							hiddenUntilFound: true,
							passKeepMounted: true,
							keepMounted: false
						}
					]
				});
				await tick();
				expect(warnSpy).toHaveBeenCalledWith(
					'Base UI: The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.'
				);
				expect(page.getByText(PANEL_1).element().getAttribute('hidden')).toBe('until-found');
			} finally {
				warnSpy.mockRestore();
			}
		});

		it('keeps a closed panel mounted when the root asks for it', async () => {
			render(AccordionHarness, { keepMounted: true });
			await expect.element(page.getByText(PANEL_1)).toHaveAttribute('hidden');
		});

		it('passes root hiddenUntilFound to panels and lets a panel override it', async () => {
			render(AccordionHarness, {
				hiddenUntilFound: true,
				keepMounted: true,
				items: [
					{ value: 0, label: 'Trigger 1', content: PANEL_1 },
					{
						value: 1,
						label: 'Trigger 2',
						content: 'Overridden panel',
						passHiddenUntilFound: true,
						hiddenUntilFound: false,
						passKeepMounted: true,
						keepMounted: false
					}
				]
			});

			expect(page.getByText(PANEL_1).element().getAttribute('hidden')).toBe('until-found');
			expect(page.getByText('Overridden panel').elements()).toHaveLength(0);
		});

		it('opens from beforematch', async () => {
			const onValueChange = vi.fn();
			render(AccordionHarness, {
				hiddenUntilFound: true,
				items: [{ value: 'one', label: 'Trigger 1', content: PANEL_1 }],
				onValueChange
			});
			const panel = page.getByTestId('panel');
			const trigger = page.getByRole('button', { name: 'Trigger 1' });

			expect(panel.element().getAttribute('hidden')).toBe('until-found');
			panel.element().dispatchEvent(new Event('beforematch', { bubbles: true }));
			await tick();

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(panel).toHaveAttribute('data-open', '');
			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0]?.[0]).toEqual(['one']);
			expect(onValueChange.mock.calls[0]?.[1].reason).toBe(REASONS.none);
		});

		it('suppresses the initial open keyframe', async () => {
			render(AccordionHarness, {
				value: [0],
				items: [
					{
						value: 0,
						label: 'Trigger',
						content: PANEL_1,
						panelClass: 'animation-test-panel',
						panelStyle: 'animation-duration:100ms;animation-name:panel-slide-down'
					}
				],
				css: `
					@keyframes panel-slide-down {
						from { height: 0; }
						to { height: var(--accordion-panel-height); }
					}
				`
			});
			const panel = page.getByTestId('panel');

			await expect.element(panel).toHaveAttribute('data-open', '');
			expect(panel.element().style.animationName).toBe('none');
			expect(panel.element().style.animationDuration).toBe('100ms');
			expect(panel.element().style.getPropertyValue('--accordion-panel-height')).toBe('auto');
		});
	});

	describe('CSS transitions', () => {
		it('keeps the closing panel visible until its exit transition completes', async () => {
			render(AccordionHarness, {
				value: [0],
				items: [
					{
						value: 0,
						label: 'Trigger 1',
						content: 'First panel',
						panelClass: 'transition-test-panel',
						panelTestId: 'panel-1',
						passKeepMounted: true,
						keepMounted: true
					},
					{
						value: 1,
						label: 'Trigger 2',
						content: 'Second panel',
						panelClass: 'transition-test-panel',
						panelTestId: 'panel-2',
						passKeepMounted: true,
						keepMounted: true
					}
				],
				css: TRANSITION_CSS
			});
			const panel1 = page.getByTestId('panel-1');
			const panel2 = page.getByTestId('panel-2');

			await expect
				.poll(() => panel1.element().style.getPropertyValue('--accordion-panel-height'))
				.toBe('auto');

			await page.getByRole('button', { name: 'Trigger 2' }).click();

			await expect.poll(() => panel1.element().hasAttribute('data-ending-style')).toBe(true);
			expect(panel1.element().hasAttribute('hidden')).toBe(false);
			expect(panel1.element().style.getPropertyValue('--accordion-panel-height')).toMatch(/px$/);
			await expect.element(panel2).toHaveAttribute('data-open', '');

			await expect.poll(() => panel1.element().hasAttribute('hidden')).toBe(true);
			expect(panel2.element().hasAttribute('hidden')).toBe(false);
		});
	});
});
