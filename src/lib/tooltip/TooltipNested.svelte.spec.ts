// Assertions follow the "nested tooltips" cases of Base UI v1.9.0
// packages/react/src/tooltip/root/TooltipRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { parkPointer } from '../../tests/pointer.js';
import TooltipNestedHarness from '../../tests/TooltipNestedHarness.svelte';
import { byTestId, fire } from '../../tests/tooltip-events.js';
import { OPEN_DELAY } from './constants.js';

const flags = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };

beforeEach(async () => {
	await parkPointer();
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	document.body.click();
});

async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

function get(id: string) {
	const element = byTestId(id);
	if (!element) throw new Error(`${id} missing`);
	return element;
}

const at = (clientX: number) => ({ clientX, clientY: 10 });

function enterOuter(x = 10) {
	fire.pointerEnter(get('outer-trigger'), at(x));
	fire.mouseEnter(get('outer-trigger'));
}

function hoverOuter() {
	fire.pointerDown(get('outer-trigger'));
	fire.pointerEnter(get('outer-trigger'), at(10));
	fire.mouseEnter(get('outer-trigger'));
	fire.mouseMove(get('outer-trigger'), at(10));
}

function enterInner(id = 'inner-trigger', x = 50, move = true) {
	fire.pointerEnter(get(id), at(x));
	fire.mouseEnter(get(id));
	fire.mouseOver(get(id));
	if (move) fire.mouseMove(get(id), at(x));
}

function backToOuterArea() {
	fire.mouseOut(get('inner-trigger'), { relatedTarget: get('outer-area') });
	fire.mouseOver(get('outer-area'));
}

describe('nested tooltips', () => {
	it('does not open the outer tooltip when hovering over a nested tooltip trigger', async () => {
		render(TooltipNestedHarness, {});
		enterOuter();
		fire.pointerDown(get('inner-trigger'));
		enterInner('inner-trigger', 10);
		await advance(OPEN_DELAY);
		expect(byTestId('inner-popup')).not.toBeNull();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('does not open the outer tooltip when moving between sibling nested triggers', async () => {
		render(TooltipNestedHarness, { layout: 'siblings' });
		enterOuter();
		enterInner('inner-a-trigger', 30);
		await advance(OPEN_DELAY);
		expect(byTestId('inner-a-popup')).not.toBeNull();
		expect(byTestId('inner-b-popup')).toBeNull();
		expect(byTestId('outer-popup')).toBeNull();

		fire.mouseOut(get('inner-a-trigger'), { relatedTarget: get('inner-b-trigger') });
		enterInner('inner-b-trigger', 50);
		await advance(OPEN_DELAY);
		expect(byTestId('inner-a-popup')).toBeNull();
		expect(byTestId('inner-b-popup')).not.toBeNull();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('does not open ancestor tooltips when hovering over a third-level nested trigger', async () => {
		render(TooltipNestedHarness, { layout: 'three-level' });
		enterOuter();
		fire.pointerEnter(get('parent-trigger'), at(30));
		fire.mouseEnter(get('parent-trigger'));
		enterInner('child-trigger', 50);
		await advance(OPEN_DELAY);
		expect(byTestId('child-popup')).not.toBeNull();
		expect(byTestId('parent-popup')).toBeNull();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('opens the outer tooltip when moving from a nested trigger to the parent area with zero delay', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 0 } });
		fire.pointerDown(get('inner-trigger'));
		enterInner('inner-trigger', 50, false);
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
		backToOuterArea();
		await tick();
		expect(byTestId('outer-popup')).not.toBeNull();
	});

	it('does not open a disabled outer tooltip when moving from a nested trigger to the parent area', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 0, disabled: true } });
		fire.pointerDown(get('inner-trigger'));
		enterInner('inner-trigger', 50, false);
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
		backToOuterArea();
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('reopens the delayed outer tooltip when moving from a nested trigger to the parent area', async () => {
		render(TooltipNestedHarness, {
			area: true,
			provider: { delay: 100 },
			inner: { delay: 1000 }
		});
		enterOuter();
		enterInner();
		await advance(100);
		expect(byTestId('outer-popup')).toBeNull();
		backToOuterArea();
		await advance(100);
		expect(byTestId('outer-popup')).not.toBeNull();
	});

	it('does not re-announce an open outer tooltip when the pending reopen fires', async () => {
		const onOpenChange = vi.fn();
		render(TooltipNestedHarness, {
			area: true,
			provider: { delay: 100 },
			inner: { delay: 1000 },
			outerBound: true,
			outerRoot: { onOpenChange }
		});
		enterOuter();
		enterInner();
		backToOuterArea();
		fire.click(get('open-outer'));
		await tick();
		expect(byTestId('outer-popup')).not.toBeNull();
		await advance(100);
		expect(byTestId('outer-popup')).not.toBeNull();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('supports nested triggers inside a detached parent trigger', async () => {
		render(TooltipNestedHarness, {
			layout: 'detached',
			area: true,
			outerTag: 'div',
			provider: { delay: 100 },
			inner: { delay: 0 }
		});
		enterOuter();
		enterInner();
		await advance(100);
		expect(byTestId('inner-popup')).not.toBeNull();
		expect(byTestId('outer-popup')).toBeNull();
		backToOuterArea();
		await advance(100);
		expect(byTestId('outer-popup')?.textContent).toBe('Row tooltip');
	});

	it('does not reopen the outer tooltip when rapidly moving back to a nested trigger', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 100 } });
		enterOuter();
		enterInner();
		await advance(100);
		backToOuterArea();
		await advance(50);
		fire.mouseOut(get('outer-area'), { relatedTarget: get('inner-trigger') });
		fire.mouseOver(get('inner-trigger'));
		await advance(50);
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('does not reopen the outer tooltip when hovering the nested tooltip popup', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 100 }, inner: { delay: 0 } });
		enterOuter();
		enterInner();
		await advance(100);
		const innerPopup = get('inner-popup');
		expect(byTestId('outer-popup')).toBeNull();
		fire.mouseOver(innerPopup);
		await advance(100);
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('cancels the pending parent reopen when the pointer leaves the parent trigger', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 100 } });
		enterOuter();
		enterInner();
		await advance(100);
		backToOuterArea();
		await advance(50);
		fire.mouseLeave(get('outer-trigger'), { relatedTarget: document.body });
		await advance(100);
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('does not open the outer tooltip when the pointer moves onto a nested trigger before the delay expires', async () => {
		render(TooltipNestedHarness, { area: true });
		hoverOuter();
		await advance(OPEN_DELAY / 2);
		fire.pointerEnter(get('inner-trigger'), at(50));
		fire.pointerMove(get('inner-trigger'), at(50));
		fire.mouseOver(get('inner-trigger'));
		fire.mouseEnter(get('inner-trigger'));
		fire.mouseMove(get('inner-trigger'), at(50));
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('restarts the parent delay when moving from a nested trigger to the parent area', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 100 }, inner: { delay: 1000 } });
		enterOuter();
		fire.mouseMove(get('outer-trigger'), at(10));
		await advance(50);
		enterInner('inner-trigger', 50, false);
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
		backToOuterArea();
		await advance(50);
		expect(byTestId('outer-popup')).toBeNull();
		await advance(50);
		expect(byTestId('outer-popup')).not.toBeNull();
	});

	it('closes the outer tooltip when the pointer moves from the outer area onto a nested trigger', async () => {
		render(TooltipNestedHarness, { area: true });
		hoverOuter();
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).not.toBeNull();
		enterInner('inner-trigger', 50, false);
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('keeps a focus-opened outer tooltip open when hovering over a nested trigger', async () => {
		render(TooltipNestedHarness, { outerTabIndex: 0, inner: { delay: OPEN_DELAY * 10 } });
		get('outer-trigger').focus();
		await tick();
		expect(byTestId('outer-popup')).not.toBeNull();
		enterInner();
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).not.toBeNull();
	});

	it('keeps an initially open outer tooltip open when hovering over a nested trigger', async () => {
		const onOpenChange = vi.fn();
		render(TooltipNestedHarness, {
			outerRoot: { open: true, onOpenChange },
			inner: { delay: OPEN_DELAY * 10 }
		});
		await tick();
		expect(byTestId('outer-popup')).not.toBeNull();
		enterInner();
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).not.toBeNull();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('does not open the outer tooltip when focusing a nested tooltip trigger', async () => {
		render(TooltipNestedHarness, { outerTag: 'div', provider: { delay: 0 } });
		get('inner-trigger').focus();
		await tick();
		expect(byTestId('inner-popup')).not.toBeNull();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('closes a focus-opened inner tooltip when the inner trigger loses focus', async () => {
		render(TooltipNestedHarness, {
			outerTag: 'div',
			provider: { delay: 0 },
			outerRoot: { open: false },
			after: true
		});
		get('inner-trigger').focus();
		await tick();
		expect(byTestId('inner-popup')).not.toBeNull();
		get('after').focus();
		await advance(OPEN_DELAY);
		expect(byTestId('inner-popup')).toBeNull();
	});

	it('lets the parent tooltip open when a nested trigger is disabled', async () => {
		render(TooltipNestedHarness, { inner: { disabled: true } });
		fire.pointerDown(get('outer-trigger'));
		fire.pointerEnter(get('outer-trigger'), at(10));
		fire.mouseEnter(get('outer-trigger'));
		enterInner();
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).not.toBeNull();
		expect(byTestId('inner-popup')).toBeNull();
	});

	it('does not open the outer tooltip when hovering over a nested trigger inside a shadow root', async () => {
		const host = document.body.appendChild(document.createElement('div'));
		const shadowRoot = host.attachShadow({ mode: 'open' });
		const container = document.createElement('div');
		shadowRoot.appendChild(container);
		try {
			render(TooltipNestedHarness, { target: container, props: { innerTag: 'div' } });
			const outerTrigger = shadowRoot.querySelector<HTMLElement>('[data-testid="outer-trigger"]')!;
			const innerTrigger = shadowRoot.querySelector<HTMLElement>('[data-testid="inner-trigger"]')!;
			const innerShadowTarget = document.createElement('span');
			innerShadowTarget.textContent = 'Inner shadow target';
			innerTrigger.attachShadow({ mode: 'open' }).appendChild(innerShadowTarget);

			fire.pointerDown(outerTrigger);
			fire.pointerEnter(outerTrigger, at(10));
			fire.mouseEnter(outerTrigger);
			fire.mouseMove(outerTrigger, at(10));
			fire.pointerEnter(innerTrigger, at(50));
			fire.mouseEnter(innerTrigger);
			innerShadowTarget.dispatchEvent(
				new MouseEvent('mouseover', { bubbles: true, composed: true, ...at(50) })
			);
			fire.mouseMove(innerTrigger, at(50));
			await advance(OPEN_DELAY);
			expect(byTestId('outer-popup')).toBeNull();
		} finally {
			host.remove();
		}
	});

	it('falls back to the event target when the composed path is empty', async () => {
		render(TooltipNestedHarness, { innerPopup: false });
		fire.pointerDown(get('outer-trigger'));
		fire.pointerEnter(get('outer-trigger'));
		fire.mouseEnter(get('outer-trigger'));
		fire.mouseMove(get('outer-trigger'));
		const mouseOver = new MouseEvent('mouseover', { bubbles: true, composed: true });
		Object.defineProperty(mouseOver, 'composedPath', { value: () => [] });
		get('inner-trigger').dispatchEvent(mouseOver);
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('opens the outer tooltip when hovering over the non-nested area', async () => {
		render(TooltipNestedHarness, { area: true });
		hoverOuter();
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).not.toBeNull();
		expect(byTestId('inner-popup')).toBeNull();
	});

	it('does not reopen the outer tooltip through the local reopen path for touch pointers', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 0 } });
		fire.pointerEnter(get('outer-trigger'), { pointerType: 'touch', ...at(10) });
		fire.pointerEnter(get('inner-trigger'), { pointerType: 'touch', ...at(50) });
		fire.mouseOver(get('inner-trigger'));
		await tick();
		backToOuterArea();
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('allows mouse hover after leaving a touch interaction', async () => {
		render(TooltipNestedHarness, { area: true, outer: { delay: 0 } });
		fire.pointerEnter(get('outer-trigger'), { pointerType: 'touch', ...at(10) });
		fire.mouseLeave(get('outer-trigger'), { relatedTarget: document.body });
		fire.mouseOver(get('inner-trigger'));
		backToOuterArea();
		await tick();
		expect(byTestId('outer-popup')).not.toBeNull();
	});

	it('does not open the outer tooltip when moving from the outer popup to a nested trigger', async () => {
		render(TooltipNestedHarness, { area: true, inner: { delay: OPEN_DELAY * 10 } });
		hoverOuter();
		await advance(OPEN_DELAY);
		const outerPopup = get('outer-popup');
		fire.pointerEnter(outerPopup, { clientX: 200, clientY: 200 });
		fire.mouseOver(outerPopup);
		await tick();
		enterInner('inner-trigger', 50, false);
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('suppresses the safe-polygon open while a nested trigger is hovered', async () => {
		render(TooltipNestedHarness, { area: true, inner: { delay: OPEN_DELAY * 10 } });
		hoverOuter();
		enterInner('inner-trigger', 50, false);
		fire.mouseMove(get('inner-trigger'), at(50));
		fire.mouseMove(get('inner-trigger'), at(51));
		await advance(OPEN_DELAY);
		expect(byTestId('outer-popup')).toBeNull();
	});

	it('supports nested triggers with a Provider delay of 0', async () => {
		render(TooltipNestedHarness, { area: true, provider: { delay: 0 } });
		enterOuter();
		enterInner('inner-trigger', 50, false);
		await tick();
		expect(byTestId('outer-popup')).toBeNull();
		expect(byTestId('inner-popup')).not.toBeNull();
		backToOuterArea();
		await tick();
		expect(byTestId('outer-popup')).not.toBeNull();
	});
});
