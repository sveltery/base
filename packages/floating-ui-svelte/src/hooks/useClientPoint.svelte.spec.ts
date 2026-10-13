// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useClientPoint.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The harness reads the rect the way a positioner does, from `store.referenceElement`.
import { tick } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ClientPointHarness from './__tests__/ClientPointHarness.svelte';

function mouse(target: EventTarget, type: string, x: number, y: number) {
	target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
}

function rectOf(
	element: Element,
	{ x, y, width, height }: { x: number; y: number; width: number; height: number }
) {
	element.getBoundingClientRect = () =>
		({ x, y, width, height, top: y, left: x, right: x + width, bottom: y + height }) as DOMRect;
}

function mount(
	props: { enabled?: boolean; axis?: 'x' | 'y' | 'both'; registerReference?: boolean } = {}
) {
	const view = render(ClientPointHarness, props);
	const { store } = view.component;
	const reference = page.getByTestId('reference').element();
	const toggle = page.getByTestId('toggle').element() as HTMLElement;
	const location = () => {
		const { x, y, width, height } = store.referenceElement!.getBoundingClientRect() as DOMRect;
		return { x, y, width, height };
	};
	return { view, store, reference, toggle, location };
}

describe('ClientPointInteraction', () => {
	it('positions at the cursor over the trigger', async () => {
		const { reference, location } = mount();
		mouse(reference, 'mousemove', 400, 200);
		await tick();
		expect(location()).toEqual({ x: 400, y: 200, width: 0, height: 0 });
	});

	it('uses the event target as the trigger when the store has none', async () => {
		const { reference, location } = mount({ axis: 'x', registerReference: false });
		rectOf(reference, { x: 10, y: 50, width: 0, height: 0 });
		mouse(reference, 'mousemove', 200, 300);
		await tick();
		expect(location()).toEqual({ x: 200, y: 50, width: 0, height: 0 });
	});

	it('follows the cursor over the window only while open', async () => {
		const { reference, toggle, location } = mount();
		mouse(reference, 'mousemove', 500, 500);
		await tick();
		expect(location()).toEqual({ x: 500, y: 500, width: 0, height: 0 });

		mouse(reference, 'mousemove', 1000, 1000);
		await tick();
		expect(location()).toEqual({ x: 1000, y: 1000, width: 0, height: 0 });

		mouse(window, 'mousemove', 700, 700);
		await tick();
		expect(location()).toEqual({ x: 1000, y: 1000, width: 0, height: 0 });

		toggle.click();
		await tick();
		mouse(reference, 'mousemove', 700, 700);
		await tick();
		expect(location()).toEqual({ x: 700, y: 700, width: 0, height: 0 });

		mouse(document.body, 'mousemove', 0, 0);
		await tick();
		expect(location()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
	});

	it('stops following when the popup closes or the interaction is disabled', async () => {
		const { view, reference, toggle, location } = mount();
		toggle.click();
		await tick();
		mouse(reference, 'mousemove', 500, 500);
		await tick();

		toggle.click();
		await tick();
		mouse(document.body, 'mousemove', 0, 0);
		await tick();
		expect(location()).toEqual({ x: 500, y: 500, width: 0, height: 0 });

		toggle.click();
		await tick();
		mouse(document.body, 'mousemove', 500, 500);
		await tick();
		expect(location()).toEqual({ x: 500, y: 500, width: 0, height: 0 });

		await view.rerender({ enabled: false });
		mouse(document.body, 'mousemove', 0, 0);
		await tick();
		expect(location()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
	});

	it('hands the position back to the trigger on disable and clears it on unmount', async () => {
		const { view, store, reference } = mount();
		const virtual = { getBoundingClientRect: () => reference.getBoundingClientRect() };
		store.positionReference = virtual;

		await view.rerender({ enabled: false });
		await tick();
		expect(store.referenceElement).toBe(reference);

		store.positionReference = virtual;
		view.unmount();
		expect(store.positionReference).toBeNull();
	});

	it('tracks only x with axis x', async () => {
		const { reference, toggle, location } = mount({ axis: 'x' });
		toggle.click();
		mouse(reference, 'mousemove', 500, 500);
		await tick();
		expect(location()).toEqual({ x: 500, y: 0, width: 0, height: 0 });
	});

	it('tracks only y with axis y', async () => {
		const { reference, toggle, location } = mount({ axis: 'y' });
		toggle.click();
		mouse(reference, 'mousemove', 500, 500);
		await tick();
		expect(location()).toEqual({ x: 0, y: 500, width: 0, height: 0 });
	});

	it.each([
		{
			axis: 'x' as const,
			atCursor: { x: 500, y: 20, width: 0, height: 40 },
			afterReferenceMoves: { x: 550, y: 70, width: 0, height: 40 }
		},
		{
			axis: 'y' as const,
			atCursor: { x: 10, y: 500, width: 30, height: 0 },
			afterReferenceMoves: { x: 60, y: 550, width: 30, height: 0 }
		}
	])(
		'keeps the trigger size on the untracked axis when tracking $axis',
		async ({ axis, atCursor, afterReferenceMoves }) => {
			const { reference, toggle, location } = mount({ axis });
			rectOf(reference, { x: 10, y: 20, width: 30, height: 40 });

			mouse(reference, 'mousemove', 500, 500);
			await tick();
			expect(location()).toEqual(atCursor);

			// Opening re-reads the virtual element as an auto-update. A click open is not a hover,
			// so the cursor point keeps its offset from the trigger instead of snapping back.
			rectOf(reference, { x: 60, y: 70, width: 30, height: 40 });
			toggle.click();
			await tick();
			expect(location()).toEqual(afterReferenceMoves);
		}
	);

	it('stops following once the cursor lands on the popup', async () => {
		const { reference, toggle, location } = mount();
		toggle.click();
		await tick();
		mouse(reference, 'mousemove', 500, 500);
		mouse(page.getByTestId('floating').element(), 'mousemove', 500, 500);
		await tick();

		mouse(document.body, 'mousemove', 0, 0);
		expect(location()).toEqual({ x: 500, y: 500, width: 0, height: 0 });
	});

	it('follows again after the cursor returns from the popup to the trigger', async () => {
		const { reference, toggle, location } = mount();
		toggle.click();
		await tick();
		mouse(reference, 'mousemove', 500, 500);
		mouse(page.getByTestId('floating').element(), 'mousemove', 500, 500);
		await tick();
		mouse(document.body, 'mousemove', 0, 0);
		expect(location()).toEqual({ x: 500, y: 500, width: 0, height: 0 });

		mouse(reference, 'mousemove', 600, 700);
		await tick();
		mouse(reference, 'mousemove', 600, 700);
		expect(location()).toEqual({ x: 600, y: 700, width: 0, height: 0 });

		mouse(document.body, 'mousemove', 100, 200);
		await tick();
		expect(location()).toEqual({ x: 100, y: 200, width: 0, height: 0 });
	});

	it('restores the trigger rect when the popup is opened by a non-mouse event', async () => {
		const { reference, location } = mount();
		rectOf(reference, { x: 10, y: 20, width: 30, height: 40 });

		mouse(reference, 'mousemove', 500, 500);
		await tick();
		expect(location()).toEqual({ x: 500, y: 500, width: 0, height: 0 });

		(page.getByTestId('focus-open').element() as HTMLElement).click();
		await tick();
		expect(location()).toEqual({ x: 10, y: 20, width: 30, height: 40 });

		mouse(document.body, 'mousemove', 100, 200);
		mouse(reference, 'mousemove', 300, 400);
		await tick();
		expect(location()).toEqual({ x: 10, y: 20, width: 30, height: 40 });
	});
});
