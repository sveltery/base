// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useDismiss.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DismissBubblesHarness from './__tests__/DismissBubblesHarness.svelte';
import DismissNode from './__tests__/DismissNode.svelte';
import DismissOrderHarness from './__tests__/DismissOrderHarness.svelte';

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
});
