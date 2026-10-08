// Assertions follow Base UI v1.8.0 packages/react/src/scroll-area/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, refs, and className callbacks are not ported.
// Direction comes from DirectionProvider. The scrollbar style tag reads the CSP provider.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ScrollAreaCSPHarness from '../../tests/ScrollAreaCSPHarness.svelte';
import ScrollAreaHarness from '../../tests/ScrollAreaHarness.svelte';
import { SCROLL_TIMEOUT } from './constants.js';

function root() {
	return page.getByTestId('root');
}

function viewport() {
	return page.getByTestId('viewport');
}

function scrollbarY() {
	return page.getByTestId('scrollbar-y');
}

function thumbY() {
	return page.getByTestId('thumb-y');
}

function host(locator: ReturnType<typeof root>) {
	return locator.element() as HTMLElement;
}

function stubCapture(element: HTMLElement) {
	let captured: number | null = null;
	element.setPointerCapture = (pointerId: number) => {
		captured = pointerId;
	};
	element.hasPointerCapture = (pointerId: number) => captured === pointerId;
	element.releasePointerCapture = (pointerId: number) => {
		if (captured === pointerId) captured = null;
	};
	return {
		drop() {
			captured = null;
		}
	};
}

function pointer(type: string, init: PointerEventInit & { button?: number } = {}) {
	return new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		pointerType: 'mouse',
		pointerId: 1,
		button: 0,
		buttons: 1,
		...init
	});
}

describe('<ScrollArea />', () => {
	it('hides scrollbars until content overflows and exposes the viewport', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });

		await expect.element(root()).toHaveAttribute('role', 'presentation');
		await expect.element(root()).toHaveAttribute('data-has-overflow-x', '');
		await expect.element(root()).toHaveAttribute('data-has-overflow-y', '');
		await expect.element(viewport()).toHaveAttribute('data-has-overflow-y', '');
		await expect.element(viewport()).toHaveClass('base-ui-disable-scrollbar');
		await expect.element(viewport()).toHaveAttribute('tabindex', '0');
		expect(host(viewport()).getAttribute('data-id')).toContain('-viewport');
		await expect.element(scrollbarY()).toHaveAttribute('aria-hidden', 'true');
		await expect.element(scrollbarY()).toHaveAttribute('data-orientation', 'vertical');
		await expect.element(page.getByTestId('corner')).toBeInTheDocument();
		expect(host(viewport()).style.getPropertyValue('--scroll-area-overflow-y-end')).not.toBe('0px');
	});

	it('keeps a non-overflowing viewport out of tab order and unmounts scrollbars', async () => {
		render(ScrollAreaHarness, { scenario: 'none' });

		await expect.element(viewport()).toHaveAttribute('tabindex', '-1');
		await expect.element(root()).not.toHaveAttribute('data-has-overflow-y');
		expect(page.getByTestId('scrollbar-y').elements()).toHaveLength(0);
		expect(page.getByTestId('corner').elements()).toHaveLength(0);
	});

	it('sizes thumbs from the viewport ratio', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(thumbY()).toBeInTheDocument();
		const value = getComputedStyle(host(thumbY())).getPropertyValue('--scroll-area-thumb-height');
		const size = Number.parseFloat(value);
		expect(size).toBeGreaterThanOrEqual(16);
		expect(size).toBeLessThan(200);
	});

	it('shrinks the thumb when the scrollbar has padding', async () => {
		render(ScrollAreaHarness, { scenario: 'padded' });
		await expect.element(thumbY()).toBeInTheDocument();
		const value = getComputedStyle(host(thumbY())).getPropertyValue('--scroll-area-thumb-height');
		expect(Number.parseFloat(value)).toBeCloseTo((200 - 16) * (200 / 1000), 0);
	});

	it('adds data-scrolling for a user scroll and clears it after the timeout', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(root()).toHaveAttribute('data-has-overflow-y', '');
		const element = host(viewport());
		element.dispatchEvent(pointer('pointerenter', { bubbles: false }));
		element.scrollTop = 30;
		await expect.element(viewport()).toHaveAttribute('data-scrolling', '');
		await expect.element(scrollbarY()).toHaveAttribute('data-scrolling', '');
		await new Promise((resolve) => setTimeout(resolve, SCROLL_TIMEOUT + 40));
		await expect.element(viewport()).not.toHaveAttribute('data-scrolling');
	});

	it('ignores programmatic scrolls until the user interacts', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(root()).toHaveAttribute('data-has-overflow-y', '');
		host(viewport()).scrollTop = 20;
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(host(viewport()).hasAttribute('data-scrolling')).toBe(false);
	});

	it('treats a scroll in touch modality as user-driven', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(root()).toHaveAttribute('data-has-overflow-y', '');
		host(root()).dispatchEvent(pointer('pointerdown', { pointerType: 'touch' }));
		host(viewport()).scrollTop = 24;
		await expect.element(viewport()).toHaveAttribute('data-scrolling', '');
	});

	it('sets hovering for a mouse pointer and skips touch pointers', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(scrollbarY()).toBeInTheDocument();
		host(root()).dispatchEvent(pointer('pointermove', { pointerType: 'mouse' }));
		await expect.element(scrollbarY()).toHaveAttribute('data-hovering', '');
		host(root()).dispatchEvent(pointer('pointerleave', { bubbles: false }));
		await expect.element(scrollbarY()).not.toHaveAttribute('data-hovering');
		host(root()).dispatchEvent(pointer('pointermove', { pointerType: 'touch' }));
		expect(host(scrollbarY()).hasAttribute('data-hovering')).toBe(false);
	});

	it('scrolls when the track is pressed below the thumb', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(thumbY()).toBeInTheDocument();
		const track = host(scrollbarY());
		const thumb = host(thumbY());
		stubCapture(thumb);
		const rect = track.getBoundingClientRect();
		track.dispatchEvent(
			pointer('pointerdown', { clientX: rect.left + 2, clientY: rect.bottom - 2 })
		);
		expect(host(viewport()).scrollTop).toBeGreaterThan(0);
	});

	it('does not scroll when the press is on the thumb or a non-primary button', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(thumbY()).toBeInTheDocument();
		const before = host(viewport()).scrollTop;
		host(thumbY()).dispatchEvent(pointer('pointerdown', { button: 2, buttons: 2 }));
		expect(host(viewport()).scrollTop).toBe(before);
		const thumb = host(thumbY());
		stubCapture(thumb);
		const rect = thumb.getBoundingClientRect();
		host(scrollbarY()).dispatchEvent(
			pointer('pointerdown', { clientX: rect.left + 1, clientY: rect.top + 1 })
		);
		expect(host(viewport()).scrollTop).toBe(before);
	});

	it('skips the track handler when the consumer calls preventBaseUIHandler', async () => {
		render(ScrollAreaHarness, { scenario: 'prevent' });
		await expect.element(scrollbarY()).toBeInTheDocument();
		const track = host(scrollbarY());
		const rect = track.getBoundingClientRect();
		track.dispatchEvent(
			pointer('pointerdown', { clientX: rect.left + 2, clientY: rect.bottom - 2 })
		);
		expect(host(viewport()).scrollTop).toBe(0);
	});

	it('drags the thumb and restores scroll snap on release', async () => {
		render(ScrollAreaHarness, { scenario: 'snap' });
		await expect.element(thumbY()).toBeInTheDocument();
		const thumb = host(thumbY());
		const capture = stubCapture(thumb);
		expect(capture).toBeTruthy();
		thumb.dispatchEvent(pointer('pointerdown', { clientY: 0 }));
		expect(host(viewport()).style.scrollSnapType).toBe('none');
		thumb.dispatchEvent(pointer('pointermove', { clientY: 30, buttons: 1 }));
		expect(host(viewport()).scrollTop).toBeGreaterThan(0);
		thumb.dispatchEvent(pointer('pointerup', { buttons: 0 }));
		expect(host(viewport()).style.scrollSnapType).toBe('y mandatory');
		expect(host(viewport()).hasAttribute('data-scrolling')).toBe(false);
	});

	it('wheels the viewport from the scrollbar and chains at the start edge', async () => {
		render(ScrollAreaHarness, { scenario: 'both' });
		await expect.element(scrollbarY()).toBeInTheDocument();
		const track = host(scrollbarY());
		const consumed = new WheelEvent('wheel', {
			deltaY: 40,
			cancelable: true,
			bubbles: true
		});
		track.dispatchEvent(consumed);
		expect(consumed.defaultPrevented).toBe(true);
		expect(host(viewport()).scrollTop).toBeGreaterThan(0);

		host(viewport()).scrollTop = 0;
		const chained = new WheelEvent('wheel', { deltaY: -20, cancelable: true, bubbles: true });
		track.dispatchEvent(chained);
		expect(chained.defaultPrevented).toBe(false);
	});

	it('marks horizontal overflow edges in RTL and after a direction change', async () => {
		const rtl = render(ScrollAreaHarness, { scenario: 'rtl' });
		await expect.element(root()).toHaveAttribute('data-has-overflow-x', '');
		const element = host(viewport());
		element.scrollLeft = 0;
		await expect.element(root()).toHaveAttribute('data-overflow-x-end', '');
		expect(host(root()).hasAttribute('data-overflow-x-start')).toBe(false);
		rtl.unmount();

		const { unmount } = render(ScrollAreaHarness, { scenario: 'direction' });
		await expect.element(root()).toHaveAttribute('data-has-overflow-x', '');
		await page.getByRole('button', { name: 'Flip direction' }).click();
		await expect.element(root()).toHaveAttribute('style', expect.stringContaining('rtl'));
		unmount();
	});

	it('respects overflowEdgeThreshold', async () => {
		render(ScrollAreaHarness, { scenario: 'threshold' });
		await expect.element(root()).toHaveAttribute('data-overflow-y-end', '');
		await page.getByRole('button', { name: 'Raise threshold' }).click();
		await expect.element(root()).not.toHaveAttribute('data-overflow-y-end');
		await expect.element(root()).not.toHaveAttribute('data-overflow-y-start');
	});

	it('measures content mounted after the viewport', async () => {
		render(ScrollAreaHarness, { scenario: 'delayed' });
		await expect.element(viewport()).toHaveAttribute('tabindex', '-1');
		await page.getByRole('button', { name: 'Show content' }).click();
		await expect.element(root()).toHaveAttribute('data-has-overflow-y', '');
		await expect.element(page.getByTestId('content')).toHaveAttribute('data-has-overflow-y', '');
	});

	it('clears overflow when the content shrinks', async () => {
		render(ScrollAreaHarness, { scenario: 'shrink' });
		await expect.element(root()).toHaveAttribute('data-has-overflow-y', '');
		await page.getByRole('button', { name: 'Shrink' }).click();
		await expect.element(root()).not.toHaveAttribute('data-has-overflow-y');
		expect(page.getByTestId('corner').elements()).toHaveLength(0);
	});

	it('keeps the scrollbar mounted when asked and hides it until measured', async () => {
		render(ScrollAreaHarness, { scenario: 'keep' });
		await expect.element(scrollbarY()).toBeInTheDocument();
		await expect.element(viewport()).toHaveAttribute('tabindex', '-1');
	});

	it('passes props and state through a render snippet', async () => {
		render(ScrollAreaHarness, { scenario: 'custom' });
		await expect.element(root()).toHaveAttribute('data-rendered', 'true');
		await expect.element(root()).toHaveAttribute('data-overflow', 'yes');
		expect(host(root()).tagName).toBe('DIV');
	});

	it('puts the CSP nonce on the scrollbar style and skips that element when asked', async () => {
		const nonce = render(ScrollAreaCSPHarness, { nonce: 'area-nonce' });
		await expect.element(root()).toBeInTheDocument();
		const style = nonce.container.querySelector('style');
		expect(style?.textContent).toContain('base-ui-disable-scrollbar');
		expect(style?.nonce || style?.getAttribute('nonce')).toBe('area-nonce');
		nonce.unmount();

		const hidden = render(ScrollAreaCSPHarness, { disableStyleElements: true });
		await expect.element(root()).toBeInTheDocument();
		expect(hidden.container.querySelector('style')).toBeNull();
		hidden.unmount();
	});

	it('throws when a part is rendered outside its parent', async () => {
		await expect(async () => {
			render(ScrollAreaHarness, { scenario: 'orphan-viewport' });
		}).rejects.toThrow(/ScrollAreaRootContext is missing/);
		await expect(async () => {
			render(ScrollAreaHarness, { scenario: 'orphan-content' });
		}).rejects.toThrow(/ScrollAreaViewportContext missing/);
		await expect(async () => {
			render(ScrollAreaHarness, { scenario: 'orphan-thumb' });
		}).rejects.toThrow(/ScrollAreaScrollbarContext is missing/);
	});
});
