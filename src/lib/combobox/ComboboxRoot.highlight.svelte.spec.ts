// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx,
// "prop: autoHighlight" through "highlight restoration when clearing the query" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `setProps` is a write to a bound prop.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { REASONS } from '@sveltery/utils';
import { renderBound } from '../../tests/bound-render.svelte.js';
import ComboboxHarness, { type HarnessItem } from '../../tests/ComboboxHarness.svelte';

const input = () => page.getByTestId('input');
const trigger = () => page.getByTestId('trigger');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const listbox = () => page.getByRole('listbox');
const activeId = () => input().element().getAttribute('aria-activedescendant');
const activeText = () => {
	const id = activeId();
	return id ? document.getElementById(id)?.textContent?.trim() : undefined;
};
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};

const languages = [
	{ id: 'js', value: 'JavaScript' },
	{ id: 'ts', value: 'TypeScript' },
	{ id: 'py', value: 'Python' },
	{ id: 'rb', value: 'Ruby' }
];
type Language = (typeof languages)[number];
const languageLabel = (item: Language) => item.value;

describe('Combobox.Root', () => {
	describe('prop: autoHighlight', () => {
		describe('asynchronous items', () => {
			function renderAsync(
				initial: Record<string, unknown> = {},
				root: Record<string, unknown> = {}
			) {
				return renderBound(ComboboxHarness, {
					items: [] as unknown,
					trigger: true,
					empty: 'No matches',
					...initial,
					root: { autoHighlight: true, filter: null, ...root }
				});
			}

			it.each(['items', 'filteredItems'] as const)(
				'highlights a candidate arriving after typing with %s',
				async (dataProp) => {
					const onItemHighlighted = vi.fn();
					const onValueChange = vi.fn();
					const props = renderAsync(
						dataProp === 'items' ? {} : { items: undefined, filteredItems: () => [] },
						{ onItemHighlighted, onValueChange }
					);
					await userEvent.type(input(), '32');
					onItemHighlighted.mockClear();
					if (dataProp === 'items') props.items = ['32', '320'];
					else props.filteredItems = () => ['32', '320'];

					await expect.element(option('32')).toHaveAttribute('data-highlighted');
					expect(activeId()).toBe(option('32').element().id);
					expect(onItemHighlighted).toHaveBeenCalledExactlyOnceWith(
						'32',
						expect.objectContaining({ index: 0, reason: 'none' })
					);

					await userEvent.keyboard('{Enter}');
					expect(onValueChange).toHaveBeenCalledExactlyOnceWith('32', expect.anything());
				}
			);

			it('waits for a controlled popup to open', async () => {
				const props = renderAsync({ items: ['32'], open: false, refuseOpen: true });
				await userEvent.type(input(), '32');
				props.refuseOpen = false;
				props.open = true;
				await expect.element(page.getByRole('option')).toHaveAttribute('data-highlighted');
			});

			it('discards the request when a rejected typed open is followed by a controlled open', async () => {
				const props = renderAsync(
					{ items: ['32'], open: false },
					{
						onOpenChange: (next: boolean, details: { reason: string; cancel(): void }) => {
							if (next && details.reason === REASONS.inputChange) details.cancel();
						}
					}
				);
				await userEvent.type(input(), '32');
				props.open = true;
				await expect.element(page.getByRole('option')).toBeInTheDocument();
				await flush();
				await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
			});

			it('keeps a hovered item highlighted when individually rendered items arrive', async () => {
				const props = renderBound(ComboboxHarness, {
					staticItems: [] as HarnessItem[],
					root: { autoHighlight: true }
				});
				await userEvent.type(input(), 'a');
				props.staticItems = ['a1', 'a2', 'a3'].map((value) => ({ value }));

				await expect.element(option('a3')).toBeInTheDocument();
				await userEvent.hover(option('a3'));
				await expect.element(option('a3')).toHaveAttribute('data-highlighted');
			});

			it('highlights the first result when typing filters out individually rendered items', async () => {
				renderBound(ComboboxHarness, {
					inputValue: '',
					staticItems: ['apple', 'banana', 'blackberry', 'blueberry'].map((value) => ({ value })),
					staticFilter: (item: HarnessItem, query: string) => String(item.value).includes(query),
					root: { autoHighlight: true }
				});

				await userEvent.type(input(), 'b');
				await userEvent.keyboard('{ArrowDown}');
				await expect.element(option('blackberry')).toHaveAttribute('data-highlighted');

				await userEvent.type(input(), 'l');
				await expect.element(option('blackberry')).toHaveAttribute('data-highlighted');
				expect(activeId()).toBe(option('blackberry').element().id);
			});

			it('discards the request when an ignored typed open is followed by another open', async () => {
				const onOpenChange = vi.fn();
				const props = renderAsync(
					{ items: ['32'], open: false, refuseOpen: true },
					{ onOpenChange }
				);
				await userEvent.type(input(), '32');
				await userEvent.click(trigger());
				await expect
					.poll(() => onOpenChange.mock.lastCall)
					.toEqual([true, expect.objectContaining({ reason: REASONS.triggerPress })]);
				props.refuseOpen = false;
				props.open = true;
				await expect.element(page.getByRole('option')).toBeInTheDocument();
				await flush();
				await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
			});

			it.each(['Trigger', 'ArrowDown'] as const)(
				'discards the request when a rejected typed open is followed by opening with %s',
				async (method) => {
					renderAsync(
						{ items: ['32', '320'] },
						{
							onOpenChange: (next: boolean, details: { reason: string; cancel(): void }) => {
								if (next && details.reason === REASONS.inputChange) details.cancel();
							}
						}
					);
					input().element().focus();
					await userEvent.keyboard('32');
					expect(document.querySelector('[role="listbox"]')).toBeNull();

					if (method === 'Trigger') await userEvent.click(trigger());
					else await userEvent.keyboard('{ArrowDown}');

					await expect.element(option('32')).toBeInTheDocument();
					await flush();
					await expect.element(option('32')).not.toHaveAttribute('data-highlighted');
					expect(activeId()).toBeNull();
				}
			);

			it('discards the request when the controlled input is cleared', async () => {
				const onValueChange = vi.fn();
				const props = renderAsync({ inputValue: '' }, { onValueChange });
				await userEvent.type(input(), '32');
				props.inputValue = '';
				await flush();
				props.items = ['32'];

				await expect.element(page.getByRole('option')).toBeInTheDocument();
				await flush();
				await expect.element(input()).toHaveValue('');
				expect(activeId()).toBeNull();
				await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
				await userEvent.keyboard('{Enter}');
				expect(onValueChange).not.toHaveBeenCalled();
			});

			it('discards the request when a controlled close is interrupted', async () => {
				const props = renderAsync({ open: true });
				await userEvent.type(input(), '32');
				const animation = page
					.getByTestId('popup')
					.element()
					.animate({ opacity: [1, 0] }, { duration: 10000 });
				try {
					props.open = false;
					props.items = ['32'];
					await flush();
					props.open = true;
					await flush();
					await expect.element(input()).toHaveValue('32');
					await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
				} finally {
					animation.cancel();
				}
			});

			it('does not reset keyboard navigation when candidates change', async () => {
				const props = renderAsync();
				await userEvent.type(input(), '32');
				props.items = ['32', '320'];
				await expect.element(option('32')).toHaveAttribute('data-highlighted');
				await userEvent.keyboard('{ArrowDown}');
				await expect.element(option('320')).toHaveAttribute('data-highlighted');
				props.items = ['321', '320'];
				await flush();
				await expect.element(option('320')).toHaveAttribute('data-highlighted');
			});

			it('discards the request when autoHighlight is disabled', async () => {
				const props = renderAsync();
				await userEvent.type(input(), '32');
				props.root = { autoHighlight: false, filter: null };
				await flush();
				props.root = { autoHighlight: true, filter: null };
				props.items = ['32'];
				await expect.element(page.getByRole('option')).toBeInTheDocument();
				await flush();
				await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
			});
		});

		it('does not auto-highlight on initial open when no selection', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true }
			});

			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		});

		it('shows the selected item as selected on initial open (no active highlight)', async () => {
			render(ComboboxHarness, {
				open: true,
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true, defaultValue: 'banana' }
			});

			await expect.element(option('banana')).toHaveAttribute('aria-selected', 'true');
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
		});

		it('highlights the first matching item after typing (single mode)', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true }
			});

			await userEvent.type(input(), 'ch');
			await expect.element(option('cherry')).toBeInTheDocument();
			await expect.poll(activeId).toBe(option('cherry').element().id);
		});

		it('highlights the first matching item after IME composition', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true, openOnInputClick: false }
			});

			const element = input().element() as HTMLInputElement;
			element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
			element.value = 'ch';
			element.dispatchEvent(new Event('input', { bubbles: true }));
			element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'ch' }));

			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(option('cherry')).toBeInTheDocument();
			await expect.poll(activeId).toBe(option('cherry').element().id);
		});

		it('highlights the first matching item for a static list without the items prop', async () => {
			render(ComboboxHarness, {
				staticItems: [{ value: 'alpha' }, { value: 'alphabet' }, { value: 'beta' }],
				root: { autoHighlight: true }
			});

			await userEvent.type(input(), 'al');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(option('alpha').element().id);

			await userEvent.type(input(), ' ');
			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(option('alpha').element().id);
		});

		it('keeps gridcell typeahead active across Space in row mode without selecting', async () => {
			const onValueChange = vi.fn();
			render(ComboboxHarness, {
				rows: [
					['new york', 'new jersey'],
					['old town', 'other']
				],
				root: { autoHighlight: true, grid: true, onValueChange }
			});

			await userEvent.type(input(), 'new');
			const newYork = page.getByRole('gridcell', { name: 'new york' });
			await expect.element(newYork).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(newYork.element().id);

			await userEvent.type(input(), ' ');
			await expect.element(newYork).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(newYork.element().id);
			await expect.element(input()).toHaveValue('new ');
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('does not run follow-up state changes after canceled input value changes', async () => {
			const onValueChange = vi.fn();
			const onOpenChange = vi.fn();
			const onInputValueChange = vi.fn((_value: string, details: { cancel(): void }) => {
				details.cancel();
			});
			render(ComboboxHarness, {
				staticItems: [{ value: 'apple' }, { value: 'banana' }],
				root: {
					defaultValue: 'apple',
					openOnInputClick: false,
					onInputValueChange,
					onOpenChange,
					onValueChange
				}
			});

			await userEvent.clear(input());

			expect(onInputValueChange).toHaveBeenCalled();
			expect(onValueChange).not.toHaveBeenCalled();
			expect(onOpenChange).not.toHaveBeenCalled();
			expect(document.querySelector('[role="listbox"]')).toBeNull();

			onInputValueChange.mockClear();
			onOpenChange.mockClear();

			await userEvent.type(input(), 'b');

			expect(onInputValueChange).toHaveBeenCalled();
			expect(onOpenChange).not.toHaveBeenCalled();
			expect(document.querySelector('[role="listbox"]')).toBeNull();
		});

		it('retains highlight when query is cleared back to empty', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true }
			});

			await userEvent.type(input(), 'a');
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('aria-activedescendant');

			await userEvent.clear(input());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('aria-activedescendant');
		});

		it('retains highlight when clearing the query with input-change behavior', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.type(input(), 'ban');
			await expect.element(option('banana')).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('aria-activedescendant');

			await userEvent.clear(input());
			await expect.element(listbox()).toBeInTheDocument();
			await expect.element(input()).toHaveAttribute('aria-activedescendant');
		});

		it('highlights the first matching item after typing (multiple mode)', async () => {
			render(ComboboxHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { multiple: true, autoHighlight: true }
			});

			await userEvent.type(input(), 'ba');
			await expect.element(listbox()).toBeInTheDocument();
			await expect.poll(activeText).toBe('banana');
		});

		it('clears highlight after removing the highlighted chip while filtering (multiple mode)', async () => {
			render(ComboboxHarness, {
				open: true,
				chips: true,
				items: ['apple', 'banana', 'cherry'],
				root: { multiple: true, autoHighlight: true, defaultValue: ['apple'] }
			});

			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.type(input(), 'a');
			await expect.element(input()).toHaveAttribute('aria-activedescendant');

			await userEvent.click(page.getByTestId('remove-apple'));
			await expect.poll(activeId).toBeNull();
		});

		it('keeps the active item highlighted after clearing the last selected value', async () => {
			render(ComboboxHarness, {
				items: languages,
				itemLabel: languageLabel,
				root: { multiple: true, itemToStringLabel: languageLabel }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.click(option('JavaScript'));
			await userEvent.click(option('TypeScript'));

			await userEvent.type(input(), 'pyth');
			await userEvent.click(option('Python'));
			await expect.element(listbox()).not.toBeInTheDocument();

			input().element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.hover(option('JavaScript'));
			await userEvent.click(option('JavaScript'));
			await userEvent.hover(option('TypeScript'));
			await userEvent.click(option('TypeScript'));
			await userEvent.hover(option('Python'));
			await userEvent.click(option('Python'));

			await expect.poll(activeId).toBe(option('Python').element().id);

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(activeId).toBe(option('Ruby').element().id);
		});

		it('does not shift highlight to the previous selected item on Enter deselect', async () => {
			render(ComboboxHarness, {
				items: languages.slice(0, 3),
				itemLabel: languageLabel,
				root: {
					multiple: true,
					itemToStringLabel: languageLabel,
					defaultValue: [languages[0], languages[1]]
				}
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			const typeScript = option('TypeScript');
			await userEvent.hover(typeScript);
			await expect.poll(activeId).toBe(typeScript.element().id);
			await expect.element(typeScript).toHaveAttribute('aria-selected', 'true');

			await userEvent.keyboard('{Enter}');

			await expect.element(typeScript).toHaveAttribute('aria-selected', 'false');
			expect(activeId()).toBe(typeScript.element().id);
		});

		it('continues ArrowDown navigation from the Enter-selected item (multiple mode)', async () => {
			render(ComboboxHarness, {
				chips: true,
				items: languages.slice(0, 3),
				itemLabel: languageLabel,
				root: { multiple: true, itemToStringLabel: languageLabel }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			const typeScript = option('TypeScript');
			await userEvent.hover(typeScript);
			await expect.poll(activeId).toBe(typeScript.element().id);

			await userEvent.keyboard('{Enter}');
			await expect.poll(activeId).toBe(typeScript.element().id);

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(activeId).toBe(option('Python').element().id);
		});

		it('clears active highlight when removing the highlighted chip item', async () => {
			render(ComboboxHarness, {
				chips: true,
				items: languages.slice(0, 3),
				itemLabel: languageLabel,
				root: {
					multiple: true,
					itemToStringLabel: languageLabel,
					defaultValue: [languages[0], languages[1]]
				}
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant');

			const highlightedLabel = activeText();
			expect(highlightedLabel).toBeTruthy();

			(page.getByTestId(`remove-${highlightedLabel}`).element() as HTMLElement).click();
			await expect.poll(activeId).toBeNull();
		});

		it('keeps highlight in sync after selecting then backspacing to a single match', async () => {
			render(ComboboxHarness, {
				items: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'],
				root: { autoHighlight: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.click(option('epsilon'));
			await expect.element(listbox()).not.toBeInTheDocument();

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.keyboard('{Backspace}');
			await expect.element(option('epsilon')).toBeInTheDocument();
			await expect.poll(activeId).toBe(option('epsilon').element().id);
		});

		it('navigates on first ArrowDown after editing selection to a new matching query', async () => {
			render(ComboboxHarness, {
				items: ['Apple', 'Grape', 'Grapefruit'],
				root: { autoHighlight: true }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.click(option('Apple'));

			await userEvent.click(input());
			await userEvent.clear(input());
			await userEvent.type(input(), 'Ape');
			await expect.element(listbox()).toBeInTheDocument();

			await expect.poll(activeId).toBe(option('Grape').element().id);

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(activeId).toBe(option('Grapefruit').element().id);
		});

		it('updates highlighted callback with newly filtered first item', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, {
				open: true,
				items: ['banana', 'apple', 'apricot'],
				root: { autoHighlight: true, onItemHighlighted }
			});

			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');

			await expect.poll(() => onItemHighlighted.mock.calls.length).toBeGreaterThan(0);
			expect(onItemHighlighted.mock.lastCall?.[0]).toBe('banana');

			onItemHighlighted.mockClear();
			await userEvent.type(input(), 'ap');

			await expect.poll(() => onItemHighlighted.mock.calls.length).toBeGreaterThan(0);
			const [nextValue, data] = onItemHighlighted.mock.lastCall ?? [];
			expect(nextValue).toBe('apple');
			expect(data.reason).toBe('none');
			expect(data.index).toBe(0);
		});

		it('fires a single clearing highlight on Enter selection', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, {
				items: ['Apple', 'Apricot', 'Banana'],
				root: { autoHighlight: true, onItemHighlighted }
			});

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.type(input(), 'app');

			onItemHighlighted.mockClear();
			await userEvent.keyboard('{Enter}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await flush();

			const clearingCalls = onItemHighlighted.mock.calls.filter((call) => call[0] === undefined);
			expect(clearingCalls.length).toBe(1);
			const postClearCalls = onItemHighlighted.mock.calls.slice(
				onItemHighlighted.mock.calls.indexOf(clearingCalls[0]) + 1
			);
			expect(postClearCalls.every((call) => call[0] === undefined)).toBe(true);
		});
	});

	describe('prop: onItemHighlighted', () => {
		it('fires on keyboard navigation', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, { items: ['a', 'b', 'c'], root: { onItemHighlighted } });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.keyboard('{ArrowDown}');

			await expect.poll(() => onItemHighlighted.mock.calls.length).toBeGreaterThan(0);
			const [value, details] = onItemHighlighted.mock.lastCall ?? [];
			expect(value).toBe('a');
			expect(details.reason).toBe('keyboard');
			expect(details.index).toBe(0);
			expect(details.event).toBeInstanceOf(KeyboardEvent);
			expect(details.event.key).toBe('ArrowDown');
		});

		it('passes native mouse and pointer events for pointer highlights', async () => {
			const onItemHighlighted = vi.fn();
			render(ComboboxHarness, { items: ['a', 'b', 'c'], root: { onItemHighlighted } });

			await userEvent.click(input());
			const item = option('b');
			await expect.element(item).toBeInTheDocument();
			const hoverEvent = new MouseEvent('mousemove', { bubbles: true });
			item.element().dispatchEvent(hoverEvent);

			await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe('b');
			const details = onItemHighlighted.mock.lastCall?.[1];
			expect(details.reason).toBe('pointer');
			expect(details.event).toBe(hoverEvent);
			expect(details.event).not.toBeInstanceOf(PointerEvent);

			// React derives `onPointerLeave` from `pointerout`; Svelte listens for `pointerleave`.
			const leaveEvent = new PointerEvent('pointerleave', { pointerType: 'mouse' });
			item.element().dispatchEvent(leaveEvent);
			await expect
				.poll(() => onItemHighlighted.mock.lastCall)
				.toEqual([undefined, expect.objectContaining({ reason: 'pointer', event: leaveEvent })]);
		});

		function renderHighlight(onItemHighlighted: (...args: unknown[]) => void) {
			render(ComboboxHarness, {
				items: ['apple', 'apricot', 'banana'],
				clear: true,
				clearProps: { keepMounted: true },
				root: { onItemHighlighted }
			});
		}

		async function highlightFirstWithKeyboard(onItemHighlighted: ReturnType<typeof vi.fn>) {
			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe('apple');
		}

		it('reports a pointer highlight after keyboard navigation', async () => {
			const onItemHighlighted = vi.fn();
			renderHighlight(onItemHighlighted);
			await highlightFirstWithKeyboard(onItemHighlighted);

			option('banana')
				.element()
				.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
			await expect.poll(() => onItemHighlighted.mock.lastCall?.[0]).toBe('banana');
			expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('pointer');
		});

		it('reports no keyboard reason when typing clears the highlight', async () => {
			const onItemHighlighted = vi.fn();
			renderHighlight(onItemHighlighted);
			await highlightFirstWithKeyboard(onItemHighlighted);

			await userEvent.keyboard('a');
			await expect
				.poll(() => onItemHighlighted.mock.lastCall)
				.toEqual([undefined, expect.anything()]);
			expect(onItemHighlighted.mock.lastCall?.[1].reason).toBe('none');
		});

		it('reports no keyboard reason when the clear button clears the highlight', async () => {
			const onItemHighlighted = vi.fn();
			renderHighlight(onItemHighlighted);
			await highlightFirstWithKeyboard(onItemHighlighted);

			page
				.getByTestId('clear')
				.element()
				.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await expect
				.poll(() => onItemHighlighted.mock.lastCall)
				.toEqual([undefined, expect.anything()]);
			const details = onItemHighlighted.mock.lastCall?.[1];
			expect(details.reason).toBe('none');
			expect(details.event.type).toBe('click');
		});
	});

	describe('highlight restoration when clearing the query', () => {
		async function typeThenClear(query: string, probe: string) {
			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			await userEvent.type(input(), query);
			await expect.element(option(probe)).toBeInTheDocument();
			await userEvent.clear(input());
		}

		it('returns the highlight to the selected item when the input is cleared', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				items: ['apple', 'banana', 'cherry'],
				popup: { 'aria-label': 'Select item' },
				root: { defaultValue: 'cherry' }
			});

			await typeThenClear('ap', 'apple');
			await expect.element(option('cherry')).toBeInTheDocument();
			await expect.poll(activeText).toBe('cherry');
		});

		it('returns the highlight to the selected item without the items prop', async () => {
			render(ComboboxHarness, {
				inputInside: true,
				staticItems: [{ value: 'apple' }, { value: 'banana' }, { value: 'cherry' }],
				popup: { 'aria-label': 'Select item' },
				root: { defaultValue: 'cherry' }
			});

			await typeThenClear('ap', 'apple');
			await expect.element(option('cherry')).toBeInTheDocument();
			await expect.poll(activeText).toBe('cherry');
		});

		it('restores an array-valued single selection when the query is cleared', async () => {
			const items = [
				[1, 2],
				[3, 4],
				[5, 6]
			];
			render(ComboboxHarness, {
				inputInside: true,
				items,
				itemLabel: (item: number[]) => item.join('-'),
				popup: { 'aria-label': 'Select item' },
				root: { defaultValue: items[1], itemToStringLabel: (item: number[]) => item.join('-') }
			});

			await userEvent.click(trigger());
			await expect.element(listbox()).toBeInTheDocument();
			// The array is a single-select value, not a list of selected values.
			await expect.element(option('3-4')).toHaveAttribute('data-highlighted');

			await userEvent.type(input(), '1');
			await expect.element(option('1-2')).toBeInTheDocument();

			await userEvent.clear(input());
			await expect.element(option('3-4')).toHaveAttribute('data-highlighted');
			await expect.poll(activeId).toBe(option('3-4').element().id);
		});

		it('does not highlight anything when there is no selected item', async () => {
			render(ComboboxHarness, { items: ['apple', 'banana', 'cherry'] });

			await userEvent.click(input());
			await expect.element(listbox()).toBeInTheDocument();

			await userEvent.type(input(), 'ap');
			await expect.element(option('apple')).toBeInTheDocument();

			await userEvent.clear(input());
			await expect.element(option('cherry')).toBeInTheDocument();
			expect(activeId()).toBeNull();
		});
	});
});
