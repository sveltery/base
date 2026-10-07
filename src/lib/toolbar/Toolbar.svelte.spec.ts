// Assertions follow Base UI v1.8.0 packages/react/src/toolbar/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, Toolbar.Input, and rendering Menu, Dialog, Select, Popover,
// Switch, or ToggleGroup are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ToolbarButton from './ToolbarButton.svelte';
import ToolbarGroup from './ToolbarGroup.svelte';
import ToolbarLink from './ToolbarLink.svelte';
import ToolbarHarness from '../../tests/ToolbarHarness.svelte';

function button(name: string) {
	return page.getByRole('button', { name, exact: true });
}

async function focus(name: string) {
	(button(name).element() as HTMLElement).focus();
}

describe('<Toolbar.Root />', () => {
	it('has role="toolbar"', async () => {
		render(ToolbarHarness, { scenario: 'keyboard' });
		const toolbar = page.getByRole('toolbar', { name: 'Tools' });
		await expect.element(toolbar).toHaveAttribute('role', 'toolbar');
		await expect.element(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
		await expect.element(toolbar).toHaveAttribute('data-orientation', 'horizontal');
	});

	describe('keyboard navigation', () => {
		it.each([
			['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft'],
			['ltr', 'vertical', 'ArrowDown', 'ArrowUp'],
			['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight'],
			['rtl', 'vertical', 'ArrowDown', 'ArrowUp']
		] as const)('%s %s', async (dir, orientation, nextKey, prevKey) => {
			render(ToolbarHarness, { scenario: 'keyboard', dir, orientation });
			const one = button('One');
			const two = button('Two');
			const three = button('Three');
			const link = page.getByRole('link', { name: 'Link' });

			await focus('One');
			expect(document.activeElement).toBe(one.element());

			await userEvent.keyboard(`{${nextKey}}`);
			await expect.element(link).toHaveFocus();

			await userEvent.keyboard(`{${nextKey}}`);
			await expect.element(two).toHaveFocus();

			await userEvent.keyboard(`{${nextKey}}`);
			await expect.element(three).toHaveFocus();

			await userEvent.keyboard(`{${nextKey}}`);
			await expect.element(one).toHaveFocus();

			await userEvent.keyboard(`{${prevKey}}`);
			await expect.element(three).toHaveFocus();
		});

		it('does not wrap focus when loopFocus is false', async () => {
			render(ToolbarHarness, { scenario: 'keyboard', loopFocus: false });
			await focus('One');
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(button('One')).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(page.getByRole('link', { name: 'Link' })).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(button('Two')).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(button('Three')).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(button('Three')).toHaveFocus();
		});

		it('leaves Home and End to the browser', async () => {
			render(ToolbarHarness, { scenario: 'keyboard' });
			await focus('One');
			await userEvent.keyboard('{End}');
			await expect.element(button('One')).toHaveFocus();
			await userEvent.keyboard('{Home}');
			await expect.element(button('One')).toHaveFocus();
		});

		it('ignores the other axis and modified arrows', async () => {
			render(ToolbarHarness, { scenario: 'keyboard' });
			await focus('One');
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(button('One')).toHaveFocus();
			await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
			await expect.element(button('One')).toHaveFocus();
		});
	});

	describe('prop: disabled', () => {
		it('disables all toolbar buttons except links', async () => {
			render(ToolbarHarness, { scenario: 'disabled-root' });

			for (const name of ['One', 'Two']) {
				const item = button(name);
				await expect.element(item).toHaveAttribute('aria-disabled', 'true');
				await expect.element(item).toHaveAttribute('data-disabled', '');
				await expect.element(item).not.toHaveAttribute('disabled');
			}

			await expect.element(page.getByRole('group')).toHaveAttribute('data-disabled', '');

			for (const name of ['Link', 'Docs']) {
				const link = page.getByRole('link', { name });
				await expect.element(link).not.toHaveAttribute('data-disabled');
				await expect.element(link).not.toHaveAttribute('aria-disabled');
			}
		});
	});

	describe('prop: focusableWhenDisabled', () => {
		it('toolbar items can be focused when disabled by default', async () => {
			render(ToolbarHarness, { scenario: 'focusable' });
			const one = button('One');
			const two = button('Two');
			const three = button('Three');

			for (const item of [one, two, three]) {
				await expect.element(item).not.toHaveAttribute('disabled');
				await expect.element(item).toHaveAttribute('data-disabled', '');
				await expect.element(item).toHaveAttribute('data-focusable', '');
			}

			await focus('One');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(two).toHaveFocus();
			await expect.element(two).toHaveAttribute('aria-disabled', 'true');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(three).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(one).toHaveAttribute('tabindex', '0');
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(three).toHaveFocus();
		});

		it('can individually disable focusableWhenDisabled', async () => {
			render(ToolbarHarness, { scenario: 'skip-one' });
			const one = button('One');
			const two = button('Two');
			const three = button('Three');

			await expect.element(three).toHaveAttribute('disabled');
			await expect.element(three).not.toHaveAttribute('aria-disabled');
			await expect.element(one).not.toHaveAttribute('disabled');
			await expect.element(two).not.toHaveAttribute('disabled');

			await focus('One');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(two).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(one).toHaveFocus();
			await expect.element(one).toHaveAttribute('tabindex', '0');
		});

		it('moves the initial tab stop off a disabled, non-focusable first item', async () => {
			render(ToolbarHarness, { scenario: 'skip-first' });
			const one = button('One');
			const two = button('Two');
			const three = button('Three');

			await expect.element(one).toHaveAttribute('disabled');
			await expect.element(one).not.toHaveAttribute('tabindex', '0');
			await expect.element(two).toHaveAttribute('tabindex', '0');

			await focus('Two');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(three).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(two).toHaveFocus();
		});

		it('keeps an enabled item with focusableWhenDisabled={false} navigable', async () => {
			render(ToolbarHarness, { scenario: 'flag-only' });
			const two = button('Two');
			await expect.element(two).not.toHaveAttribute('disabled');

			await focus('One');
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(two).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(button('Three')).toHaveFocus();
		});
	});
});

describe('<Toolbar.Button />', () => {
	it('renders a button', async () => {
		render(ToolbarHarness, { scenario: 'activate' });
		expect(button('One').element().tagName).toBe('BUTTON');
		await expect.element(button('One')).toHaveAttribute('type', 'button');
		await expect.element(button('One')).toHaveAttribute('data-orientation', 'horizontal');
		await expect.element(button('One')).toHaveAttribute('data-focusable', '');
	});

	describe('prop: nativeButton', () => {
		it('custom element: dispatches one click from Space and from Enter', async () => {
			const handleClick = vi.fn();
			const handleRenderClick = vi.fn();
			const handleCaptureClick = vi.fn();
			const handleAncestorClick = vi.fn();
			render(ToolbarHarness, {
				scenario: 'custom',
				onclick: handleClick,
				onrender: handleRenderClick,
				oncapture: handleCaptureClick,
				onancestor: handleAncestorClick
			});
			const save = page.getByRole('button', { name: 'Save' });
			expect(save.element().tagName).toBe('SPAN');
			(save.element() as HTMLElement).focus();

			await userEvent.keyboard('{Space}');
			expect(handleCaptureClick).toHaveBeenCalledTimes(1);
			expect(handleRenderClick).toHaveBeenCalledTimes(1);
			expect(handleClick).toHaveBeenCalledTimes(1);
			expect(handleAncestorClick).toHaveBeenCalledTimes(1);

			await userEvent.keyboard('{Enter}');
			expect(handleCaptureClick).toHaveBeenCalledTimes(2);
			expect(handleRenderClick).toHaveBeenCalledTimes(2);
			expect(handleClick).toHaveBeenCalledTimes(2);
			expect(handleAncestorClick).toHaveBeenCalledTimes(2);
		});
	});

	describe('prop: disabled', () => {
		it('disables the button without the disabled attribute', async () => {
			const handleClick = vi.fn();
			const handleMouseDown = vi.fn();
			const handlePointerDown = vi.fn();
			const handleKeyDown = vi.fn();
			render(ToolbarHarness, {
				scenario: 'blocked',
				onclick: handleClick,
				onmousedown: handleMouseDown,
				onpointerdown: handlePointerDown,
				onkeydown: handleKeyDown
			});
			const item = page.getByRole('button');

			await expect.element(item).not.toHaveAttribute('disabled');
			await expect.element(item).toHaveAttribute('data-disabled', '');
			await expect.element(item).toHaveAttribute('aria-disabled', 'true');
			await expect.element(item).toHaveAttribute('data-focusable', '');

			const host = item.element() as HTMLElement;
			host.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
			host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
			host.click();
			host.focus();
			await userEvent.keyboard('{Space}');
			await userEvent.keyboard('{Enter}');

			expect(handleClick).not.toHaveBeenCalled();
			expect(handleMouseDown).not.toHaveBeenCalled();
			expect(handlePointerDown).not.toHaveBeenCalled();
			expect(handleKeyDown).not.toHaveBeenCalled();
		});

		it('uses the disabled attribute when focusableWhenDisabled is false', async () => {
			render(ToolbarHarness, { scenario: 'skip-first' });
			const one = button('One');
			await expect.element(one).toHaveAttribute('disabled');
			await expect.element(one).toHaveAttribute('data-disabled', '');
			await expect.element(one).not.toHaveAttribute('aria-disabled');
			await expect.element(one).not.toHaveAttribute('data-focusable');
		});

		it('allows hover handlers while blocking activation', async () => {
			const handleClick = vi.fn();
			const handleMouseMove = vi.fn();
			render(ToolbarHarness, {
				scenario: 'hover',
				onclick: handleClick,
				onmousemove: handleMouseMove
			});
			const item = page.getByRole('button');
			await userEvent.hover(item);
			expect(handleMouseMove).toHaveBeenCalled();
			(item.element() as HTMLElement).click();
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	it('throws a descriptive error when rendered outside Toolbar.Root', () => {
		expect(() => render(ToolbarButton)).toThrow(
			'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.'
		);
	});
});

describe('<Toolbar.Group />', () => {
	it('renders a group', async () => {
		render(ToolbarHarness, { scenario: 'keyboard' });
		await expect.element(page.getByRole('group')).toBeVisible();
		await expect.element(page.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');
	});

	it('disables buttons in the group except links', async () => {
		render(ToolbarHarness, { scenario: 'group-disabled' });
		await expect.element(button('One')).toHaveAttribute('aria-disabled', 'true');
		await expect.element(button('One')).toHaveAttribute('data-disabled', '');
		await expect.element(page.getByRole('group')).toHaveAttribute('data-disabled', '');
		const link = page.getByRole('link', { name: 'Link' });
		await expect.element(link).not.toHaveAttribute('data-disabled');
		await expect.element(link).not.toHaveAttribute('aria-disabled');
	});

	it('throws a descriptive error when rendered outside Toolbar.Root', () => {
		expect(() => render(ToolbarGroup)).toThrow(
			'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.'
		);
	});
});

describe('<Toolbar.Link />', () => {
	it('renders an anchor', async () => {
		render(ToolbarHarness, { scenario: 'link' });
		const link = page.getByTestId('link');
		expect(link.element().tagName).toBe('A');
		await expect.element(link).toHaveAttribute('href', 'https://base-ui.com');
		await expect.element(link).toHaveAttribute('data-orientation', 'horizontal');
		await expect.element(page.getByRole('link')).toBeVisible();
	});

	it('throws a descriptive error when rendered outside Toolbar.Root', () => {
		expect(() => render(ToolbarLink)).toThrow(
			'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.'
		);
	});
});

describe('native Svelte', () => {
	it('activates a native button once from Space, Enter, and click', async () => {
		render(ToolbarHarness, { scenario: 'activate' });
		await focus('One');
		await userEvent.keyboard('{Space}');
		await expect.element(page.getByTestId('clicks')).toHaveTextContent('1');
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByTestId('clicks')).toHaveTextContent('2');
		await button('One').click();
		await expect.element(page.getByTestId('clicks')).toHaveTextContent('3');

		(button('Two').element() as HTMLElement).focus();
		await userEvent.keyboard('{Space}');
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByTestId('clicks')).toHaveTextContent('3');
	});

	it('render snippet receives props and state', async () => {
		render(ToolbarHarness, { scenario: 'render' });
		const root = page.getByTestId('custom-root');
		const item = page.getByTestId('custom-button');
		await expect.element(root).toHaveAttribute('role', 'toolbar');
		await expect.element(root).toHaveAttribute('data-orientation-state', 'horizontal');
		await expect.element(item).toHaveAttribute('data-focusable-state', 'yes');
		await expect.element(item).toHaveAttribute('tabindex', '0');
	});

	it('passes consumer attachments to the toolbar', async () => {
		render(ToolbarHarness, { scenario: 'attach' });
		await expect.element(page.getByTestId('host')).toHaveTextContent('root-host');
	});

	it('preventDefault on the toolbar skips arrows, and on a button does not', async () => {
		render(ToolbarHarness, { scenario: 'keyboard', veto: 'root' });
		await focus('One');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(button('One')).toHaveFocus();
	});

	it('preventDefault on a button does not skip toolbar arrows', async () => {
		render(ToolbarHarness, { scenario: 'keyboard', veto: 'child' });
		await focus('One');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('link', { name: 'Link' })).toHaveFocus();
	});
});
