// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx,
// "prop: autoHighlight" and "prop: keepHighlight" (commit
// ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// `setProps` is a write to a bound prop.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { renderBound } from '../../tests/bound-render.svelte.js';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';

const input = () => page.getByTestId('input');
const listbox = () => page.getByRole('listbox');
const option = (name: string) => page.getByRole('option', { name, exact: true });
const activeId = () => input().element().getAttribute('aria-activedescendant');
const flush = async () => {
	await tick();
	await Promise.resolve();
	await tick();
};

function leaveList(item: Element) {
	const outside = document.createElement('div');
	document.body.append(outside);
	// React derives `onPointerLeave` from `pointerout`; Svelte listens for `pointerleave`.
	item.dispatchEvent(
		new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: outside })
	);
	return () => outside.remove();
}

describe('Autocomplete.Root', () => {
	describe('prop: autoHighlight', () => {
		it('calls onItemHighlighted when the popup highlights on its own', async () => {
			const onItemHighlighted = vi.fn();
			render(AutocompleteHarness, {
				items: ['alpha', 'alpine', 'beta'],
				root: { autoHighlight: true, onItemHighlighted }
			});

			await userEvent.type(input(), 'a');

			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');
			expect(onItemHighlighted.mock.calls.length).toBeGreaterThan(0);
			const [value, details] = onItemHighlighted.mock.lastCall ?? [];
			expect(value).toBe('alpha');
			expect(details.reason).toBe('none');
		});

		it('highlights the first item when typing and keeps it while filtering', async () => {
			render(AutocompleteHarness, {
				staticItems: [{ value: 'new york' }, { value: 'new york city' }, { value: 'newcastle' }],
				root: { autoHighlight: true }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'new');

			const newYork = option('new york');
			await expect.element(newYork).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(newYork.element().id);

			// A trailing space keeps the highlight while matches remain.
			await userEvent.type(input(), ' ');

			await expect.element(newYork).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(newYork.element().id);
		});

		it('does not highlight on a click open', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana'],
				root: { autoHighlight: true, openOnInputClick: true }
			});

			// Upstream's opening `fireEvent.click` neither focuses the input nor opens the popup, so its
			// two ArrowDown presses reach the body. Only the real click open and ArrowUp are ported.
			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();
			await flush();
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{Escape}');
			await expect.element(listbox()).not.toBeInTheDocument();
			await userEvent.click(input());
			await expect.element(listbox()).toBeVisible();
			await flush();
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{ArrowUp}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant');
		});

		it('highlights the first item when opening with ArrowDown', async () => {
			render(AutocompleteHarness, {
				items: ['alpha', 'beta', 'gamma'],
				root: { autoHighlight: true }
			});

			await userEvent.click(input());
			await userEvent.keyboard('{ArrowDown}');

			const alpha = option('alpha');
			await expect.element(alpha).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(alpha.element().id);
		});

		it('links aria-activedescendant to the highlighted item after filtering', async () => {
			render(AutocompleteHarness, { items: ['feature', 'fix'], root: { autoHighlight: true } });

			await userEvent.click(input());
			await userEvent.type(input(), 'f');
			await expect.element(option('feature')).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(option('feature').element().id);

			await userEvent.type(input(), 'i');
			await expect.element(option('fix')).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(option('fix').element().id);
		});

		it('does not highlight the first item on the opening ArrowDown without autoHighlight', async () => {
			render(AutocompleteHarness, { items: ['alpha', 'beta', 'gamma'] });

			await userEvent.click(input());
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(listbox()).toBeVisible();
			await flush();
			await expect.element(input()).not.toHaveAttribute('aria-activedescendant');

			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input()).toHaveAttribute('aria-activedescendant');
		});

		it('keeps the highlight when the query is cleared', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: true, openOnInputClick: true }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'ban');
			await expect.element(listbox()).toBeVisible();
			await expect.element(input()).toHaveAttribute('aria-activedescendant');
			const before = activeId();

			await userEvent.clear(input());

			await expect.element(listbox()).toBeVisible();
			await expect.poll(activeId).toBe(before);
		});

		it('highlights the first item at once with "always"', async () => {
			render(AutocompleteHarness, {
				open: true,
				items: ['alpha', 'beta', 'gamma'],
				root: { autoHighlight: 'always' }
			});

			await expect.element(option('alpha')).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(option('alpha').element().id);
		});

		it('keeps the latest pointer highlight on an outside blur with "always"', async () => {
			render(AutocompleteHarness, {
				open: true,
				inline: true,
				outside: true,
				items: ['apple', 'banana', 'cherry'],
				root: { autoHighlight: 'always', keepHighlight: true }
			});
			const banana = option('banana');

			input().element().focus();
			await userEvent.hover(banana);
			await expect.element(banana).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(banana.element().id);

			const outside = page.getByTestId('outside').element() as HTMLElement;
			outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			outside.focus();
			await flush();

			await expect.element(banana).toHaveAttribute('data-highlighted');
			expect(activeId()).toBe(banana.element().id);
			await expect.element(option('apple')).not.toHaveAttribute('data-highlighted');
		});

		describe('asynchronous items', () => {
			function renderAsync(initial: Record<string, unknown> = {}) {
				return renderBound(AutocompleteHarness, {
					items: [] as unknown[],
					trigger: true,
					clear: true,
					...initial,
					root: { autoHighlight: true, filter: null }
				});
			}

			it('highlights a candidate arriving after typing', async () => {
				const props = renderAsync();
				await userEvent.type(input(), '32');
				props.items = ['32', '320'];

				const item = option('32');
				await expect.element(item).toHaveAttribute('data-highlighted');
				expect(activeId()).toBe(item.element().id);

				await userEvent.keyboard('{Enter}');
				await expect.element(input()).toHaveValue('32');
			});

			it('highlights asynchronous results while an inline input stays focused', async () => {
				const props = renderBound(AutocompleteHarness, {
					items: [] as unknown[],
					inline: true,
					open: true,
					root: { autoHighlight: true }
				});
				await userEvent.type(input(), '32');
				props.items = ['32'];

				const item = page.getByRole('option');
				await expect.element(item).toHaveAttribute('data-highlighted');
				expect(activeId()).toBe(item.element().id);
			});

			it.each([true, 'always'] as const)(
				'handles asynchronous results after an inline input blurs with autoHighlight=%s',
				async (autoHighlight) => {
					const props = renderBound(AutocompleteHarness, {
						items: [] as unknown[],
						inline: true,
						open: true,
						outside: true,
						root: { autoHighlight }
					});
					await userEvent.type(input(), '32');
					await userEvent.click(page.getByTestId('outside'));
					props.items = ['32'];

					const item = page.getByRole('option');
					await expect.element(item).toBeInTheDocument();
					await flush();
					expect(item.element().hasAttribute('data-highlighted')).toBe(autoHighlight === 'always');
					expect(activeId()).toBe(autoHighlight === 'always' ? item.element().id : null);
				}
			);

			it('discards the request when the clear button clears the query', async () => {
				const props = renderAsync();
				await userEvent.type(input(), '32');
				await userEvent.click(page.getByTestId('clear'));
				props.items = ['32'];

				await expect.element(input()).toHaveValue('');
				await expect.element(page.getByRole('option')).toBeInTheDocument();
				await flush();
				await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
				await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
			});

			it.each([false, true])(
				'discards the request when closing with keepMounted=%s',
				async (keepMounted) => {
					const props = renderAsync({ portal: { keepMounted } });
					await userEvent.type(input(), '32');
					await userEvent.keyboard('{Escape}');
					await expect.element(input()).toHaveAttribute('aria-expanded', 'false');
					await userEvent.click(page.getByTestId('trigger'));
					await expect.element(input()).toHaveAttribute('aria-expanded', 'true');
					props.items = ['32'];

					await expect.element(input()).toHaveValue('32');
					await expect.element(page.getByRole('option')).toBeInTheDocument();
					await flush();
					await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
					await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
				}
			);

			it('discards the request when a bound popup closes', async () => {
				const props = renderAsync({ open: true });
				await userEvent.type(input(), '32');
				props.open = false;
				await flush();
				props.open = true;
				await flush();
				props.items = ['32'];

				await expect.element(input()).toHaveValue('32');
				await expect.element(page.getByRole('option')).toBeInTheDocument();
				await flush();
				await expect.element(page.getByRole('option')).not.toHaveAttribute('data-highlighted');
				await expect.element(input()).not.toHaveAttribute('aria-activedescendant');
			});
		});
	});

	describe('prop: keepHighlight', () => {
		it('keeps the highlight when the pointer leaves the list', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana'],
				root: { autoHighlight: true, keepHighlight: true }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'ap');
			const apple = option('apple');
			await expect.element(apple).toHaveAttribute('data-highlighted');

			// Hovering puts the list into pointer modality, so leaving it runs the reset path.
			await userEvent.hover(apple);
			const cleanup = leaveList(apple.element());
			await flush();

			await expect.element(apple).toHaveAttribute('data-highlighted');
			cleanup();
		});

		it('clears the highlight when the pointer leaves the list without keepHighlight', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana'],
				root: { autoHighlight: true }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'ap');
			const apple = option('apple');
			await expect.element(apple).toHaveAttribute('data-highlighted');

			await userEvent.hover(apple);
			const cleanup = leaveList(apple.element());

			await expect.element(apple).not.toHaveAttribute('data-highlighted');
			cleanup();
		});

		it('continues keyboard navigation from the kept highlight after the pointer leaves', async () => {
			render(AutocompleteHarness, {
				items: ['apple', 'banana', 'carrot'],
				root: { autoHighlight: true, keepHighlight: true }
			});

			await userEvent.click(input());
			await userEvent.type(input(), 'a');
			const apple = option('apple');
			await expect.element(apple).toHaveAttribute('data-highlighted');

			await userEvent.hover(apple);
			const cleanup = leaveList(apple.element());

			await userEvent.keyboard('{ArrowDown}');

			await expect.element(option('banana')).toHaveAttribute('data-highlighted');
			cleanup();
		});
	});
});
