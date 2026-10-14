// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useDismiss.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DismissBubblesHarness from './__tests__/DismissBubblesHarness.svelte';
import DismissNode from './__tests__/DismissNode.svelte';
import DismissOrderHarness from './__tests__/DismissOrderHarness.svelte';
import DismissPortalHarness from './__tests__/DismissPortalHarness.svelte';

function pressOutside() {
	flushSync(() => {
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	});
}

/** The inner node opens after the outer one, as a nested popup does. */
function renderNested(props: Parameters<typeof render<typeof DismissBubblesHarness>>[1] = {}) {
	render(DismissBubblesHarness, props);
	flushSync(() =>
		(page.getByRole('button', { name: 'open inner' }).element() as HTMLElement).click()
	);
}

function mounted() {
	return ['outer', 'inner'].filter((id) => page.getByTestId(id).elements().length > 0);
}

describe('DismissInteraction', () => {
	describe('prop: bubbles.outsidePress', () => {
		it('closes the whole tree by default', () => {
			renderNested();
			expect(mounted()).toEqual(['outer', 'inner']);

			pressOutside();

			expect(mounted()).toEqual([]);
		});

		it('closes one level per press when no level bubbles', () => {
			renderNested({
				outer: { outsidePress: false },
				inner: { outsidePress: false }
			});

			pressOutside();
			expect(mounted()).toEqual(['outer']);

			pressOutside();
			expect(mounted()).toEqual([]);
		});

		it('keeps the parent open while a child that does not bubble is open', () => {
			renderNested({
				outer: { outsidePress: true },
				inner: { outsidePress: false }
			});

			pressOutside();
			expect(mounted()).toEqual(['outer']);

			pressOutside();
			expect(mounted()).toEqual([]);
		});
	});

	describe('prop: outsidePressEvent', () => {
		it('dismisses on a sloppy outside tap while a touch that began inside is still down', () => {
			render(DismissNode, { testId: 'outer', open: true });
			const touch = { bubbles: true, button: 0, pointerType: 'touch' };

			flushSync(() => {
				page.getByTestId('outer').element().dispatchEvent(new PointerEvent('pointerdown', touch));
				document.body.dispatchEvent(new PointerEvent('pointerdown', touch));
				document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
			});

			expect(mounted()).toEqual([]);
		});
	});

	describe('outside press button', () => {
		it.each([
			['middle', 1],
			['right', 2]
		])('closes on a %s-button outside press', (_name, button) => {
			render(DismissNode, { testId: 'outer', open: true });
			expect(mounted()).toEqual(['outer']);

			flushSync(() =>
				document.body.dispatchEvent(
					new PointerEvent('pointerdown', { bubbles: true, button, pointerType: 'mouse' })
				)
			);

			expect(mounted()).toEqual([]);
		});

		it('does not count a non-primary press for a later intentional click', () => {
			const { component } = render(DismissOrderHarness, { outsidePressEvent: 'intentional' });
			const press = (button: number) =>
				flushSync(() => {
					document.body.dispatchEvent(
						new PointerEvent('pointerdown', { bubbles: true, button, pointerType: 'mouse' })
					);
					document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
				});

			press(2);
			expect(component.store.open).toBe(true);

			press(0);
			expect(component.store.open).toBe(false);
		});
	});

	describe('outside press target listener', () => {
		it('does not close when an ancestor capture listener stops the press before its target', () => {
			render(DismissNode, { testId: 'outer', open: true });
			const ancestor = document.body.appendChild(document.createElement('div'));
			const target = ancestor.appendChild(document.createElement('span'));
			const stop = (event: Event) => event.stopPropagation();
			ancestor.addEventListener('pointerdown', stop, { capture: true });
			const press = () =>
				flushSync(() =>
					target.dispatchEvent(
						new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })
					)
				);

			try {
				press();
				expect(mounted()).toEqual(['outer']);

				ancestor.removeEventListener('pointerdown', stop, { capture: true });
				press();
				expect(mounted()).toEqual([]);
			} finally {
				ancestor.remove();
			}
		});
	});

	describe('outside press order', () => {
		it('dismisses on a click before the pressed control closes a bound popup', () => {
			const { component } = render(DismissOrderHarness, { outsidePressEvent: 'intentional' });

			flushSync(() => (page.getByTestId('hide').element() as HTMLElement).click());

			expect(component.store.lastReason).toBe('outside-press');
		});

		it('dismisses on a pointerdown before the pressed control closes a bound popup', () => {
			const { component } = render(DismissOrderHarness, { outsidePressEvent: 'sloppy' });

			flushSync(() =>
				page
					.getByTestId('hide')
					.element()
					.dispatchEvent(
						new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })
					)
			);

			expect(component.store.lastReason).toBe('outside-press');
		});
	});

	describe('nested portal', () => {
		it('counts a press in a portal nested in its portal host as inside, and its own host as outside', async () => {
			render(DismissPortalHarness);
			await expect.poll(mounted).toEqual(['outer']);
			flushSync(() =>
				(page.getByRole('button', { name: 'open inner' }).element() as HTMLElement).click()
			);
			await expect.poll(mounted).toEqual(['outer', 'inner']);
			const outerPortal = page.getByTestId('outer-portal').element();
			expect(page.getByTestId('inner-portal').element().parentElement).toBe(outerPortal);
			const press = (target: Element) =>
				flushSync(() =>
					target.dispatchEvent(
						new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })
					)
				);

			press(page.getByTestId('inner').element());
			expect(mounted()).toEqual(['outer', 'inner']);

			press(outerPortal);
			expect(mounted()).toEqual([]);
		});
	});
});
