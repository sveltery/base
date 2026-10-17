// Base UI v1.9.0 packages/react/src/csp-provider/CSPProvider.test.tsx checks the same style element.
// React 19 hoists it into the head, keyed by its href, and never removes it.
import { flushSync, mount, unmount } from 'svelte';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DisableScrollbarStyleHarness from '../../tests/DisableScrollbarStyleHarness.svelte';

function scrollbarStyles(root: ParentNode = document) {
	return Array.from(root.querySelectorAll('style')).filter((style) =>
		style.textContent?.includes('.base-ui-disable-scrollbar')
	);
}

describe('scrollbar-hiding style', () => {
	beforeEach(() => {
		for (const style of scrollbarStyles()) style.remove();
	});

	it('renders one copy in the head for every ScrollArea and open Select', async () => {
		render(DisableScrollbarStyleHarness, { areas: 3, select: true });
		await expect.element(page.getByTestId('popup')).toBeInTheDocument();

		const styles = scrollbarStyles();
		expect(styles).toHaveLength(1);
		expect(styles[0].parentElement).toBe(document.head);
	});

	it('hides the viewport scrollbar', async () => {
		render(DisableScrollbarStyleHarness);
		await expect.element(page.getByTestId('area-0')).toBeInTheDocument();

		const viewport = page.getByTestId('area-0').element().firstElementChild as HTMLElement;
		expect(getComputedStyle(viewport).scrollbarWidth).toBe('none');
	});

	it('carries the CSP nonce', async () => {
		render(DisableScrollbarStyleHarness, { nonce: 'test-nonce' });
		await expect.element(page.getByTestId('area-0')).toBeInTheDocument();

		expect(scrollbarStyles()[0]).toHaveAttribute('nonce', 'test-nonce');
	});

	it('renders nothing when disableStyleElements is true', async () => {
		render(DisableScrollbarStyleHarness, { disableStyleElements: true, select: true });
		await expect.element(page.getByTestId('popup')).toBeInTheDocument();

		expect(scrollbarStyles()).toHaveLength(0);
	});

	it('keeps the style while another instance needs it', async () => {
		const screen = render(DisableScrollbarStyleHarness, { areas: 2 });
		await expect.element(page.getByTestId('area-1')).toBeInTheDocument();

		await screen.rerender({ areas: 1 });
		await expect.element(page.getByTestId('area-1')).not.toBeInTheDocument();

		expect(scrollbarStyles()).toHaveLength(1);
		const viewport = page.getByTestId('area-0').element().firstElementChild as HTMLElement;
		expect(getComputedStyle(viewport).scrollbarWidth).toBe('none');
	});

	it('goes after existing precedence styles, as React orders them', async () => {
		const other = document.createElement('style');
		other.dataset.precedence = 'app';
		document.head.append(other);
		render(DisableScrollbarStyleHarness);
		await expect.element(page.getByTestId('area-0')).toBeInTheDocument();

		expect(other.nextElementSibling).toBe(scrollbarStyles()[0]);
		other.remove();
	});

	it('renders into the shadow root a ScrollArea mounts in', () => {
		const host = document.createElement('div');
		document.body.append(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const app = mount(DisableScrollbarStyleHarness, { target: shadow });
		flushSync();

		const viewport = shadow.querySelector('[data-testid="area-0"]')!.firstElementChild!;
		expect(scrollbarStyles(shadow)).toHaveLength(1);
		expect(getComputedStyle(viewport).scrollbarWidth).toBe('none');
		unmount(app);
		host.remove();
	});
});
