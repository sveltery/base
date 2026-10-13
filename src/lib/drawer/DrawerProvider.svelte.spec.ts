// Assertions follow Base UI v1.9.0 packages/react/src/drawer/provider/DrawerProvider.test.tsx,
// indent/DrawerIndent.test.tsx, indent-background/DrawerIndentBackground.test.tsx, and
// content/DrawerContent.test.tsx (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the garbage-collection check (jsdom only, it needs Node's V8 flags) and
// describeConformance, which no spec in this port runs.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DrawerProviderHarness from '../../tests/DrawerProviderHarness.svelte';

function testId(id: string) {
	return page.getByTestId(id);
}

async function press(name: string) {
	await page.getByRole('button', { name, exact: true }).click();
}

describe('Drawer.Provider', () => {
	it('stays active until every open drawer is closed or removed', async () => {
		const screen = render(DrawerProviderHarness, { scenario: 'multiple' });
		const background = testId('background');

		await expect.element(background).toHaveAttribute('data-inactive', '');

		await screen.rerender({ firstOpen: true, secondOpen: false, showSecond: true });
		await expect.element(background).toHaveAttribute('data-active', '');

		await screen.rerender({ firstOpen: false, secondOpen: true, showSecond: true });
		await expect.element(background).toHaveAttribute('data-active', '');

		await screen.rerender({ firstOpen: false, secondOpen: true, showSecond: false });
		await expect.element(background).toHaveAttribute('data-inactive', '');
	});

	it('ignores redundant registry updates without disturbing active state', async () => {
		render(DrawerProviderHarness, { scenario: 'controls' });
		const background = testId('background');

		await press('Register open');
		await expect.element(background).toHaveAttribute('data-active', '');

		await press('Register open');
		await press('Remove missing');
		await expect.element(background).toHaveAttribute('data-active', '');

		await press('Register closed');
		await expect.element(background).toHaveAttribute('data-inactive', '');

		await press('Remove registered');
		await press('Remove registered');
		await expect.element(background).toHaveAttribute('data-inactive', '');
	});

	it('synchronizes and restores visual state on Drawer.Indent', async () => {
		const screen = render(DrawerProviderHarness, { scenario: 'visual' });
		const indent = testId('indent').element() as HTMLElement;
		const variable = (name: string) => indent.style.getPropertyValue(name);

		await press('Set visual state');
		expect(variable('--drawer-swipe-progress')).toBe('0.5');
		expect(variable('--drawer-height')).toBe('120px');

		await press('Clear progress');
		expect(variable('--drawer-swipe-progress')).toBe('0');
		expect(variable('--drawer-height')).toBe('120px');

		await press('Clear height');
		expect(variable('--drawer-height')).toBe('');

		await press('Set invalid visual state');
		expect(variable('--drawer-swipe-progress')).toBe('0');
		expect(variable('--drawer-height')).toBe('');

		await press('Set visual state');
		await screen.rerender({ showIndent: false });
		expect(variable('--drawer-swipe-progress')).toBe('0');
		expect(variable('--drawer-height')).toBe('');
	});

	it('allows indent parts to render without a provider', async () => {
		render(DrawerProviderHarness, { scenario: 'no-provider' });

		await expect.element(testId('indent')).toHaveAttribute('data-inactive', '');
		await expect.element(testId('background')).toHaveAttribute('data-inactive', '');
	});
});

describe('Drawer.Indent', () => {
	it('sets data-active when any drawer is open', async () => {
		const screen = render(DrawerProviderHarness, { scenario: 'indent', open: false });

		await expect.element(testId('indent')).toHaveAttribute('data-inactive', '');
		await expect.element(testId('indent')).not.toHaveAttribute('data-active');

		await screen.rerender({ open: true });

		await expect.element(testId('indent')).toHaveAttribute('data-active', '');
		await expect.element(testId('indent')).not.toHaveAttribute('data-inactive');
		await expect.element(testId('bg')).toHaveAttribute('data-active', '');
	});
});

describe('Drawer.IndentBackground', () => {
	it('sets data-active when any drawer is open', async () => {
		const screen = render(DrawerProviderHarness, { scenario: 'background', open: false });
		const background = testId('bg').element();

		expect(background.getAttribute('data-inactive')).toBe('');
		expect(background.getAttribute('data-active')).toBeNull();

		await screen.rerender({ open: true });

		await expect.element(testId('bg')).toHaveAttribute('data-active', '');
		expect(background.getAttribute('data-inactive')).toBeNull();
	});
});

describe('Drawer.Content', () => {
	it('does not add public swipe-ignore attributes', async () => {
		render(DrawerProviderHarness, { scenario: 'content' });

		await expect.element(testId('content')).toBeInTheDocument();
		await expect.element(testId('content')).not.toHaveAttribute('data-swipe-ignore');
		await expect.element(testId('content')).not.toHaveAttribute('data-base-ui-swipe-ignore');
	});
});
