// Behavior follows Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useHoverReferenceInteraction.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import { FloatingTreeStore } from '../components/FloatingTreeStore.js';
import type { HandleClose, HandleCloseContext } from '../safePolygon.js';
import HoverHarness from './__tests__/HoverHarness.svelte';

function trigger(id: 'first' | 'second') {
	return page.getByTestId(id).element() as HTMLElement;
}

function fire(element: HTMLElement, type: string) {
	flushSync(() => {
		if (type.startsWith('pointer')) {
			element.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'mouse' }));
		} else {
			element.dispatchEvent(new MouseEvent(type, { bubbles: type !== 'mouseenter' }));
		}
	});
}

function active(store: { domReferenceElement: Element | null; lastReason: string | null }) {
	return [store.domReferenceElement?.getAttribute('data-testid') ?? null, store.lastReason];
}

describe('HoverReferenceInteraction', () => {
	it('anchors a popup opened without a trigger on the trigger the pointer enters', () => {
		const { component } = render(HoverHarness);
		const { store } = component;
		flushSync(() => store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction)));
		expect(active(store)).toEqual([null, 'imperative-action']);

		fire(trigger('first'), 'pointerenter');
		fire(trigger('first'), 'mouseenter');

		expect(active(store)).toEqual(['first', 'trigger-hover']);
	});

	it('switches to another trigger the pointer moves over while open, without the rest delay', () => {
		const { component } = render(HoverHarness, { restMs: 500, move: false });
		const { store } = component;
		fire(trigger('second'), 'pointerenter');
		fire(trigger('second'), 'mouseenter');
		// A keyboard press opens the popup from the first trigger while the pointer rests here.
		flushSync(() =>
			store.setOpen(
				true,
				createChangeEventDetails(REASONS.triggerPress, undefined, trigger('first'))
			)
		);

		fire(trigger('second'), 'mousemove');

		expect(active(store)).toEqual(['second', 'trigger-hover']);
	});

	it('hands the external tree to the close handler', () => {
		const externalTree = new FloatingTreeStore();
		const trees: unknown[] = [];
		const handleClose = Object.assign(
			(context: HandleCloseContext) => {
				trees.push(context.tree);
				return () => {};
			},
			{ __options: {} }
		) as HandleClose;
		const { component } = render(HoverHarness, { handleClose, externalTree });
		const { store } = component;

		fire(trigger('first'), 'pointerenter');
		fire(trigger('first'), 'mouseenter');
		expect(active(store)).toEqual(['first', 'trigger-hover']);
		fire(trigger('first'), 'mouseleave');

		expect(trees).toEqual([externalTree]);
	});
});
