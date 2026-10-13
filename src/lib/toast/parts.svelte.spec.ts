// Assertions follow Base UI v1.9.0 packages/react/src/toast/utils/useToastLabelPart.test.tsx,
// title/ToastTitle.test.tsx, description/ToastDescription.test.tsx, close/ToastClose.test.tsx,
// action/ToastAction.test.tsx, content/ToastContent.test.tsx, portal/ToastPortal.test.tsx,
// positioner/ToastPositioner.test.tsx, and arrow/ToastArrow.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance is not ported. A `render` snippet cannot be inspected for content (see
// docs/upstream-differences.md), so the cases where upstream's render element carries its own
// text pass that text as children instead. React's separate render element and render function
// cases are one snippet case here. `onClick` in `actionProps` is `onclick`.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ToastActionHarness from '../../tests/ToastActionHarness.svelte';
import ToastLabelPartHarness from '../../tests/ToastLabelPartHarness.svelte';
import ToastPositionerHarness from '../../tests/ToastPositionerHarness.svelte';
import {
	button,
	byTestId,
	click,
	closeButton,
	disableAnimations,
	renderToasts,
	textOf,
	withAnimations
} from '../../tests/toast.js';
import { Toast } from './index.js';

disableAnimations();

function root() {
	return byTestId('root')!;
}

const labelParts = [
	{ name: 'Toast.Title', Part: Toast.Title, field: 'title', attribute: 'aria-labelledby' },
	{
		name: 'Toast.Description',
		Part: Toast.Description,
		field: 'description',
		attribute: 'aria-describedby'
	}
] as const;

describe.each(labelParts)('<$name />', ({ Part, field, attribute }) => {
	it('throws a descriptive error when rendered outside <Toast.Root>', () => {
		expect(() => render(Part)).toThrow(
			'Base UI: ToastRootContext is missing. Toast parts must be used within <Toast.Root>.'
		);
	});

	it(`renders the toast ${field} by default`, async () => {
		renderToasts();
		await click(button('add'));

		expect(textOf(field)).toBe(field);
		expect(byTestId(field)!.tagName).toBe(field === 'title' ? 'H2' : 'P');
	});

	it(`adds ${attribute} to the root element`, async () => {
		renderToasts();
		await click(button('add'));

		expect(byTestId(field)!.id).toMatch(/^base-ui-/);
		expect(root().getAttribute(attribute)).toBe(byTestId(field)!.id);
	});

	it('does not render if it has no children', async () => {
		renderToasts({ addOptions: { [field]: undefined } });
		await click(button('add'));

		expect(root().hasAttribute(attribute)).toBe(false);
		expect(byTestId(field)).toBe(null);
	});

	it('renders a numeric zero child', async () => {
		render(ToastLabelPartHarness, { part: field, scenario: 'zero' });

		expect(root().textContent).toBe('0');
	});

	describe('prop: render', () => {
		it('renders content passed through the render snippet', async () => {
			render(ToastLabelPartHarness, {
				part: field,
				scenario: 'render',
				children: 'render prop content'
			});

			const element = byTestId('part-render')!;
			expect(element.tagName).toBe('DIV');
			expect(element.textContent).toBe('render prop content');
		});

		it(`wires ${attribute} to a part rendered through the render snippet`, async () => {
			render(ToastLabelPartHarness, {
				part: field,
				scenario: 'render',
				children: 'render prop content'
			});

			expect(root().getAttribute(attribute)).toBe(byTestId('part-render')!.id);
			expect(byTestId('part-render')!.id).toMatch(/^base-ui-/);
		});

		it(`renders the toast ${field} through a childless render snippet`, async () => {
			render(ToastLabelPartHarness, {
				part: field,
				scenario: 'render',
				toast: { id: 'test', [field]: 'Toast content' }
			});

			expect(byTestId('part-render')!.textContent).toBe('Toast content');
		});

		it('does not render a childless render snippet when there is no content', async () => {
			render(ToastLabelPartHarness, { part: field, scenario: 'render' });

			expect(byTestId('part-render')).toBe(null);
			expect(root().hasAttribute(attribute)).toBe(false);
		});

		it('does not wire an element when the render snippet renders none', async () => {
			render(ToastLabelPartHarness, {
				part: field,
				scenario: 'render-empty',
				children: 'Toast content'
			});

			expect(root().textContent).toBe('');
			expect(root().hasAttribute(attribute)).toBe(false);
		});
	});

	it(`clears ${attribute} from the root when the content is removed`, async () => {
		const view = render(ToastLabelPartHarness, { part: field, scenario: 'clear' });

		const rootElement = root();
		expect(rootElement.getAttribute(attribute)).toBe('part');
		expect(rootElement.textContent).toBe('Toast content');

		await view.rerender({ content: false });

		expect(rootElement.textContent).toBe('');
		expect(rootElement.hasAttribute(attribute)).toBe(false);
	});

	it('does not let an older part cleanup clear a newer part', async () => {
		const view = render(ToastLabelPartHarness, { part: field, scenario: 'parts', parts: 'old' });

		const rootElement = root();
		expect(rootElement.getAttribute(attribute)).toBe('old-part');

		await view.rerender({ parts: 'both' });
		expect(rootElement.getAttribute(attribute)).toBe('new-part');

		await view.rerender({ parts: 'new' });
		expect(rootElement.getAttribute(attribute)).toBe('new-part');
	});
});

describe('<Toast.Close />', () => {
	it('closes the toast when clicked', async () => {
		renderToasts();

		await userEvent.click(page.getByRole('button', { name: 'add' }));
		expect(textOf('title')).toBe('title');

		// Upstream focuses the viewport programmatically, which JSDOM treats as focus-visible.
		// After a mouse click Chromium does not, so the keyboard shortcut focuses it here.
		await userEvent.keyboard('{F6}');
		expect(document.activeElement).toBe(viewport());

		await userEvent.click(page.getByRole('button', { name: 'close-press' }));

		expect(byTestId('title')).toBe(null);
	});

	it('is hidden from assistive technology until the viewport expands or it has focus', async () => {
		renderToasts();
		await click(button('add'));

		const close = closeButton();
		expect(close.tagName).toBe('BUTTON');
		expect(close.getAttribute('type')).toBe('button');
		expect(close.getAttribute('aria-hidden')).toBe('true');

		viewport().dispatchEvent(new MouseEvent('mouseenter'));
		await tick();
		expect(close.getAttribute('aria-hidden')).toBe('false');

		viewport().dispatchEvent(new MouseEvent('mouseleave'));
		await tick();
		expect(close.getAttribute('aria-hidden')).toBe('true');

		close.focus();
		await tick();
		expect(close.getAttribute('aria-hidden')).toBe('false');
	});

	function viewport() {
		return byTestId('viewport')!;
	}
});

describe('<Toast.Action />', () => {
	it('performs an action when clicked', async () => {
		const onclick = vi.fn();
		renderToasts({ addOptions: { title: 'title', actionProps: { children: 'action', onclick } } });

		await userEvent.click(page.getByRole('button', { name: 'add' }));
		expect(onclick).not.toHaveBeenCalled();
		expect(textOf('action')).toBe('action');

		await userEvent.click(page.getByTestId('action'));

		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('forwards actionProps to the button', async () => {
		renderToasts();

		await userEvent.click(page.getByRole('button', { name: 'add' }));

		const action = byTestId('action')!;
		expect(action.id).toBe('action');
		expect(action.tagName).toBe('BUTTON');
		expect(action.textContent).toBe('action');
	});

	it('does not render if it has no children', async () => {
		renderToasts({ addOptions: { actionProps: { children: undefined } } });

		await userEvent.click(page.getByRole('button', { name: 'add' }));

		expect(byTestId('root')).not.toBe(null);
		expect(byTestId('action')).toBe(null);
	});

	it('renders content passed through the render snippet', async () => {
		render(ToastActionHarness, {
			toast: { id: 'test', title: 'title' },
			children: 'render prop action'
		});

		const action = byTestId('action-render')!;
		expect(action.textContent).toBe('render prop action');
		expect(action.getAttribute('type')).toBe('button');
	});

	it('does not render a childless render snippet when there is no action content', async () => {
		render(ToastActionHarness, { toast: { id: 'test', title: 'title' } });

		expect(root()).not.toBe(null);
		expect(byTestId('action-render')).toBe(null);
	});

	it('renders the toast action content through a childless render snippet', async () => {
		render(ToastActionHarness, { toast: { id: 'test', actionProps: { children: 'Undo' } } });

		expect(byTestId('action-render')!.textContent).toBe('Undo');
	});
});

describe('<Toast.Content />', () => {
	it('marks content behind the frontmost toast with data-behind', async () => {
		const { manager } = renderToasts({ content: true });

		manager.add({ id: 'toast-1', title: 'toast-1' });
		manager.add({ id: 'toast-2', title: 'toast-2' });
		await tick();

		// The newest toast is at the front; the older one sits behind it.
		expect(byTestId('content-toast-2')!.hasAttribute('data-behind')).toBe(false);
		expect(byTestId('content-toast-1')!.hasAttribute('data-behind')).toBe(true);
	});

	it('reflects the expanded state when the viewport is hovered', async () => {
		const { manager } = renderToasts({ content: true });

		manager.add({ id: 'toast-1', title: 'toast-1' });
		await tick();

		const content = byTestId('content-toast-1')!;
		expect(content.hasAttribute('data-expanded')).toBe(false);

		byTestId('viewport')!.dispatchEvent(new MouseEvent('mouseenter'));
		await tick();
		expect(content.hasAttribute('data-expanded')).toBe(true);
	});
});

describe('<Toast.Portal />', () => {
	it('moves the viewport into its container', async () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		try {
			const { manager } = renderToasts({ portalContainer: container });
			manager.add({ title: 'title' });
			await tick();

			const viewport = byTestId('viewport')!;
			expect(container.contains(viewport)).toBe(true);
			expect(viewport.parentElement?.tagName).toBe('DIV');
			expect(viewport.parentElement?.parentElement).toBe(container);
			expect(textOf('title', container)).toBe('title');
		} finally {
			container.remove();
		}
	});
});

describe('<Toast.Positioner />', () => {
	it('positions an anchored toast against its anchor element', async () => {
		render(ToastPositionerHarness);

		const anchor = page.getByRole('button', { name: 'anchor' });
		await userEvent.click(anchor);

		const positioner = byTestId('anchored')!;
		await expect.poll(() => positioner.getAttribute('data-side')).toBe('bottom');

		const anchorRect = anchor.element().getBoundingClientRect();
		await expect
			.poll(() => Math.round(positioner.getBoundingClientRect().top))
			.toBe(Math.round(anchorRect.bottom + 8));
	});

	it('falls back to the viewport when no anchor is provided', async () => {
		render(ToastPositionerHarness, { addOptions: { id: 'unanchored', title: 'title' } });

		await userEvent.click(page.getByRole('button', { name: 'add' }));

		const positioner = byTestId('unanchored')!;
		// An unanchored positioner still renders, with the defaults applied.
		expect(positioner.getAttribute('data-side')).toBe('top');
		expect(positioner.getAttribute('data-align')).toBe('center');
		expect(positioner.getAttribute('role')).toBe('presentation');
		expect(positioner.querySelector('h2')?.textContent).toBe('title');
	});

	it('lets positioner props override the ones carried on the toast', async () => {
		render(ToastPositionerHarness, {
			side: 'left',
			addOptions: {
				id: 'positioner',
				title: 'title',
				positionerProps: { side: 'bottom', align: 'end' }
			}
		});

		await userEvent.click(page.getByRole('button', { name: 'add' }));

		const positioner = byTestId('positioner')!;
		expect(positioner.getAttribute('data-side')).toBe('left');
		// Props not set on the element still come from the toast.
		expect(positioner.getAttribute('data-align')).toBe('end');
	});

	describe('--toast-index', () => {
		it('keeps the DOM index while a toast animates out', async () => {
			await withAnimations(async () => {
				const toastManager = Toast.createToastManager();
				render(ToastPositionerHarness, { toastManager, timeout: 0 });

				toastManager.add({ id: 'oldest', title: 'oldest' });
				await tick();
				toastManager.add({ id: 'newest', title: 'newest' });
				await tick();

				const newest = byTestId('newest')!;
				const oldest = byTestId('oldest')!;
				// Keep the closing toast mounted: its exit animation never finishes.
				Object.defineProperty(byTestId('root-newest'), 'getAnimations', {
					value: () => [{ finished: new Promise(() => {}) }],
					configurable: true
				});

				expect(newest.style.getPropertyValue('--toast-index')).toBe('0');
				expect(oldest.style.getPropertyValue('--toast-index')).toBe('1');

				toastManager.close('newest');
				await tick();

				// The closing toast is excluded from the visible stack, but it must keep a
				// real index while it animates out rather than collapsing to `-1`.
				expect(newest.isConnected).toBe(true);
				expect(newest.style.getPropertyValue('--toast-index')).toBe('0');
				expect(oldest.style.getPropertyValue('--toast-index')).toBe('0');
			});
		});
	});

	it('throws a descriptive error when rendered outside <Toast.Provider>', () => {
		expect(() => render(Toast.Positioner, { toast: { id: 'test', title: 'Toast title' } })).toThrow(
			'Base UI: useToastManager must be used within <Toast.Provider>.'
		);
	});
});

describe('<Toast.Arrow />', () => {
	it('mirrors the resolved side of its positioner', async () => {
		render(ToastPositionerHarness, { arrow: true });

		await userEvent.click(page.getByRole('button', { name: 'anchor' }));

		const arrow = byTestId('arrow')!;
		await expect.poll(() => arrow.getAttribute('data-side')).toBe('bottom');
		expect(arrow.getAttribute('data-align')).toBe('center');
		expect(arrow.getAttribute('aria-hidden')).toBe('true');
	});

	it('throws a descriptive error when rendered outside <Toast.Positioner>', () => {
		expect(() => render(Toast.Arrow)).toThrow(
			'Base UI: ToastPositionerContext is missing. ToastPositioner parts must be placed within <Toast.Positioner>.'
		);
	});
});
