// Assertions follow Base UI v1.9.0 packages/react/src/toast/provider/ToastProvider.test.tsx and
// packages/react/src/toast/viewport/ToastViewport.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance is not ported. The suspended-render provider case is React-only.
// Upstream's `fireEvent.mouseEnter(root)` reaches the viewport through React's synthetic
// mouseenter; here the tests hover with the real mouse or dispatch `mouseenter` on the viewport.
// The JSDOM-only window focus cases dispatch the window's own blur and focus events instead of
// calling the listeners a spy captured. The iframe case portals the viewport with Toast.Portal.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ToastProviderEffectsHarness from '../../tests/ToastProviderEffectsHarness.svelte';
import {
	advance,
	allByTestId,
	button,
	byTestId,
	click,
	closeButton,
	css,
	disableAnimations,
	holdExit,
	mouseEnter,
	mouseLeave,
	renderToasts,
	stubPointerCapture,
	useFakeClock,
	withAnimations
} from '../../tests/toast.js';
import { Toast } from './index.js';

disableAnimations();

function roots() {
	return allByTestId('root');
}

function viewport() {
	return byTestId('viewport')!;
}

function keyDown(element: EventTarget, key: string, init: KeyboardEventInit = {}) {
	element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
}

function pointer(
	type: string,
	element: EventTarget,
	init: PointerEventInit & { clientX?: number; clientY?: number }
) {
	element.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init }));
}

async function addToast() {
	await userEvent.click(page.getByRole('button', { name: 'add' }));
}

function nextFrame() {
	return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe('<Toast.Provider />', () => {
	useFakeClock();

	it('syncs a changed timeout before descendant effects', async () => {
		const onClose = vi.fn();
		const view = render(ToastProviderEffectsHarness, {
			timeout: 5000,
			add: (manager) => manager.add({ id: 'toast', title: 'Toast', onClose })
		});

		await view.rerender({ timeout: 1000, active: true });

		await advance(999);
		expect(onClose).not.toHaveBeenCalled();

		await advance(2);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('adds a toast once from an effect through a toast manager', async () => {
		const toastManager = Toast.createToastManager();
		let toastCount = -1;
		const view = render(ToastProviderEffectsHarness, {
			toastManager,
			add: () => toastManager.add({ id: 'toast', title: 'Toast' }),
			observe: (manager) => (toastCount = manager.toasts.length)
		});

		await view.rerender({ active: true });

		expect(toastCount).toBe(1);
	});

	it('syncs a changed limit before descendant effects', async () => {
		const observeToasts = vi.fn();
		const view = render(ToastProviderEffectsHarness, {
			limit: 3,
			add(manager) {
				manager.add({ id: 'first', title: 'First', timeout: 0 });
				manager.add({ id: 'second', title: 'Second', timeout: 0 });
			},
			observe(manager) {
				observeToasts(manager.toasts.map((toast) => ({ id: toast.id, limited: toast.limited })));
			}
		});

		await view.rerender({ limit: 1, active: true });

		expect(observeToasts).toHaveBeenNthCalledWith(1, [
			{ id: 'second', limited: false },
			{ id: 'first', limited: true }
		]);
	});
});

describe('<Toast.Viewport />', () => {
	it('sets the measured frontmost toast height CSS variable', async () => {
		renderToasts();

		await addToast();

		await expect.poll(() => css(viewport(), '--toast-frontmost-height')).toMatch(/^\d+px$/);
		expect(css(viewport(), '--toast-frontmost-height')).toBe(`${byTestId('root')!.offsetHeight}px`);
	});

	it('rebinds owner-document listeners once across empty store cycles', async () => {
		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		const iframeWindow = iframe.contentWindow!;
		const iframeDocument = iframe.contentDocument!;
		const iframeGlobal = iframeWindow as Window & typeof globalThis;

		const portalContainer = iframeDocument.createElement('div');
		iframeDocument.body.appendChild(portalContainer);
		const addWindowListener = vi.spyOn(iframeWindow, 'addEventListener');
		const removeWindowListener = vi.spyOn(iframeWindow, 'removeEventListener');
		const addDocumentListener = vi.spyOn(iframeDocument, 'addEventListener');
		const removeDocumentListener = vi.spyOn(iframeDocument, 'removeEventListener');

		const count = (spy: { mock: { calls: unknown[][] } }, type: string) =>
			spy.mock.calls.filter(([eventType]) => eventType === type).length;

		try {
			const { manager } = renderToasts({ timeout: 0, portalContainer, content: true });
			const roots = () => iframeDocument.querySelectorAll('[data-testid="root"]');

			const first = manager.add({ title: 'title' });
			await expect.poll(() => roots().length).toBe(1);

			expect(count(addWindowListener, 'keydown')).toBe(1);
			expect(count(addWindowListener, 'blur')).toBe(1);
			expect(count(addWindowListener, 'focus')).toBe(1);
			expect(count(addDocumentListener, 'pointerdown')).toBe(1);

			iframeWindow.dispatchEvent(new iframeGlobal.KeyboardEvent('keydown', { key: 'F6' }));
			expect(iframeDocument.activeElement).toBe(
				iframeDocument.querySelector('[data-testid="viewport"]')
			);

			// Changes to a non-empty list must not rebind the listeners.
			manager.update(first, { title: 'updated' });
			const second = manager.add({ title: 'second' });
			await expect.poll(() => roots().length).toBe(2);
			expect(iframeDocument.querySelector('[data-testid="title"]')?.textContent).toBe('second');
			expect(count(addWindowListener, 'keydown')).toBe(1);
			expect(count(removeWindowListener, 'keydown')).toBe(0);
			expect(count(addDocumentListener, 'pointerdown')).toBe(1);
			expect(count(removeDocumentListener, 'pointerdown')).toBe(0);

			manager.close(first);
			manager.close(second);
			await expect.poll(() => roots().length).toBe(0);
			expect(count(removeWindowListener, 'keydown')).toBe(1);
			expect(count(removeWindowListener, 'blur')).toBe(1);
			expect(count(removeWindowListener, 'focus')).toBe(1);
			expect(count(removeDocumentListener, 'pointerdown')).toBe(1);

			manager.add({ title: 'title' });
			await expect.poll(() => roots().length).toBe(1);
			expect(count(addWindowListener, 'keydown')).toBe(2);
			expect(count(addWindowListener, 'blur')).toBe(2);
			expect(count(addWindowListener, 'focus')).toBe(2);
			expect(count(addDocumentListener, 'pointerdown')).toBe(2);
		} finally {
			addWindowListener.mockRestore();
			removeWindowListener.mockRestore();
			addDocumentListener.mockRestore();
			removeDocumentListener.mockRestore();
			iframe.remove();
		}
	});

	it('throws a descriptive error when rendered outside <Toast.Provider>', () => {
		expect(() => render(Toast.Viewport)).toThrow(
			'Base UI: useToastManager must be used within <Toast.Provider>.'
		);
	});

	it('renders a polite notifications region', async () => {
		renderToasts();

		expect(viewport().getAttribute('role')).toBe('region');
		expect(viewport().getAttribute('aria-live')).toBe('polite');
		expect(viewport().getAttribute('aria-atomic')).toBe('false');
		expect(viewport().getAttribute('aria-relevant')).toBe('additions text');
		expect(viewport().getAttribute('aria-label')).toBe('Notifications');
		expect(viewport().getAttribute('tabindex')).toBe('-1');
	});

	it('gets focused when F6 is pressed', async () => {
		renderToasts();

		await addToast();
		await userEvent.keyboard('{F6}');

		expect(document.activeElement).toBe(viewport());
	});

	it('focuses first toast upon tab after viewport is focused', async () => {
		renderToasts();

		await addToast();
		await userEvent.keyboard('{F6}');
		await userEvent.keyboard('{Tab}');

		expect(document.activeElement).toBe(byTestId('root'));
	});

	it('returns focus to previous element when pressing shift+Tab on first toast', async () => {
		renderToasts();

		await addToast();
		await userEvent.keyboard('{F6}');
		await userEvent.keyboard('{Tab}');
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

		expect(document.activeElement).toBe(button('add'));
	});

	it('returns focus to previous element when pressing shift+Tab on last toast', async () => {
		renderToasts();

		await addToast();
		await addToast();

		await userEvent.keyboard('{F6}');
		const [first, last] = roots();
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(first);
		await userEvent.keyboard('{Tab}'); // first toast close button
		await userEvent.keyboard('{Tab}'); // first toast action button
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(last);
		await userEvent.keyboard('{Tab}'); // last toast close button
		await userEvent.keyboard('{Tab}'); // last toast action button
		await userEvent.keyboard('{Tab}');

		expect(document.activeElement).toBe(button('add'));
	});

	it('removes expanded on mouseleave when focus-visible not inside', async () => {
		renderToasts();

		await addToast();
		const root = page.getByTestId('root');

		await userEvent.hover(root);
		expect(viewport().hasAttribute('data-expanded')).toBe(true);

		await userEvent.unhover(root);
		expect(viewport().hasAttribute('data-expanded')).toBe(false);
	});

	it('keeps expanded on mouseleave when focus-visible is inside', async () => {
		renderToasts();

		await addToast();
		const root = page.getByTestId('root');

		await userEvent.keyboard('{F6}');
		await userEvent.keyboard('{Tab}');

		await userEvent.hover(root);
		expect(viewport().hasAttribute('data-expanded')).toBe(true);
		await userEvent.unhover(root);
		expect(viewport().hasAttribute('data-expanded')).toBe(true);
	});

	it('keeps expanded during an active touch swipe even if mouseleave fires', async () => {
		renderToasts();
		await addToast();

		const root = byTestId('root')!;
		stubPointerCapture(root);

		const touch = { pointerId: 1, pointerType: 'touch', clientX: 100 };
		pointer('pointerdown', root, { ...touch, clientY: 100, button: 0 });
		pointer('pointermove', root, { ...touch, clientY: 120 });
		await tick();

		expect(viewport().hasAttribute('data-expanded')).toBe(true);

		mouseLeave(viewport());
		await tick();
		expect(viewport().hasAttribute('data-expanded')).toBe(true);

		pointer('pointerup', root, { ...touch, clientY: 120 });
		await tick();
		expect(viewport().hasAttribute('data-expanded')).toBe(false);
	});

	it('keeps expanded when a touch swipe is canceled without leaving the viewport', async () => {
		renderToasts();
		await addToast();

		const root = byTestId('root')!;
		stubPointerCapture(root);

		const touch = { pointerId: 1, pointerType: 'touch', clientX: 100 };
		pointer('pointerdown', root, { ...touch, clientY: 100, button: 0 });
		pointer('pointermove', root, { ...touch, clientY: 120 });
		await tick();

		expect(root.hasAttribute('data-swiping')).toBe(true);
		expect(viewport().hasAttribute('data-expanded')).toBe(true);

		pointer('pointercancel', root, { ...touch, clientY: 120 });
		await tick();

		expect(root.hasAttribute('data-swiping')).toBe(false);
		expect(viewport().hasAttribute('data-expanded')).toBe(true);
	});

	it('collapses after a touch swipe is canceled if mouseleave already fired', async () => {
		renderToasts();
		await addToast();

		const root = byTestId('root')!;
		stubPointerCapture(root);

		const touch = { pointerId: 1, pointerType: 'touch', clientX: 100 };
		pointer('pointerdown', root, { ...touch, clientY: 100, button: 0 });
		pointer('pointermove', root, { ...touch, clientY: 120 });

		mouseLeave(viewport());
		pointer('pointercancel', root, { ...touch, clientY: 120 });
		await tick();

		expect(root.hasAttribute('data-swiping')).toBe(false);
		expect(viewport().hasAttribute('data-expanded')).toBe(false);
	});

	describe('timers', () => {
		useFakeClock();

		it('pauses timers when hovering', async () => {
			renderToasts();

			await click(button('add'));
			await userEvent.hover(page.getByTestId('root'));

			await advance(5001);
			expect(roots()).toHaveLength(1);
		});

		it('resumes timers when not hovering', async () => {
			renderToasts();

			await click(button('add'));
			await userEvent.hover(page.getByTestId('root'));

			await advance(5000);

			await userEvent.unhover(page.getByTestId('root'));

			await advance(4999);
			expect(roots()).toHaveLength(1);

			await advance(2);
			expect(roots()).toHaveLength(0);
		});

		it('pauses timers when the viewport is focused', async () => {
			renderToasts();

			await click(button('add'));
			keyDown(document.activeElement!, 'F6');
			await tick();

			await advance(5001);
			expect(roots()).toHaveLength(1);
		});

		it.each(['hovering', 'focused'] as const)(
			'keeps timers paused while still %s after the other interaction ends',
			async (remainingInteraction) => {
				renderToasts();

				const addButton = button('add');
				addButton.focus();
				await click(addButton);
				await advance(1000);

				await userEvent.keyboard('{F6}');

				const action = page.getByRole('button', { name: 'action' }).element() as HTMLElement;
				action.focus();
				await tick();
				expect(document.activeElement).toBe(action);
				mouseEnter(viewport());

				if (remainingInteraction === 'hovering') {
					addButton.focus();
				} else {
					mouseLeave(viewport());
				}
				await tick();
				expect(document.activeElement).toBe(
					remainingInteraction === 'hovering' ? addButton : action
				);

				await advance(5001);
				expect(roots()).toHaveLength(1);

				if (remainingInteraction === 'hovering') {
					mouseLeave(viewport());
				} else {
					addButton.focus();
				}
				await tick();
				expect(document.activeElement).toBe(addButton);

				await advance(3999);
				expect(roots()).toHaveLength(1);

				await advance(2);
				expect(roots()).toHaveLength(0);
			}
		);

		it('restores focus and resumes timers on shift+Tab out of the focused viewport', async () => {
			renderToasts();

			const addButton = button('add');
			addButton.focus();
			await click(addButton);
			keyDown(addButton, 'F6');
			await tick();

			expect(document.activeElement).toBe(viewport());

			await advance(5001);
			expect(roots()).toHaveLength(1);

			keyDown(viewport(), 'Tab', { shiftKey: true });
			await tick();

			expect(document.activeElement).toBe(addButton);

			await advance(5001);
			expect(roots()).toHaveLength(0);
		});

		it('keeps timers paused when shift+Tab returns focus inside the viewport', async () => {
			renderToasts();

			const addButton = button('add');
			addButton.focus();
			await click(addButton);

			// Pressing F6 from a control inside the toast makes the restore target
			// itself live inside the viewport.
			const close = closeButton();
			close.focus();
			keyDown(close, 'F6');
			await tick();

			expect(document.activeElement).toBe(viewport());

			keyDown(viewport(), 'Tab', { shiftKey: true });
			await tick();

			expect(document.activeElement).toBe(close);

			await advance(5001);
			// Focus never left the viewport, so the toast must stay put.
			expect(roots()).toHaveLength(1);
		});

		it('keeps the viewport focused when Tab is pressed without shift', async () => {
			renderToasts();

			const addButton = button('add');
			addButton.focus();
			await click(addButton);
			keyDown(addButton, 'F6');
			await tick();

			keyDown(viewport(), 'Tab');
			await tick();

			// Forward Tab moves into the toasts, so the viewport must not hand focus back.
			expect(document.activeElement).toBe(viewport());

			await advance(5001);
			expect(roots()).toHaveLength(1);
		});

		it('collapses and resumes timers on a touch outside the viewport', async () => {
			renderToasts();

			await click(button('add'));
			mouseEnter(viewport());
			await tick();

			expect(viewport().hasAttribute('data-expanded')).toBe(true);

			await advance(5001);
			expect(roots()).toHaveLength(1);

			pointer('pointerdown', document.body, { pointerType: 'touch' });
			await tick();

			expect(viewport().hasAttribute('data-expanded')).toBe(false);

			await advance(5001);
			expect(roots()).toHaveLength(0);
		});

		it('stays expanded on a touch inside the viewport', async () => {
			renderToasts();

			await click(button('add'));
			mouseEnter(viewport());

			pointer('pointerdown', viewport(), { pointerType: 'touch' });
			await tick();

			expect(viewport().hasAttribute('data-expanded')).toBe(true);

			await advance(5001);
			expect(roots()).toHaveLength(1);
		});

		it('ignores a mouse pointerdown outside the viewport', async () => {
			renderToasts();

			await click(button('add'));
			mouseEnter(viewport());

			// Only touch activity ends the paused interaction; a mouse press outside
			// is followed by a `mouseleave`, which handles the collapse instead.
			pointer('pointerdown', document.body, { pointerType: 'mouse' });
			await tick();

			expect(viewport().hasAttribute('data-expanded')).toBe(true);

			await advance(5001);
			expect(roots()).toHaveLength(1);
		});

		it('resumes timers when the viewport is blurred', async () => {
			renderToasts();

			const addButton = button('add');
			await click(addButton);
			keyDown(document.activeElement!, 'F6');
			await tick();

			await advance(5001);
			expect(roots()).toHaveLength(1);

			addButton.focus();
			await tick();

			await advance(5001);
			expect(roots()).toHaveLength(0);
		});

		it('resumes timers when the window regains focus', async () => {
			renderToasts();

			await click(button('add'));
			expect(roots()).toHaveLength(1);

			await advance(1000);

			window.dispatchEvent(new FocusEvent('blur'));
			await tick();

			await advance(5000);
			expect(roots()).toHaveLength(1);

			window.dispatchEvent(new FocusEvent('focus'));
			await tick();

			await advance(3999);
			expect(roots()).toHaveLength(1);

			await advance(2);
			expect(roots()).toHaveLength(0);
		});

		it('keeps timers paused on mouseleave while the window is blurred', async () => {
			renderToasts();

			await click(button('add'));

			// Hovering pauses the timer.
			mouseEnter(viewport());
			await advance(1000);

			// The window loses focus while still hovering.
			window.dispatchEvent(new FocusEvent('blur'));
			await tick();

			// Leaving with the pointer must not resume the timer while the window is
			// blurred, otherwise the toast could expire off-screen.
			mouseLeave(viewport());
			await advance(10000);

			expect(roots()).toHaveLength(1);
		});

		it('keeps timers paused on viewport blur while the window is blurred', async () => {
			renderToasts();

			const addButton = button('add');
			await click(addButton);

			keyDown(document.activeElement!, 'F6');
			await tick();
			expect(document.activeElement).toBe(viewport());

			await advance(1000);

			window.dispatchEvent(new FocusEvent('blur'));
			await tick();

			addButton.focus();
			await advance(10000);

			expect(roots()).toHaveLength(1);
		});

		it('collapses a deferred mouseleave after a closing toast is removed while blurred', async () => {
			await withAnimations(async () => {
				const { manager } = renderToasts();

				await click(button('add'));
				await click(button('add'));

				const newestRoot = roots()[0];
				let finishAnimation!: () => void;
				const animationFinished = new Promise<void>((resolve) => {
					finishAnimation = resolve;
				});
				Object.defineProperty(newestRoot, 'getAnimations', {
					value: () => [{ finished: animationFinished }],
					configurable: true
				});

				mouseEnter(viewport());
				await tick();
				expect(viewport().hasAttribute('data-expanded')).toBe(true);

				manager.close(manager.toasts[0]?.id);
				await tick();
				expect(newestRoot.hasAttribute('data-ending-style')).toBe(true);

				mouseLeave(viewport());
				window.dispatchEvent(new FocusEvent('blur'));
				await tick();

				await advance(20);
				await nextFrame();
				finishAnimation();
				await advance(0);

				expect(roots()).toHaveLength(1);
				expect(viewport().hasAttribute('data-expanded')).toBe(false);
			});
		});
	});

	describe('focus management', () => {
		useFakeClock();

		it('skips toasts animating out when tabbing into the viewport', async () => {
			await withAnimations(async () => {
				renderToasts();

				await click(button('add')); // oldest toast
				await click(button('add')); // newest toast (toasts[0])

				const [newest, survivor] = roots();
				holdExit(newest);

				await click(closeButton(newest));
				expect(newest.hasAttribute('data-ending-style')).toBe(true);

				// F6 focuses the viewport and renders the focus guards.
				await userEvent.keyboard('{F6}');
				await userEvent.keyboard('{Tab}');

				expect(document.activeElement).toBe(survivor);
			});
		});

		it('returns focus when no toast can receive focus', async () => {
			renderToasts({ limit: 0 });

			const addButton = button('add');
			addButton.focus();
			await click(addButton);

			await userEvent.keyboard('{F6}');
			expect(document.activeElement).toBe(viewport());

			await userEvent.keyboard('{Tab}');

			expect(document.activeElement).toBe(addButton);
		});

		it('returns focus to the trigger when every toast is closed', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager, timeout: 0 });

			const addButton = button('add');
			addButton.focus();
			await click(addButton);

			await userEvent.keyboard('{F6}');
			await userEvent.keyboard('{Tab}');

			expect(document.activeElement).toBe(byTestId('root'));

			// Closing everything leaves no toast to hand focus to.
			toastManager.close();
			await tick();

			expect(document.activeElement).toBe(addButton);
		});

		it('moves focus past toasts animating out when one is closed', async () => {
			await withAnimations(async () => {
				const toastManager = Toast.createToastManager();
				renderToasts({ toastManager, timeout: 0 });

				const addButton = button('add');
				addButton.focus();

				toastManager.add({ title: 'oldest' });
				toastManager.add({ id: 'middle', title: 'middle' });
				toastManager.add({ id: 'newest', title: 'newest' });
				await tick();

				const [newest, middle, oldest] = roots();
				expect(middle.textContent).toContain('middle');
				holdExit(middle);

				await userEvent.keyboard('{F6}');
				await userEvent.keyboard('{Tab}');

				expect(document.activeElement).toBe(newest);

				// Dismissing both in one go leaves the middle toast animating out while
				// the focused toast closes, so focus has to skip over it.
				toastManager.close('middle');
				toastManager.close('newest');
				await tick();

				expect(middle.hasAttribute('data-ending-style')).toBe(true);
				expect(document.activeElement).toBe(oldest);
			});
		});

		it('leaves focus alone when it is outside the viewport', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager, timeout: 0 });

			const addButton = button('add');
			addButton.focus();
			await click(addButton);
			await click(addButton);

			// Focus never entered the viewport, so closing a toast must not steal it.
			toastManager.close();
			await tick();

			expect(document.activeElement).toBe(addButton);
		});
	});
});
