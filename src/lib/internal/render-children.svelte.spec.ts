// Native Svelte coverage for the third `render` argument.
// Upstream passes the same value as `props.children` from useRenderElement
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Children are a snippet here, so they are not on `props`.
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RenderChildrenHarness from '../../tests/RenderChildrenHarness.svelte';

const passthrough = [
	'button',
	'separator',
	'avatar-root',
	'avatar-fallback',
	'avatar-image',
	'accordion-root',
	'accordion-item',
	'accordion-header',
	'accordion-trigger',
	'accordion-panel',
	'checkbox-root',
	'checkbox-indicator',
	'checkbox-group',
	'collapsible-root',
	'collapsible-trigger',
	'collapsible-panel',
	'dialog-trigger',
	'dialog-close',
	'dialog-title',
	'dialog-description',
	'dialog-popup',
	'dialog-backdrop',
	'dialog-viewport',
	'field-root',
	'field-control',
	'field-label',
	'field-description',
	'field-item',
	'input',
	'fieldset-root',
	'fieldset-legend',
	'form',
	'meter-track',
	'meter-indicator',
	'meter-label',
	'number-field-root',
	'number-field-group',
	'number-field-input',
	'number-field-increment',
	'number-field-decrement',
	'number-field-scrub',
	'otp-root',
	'otp-input',
	'popover-trigger',
	'popover-close',
	'popover-title',
	'popover-description',
	'popover-backdrop',
	'popover-positioner',
	'popover-popup',
	'popover-arrow',
	'progress-track',
	'progress-indicator',
	'progress-label',
	'progress-value-indeterminate',
	'radio-root',
	'radio-indicator',
	'radio-group',
	'scroll-root',
	'scroll-viewport',
	'scroll-content',
	'scroll-scrollbar',
	'scroll-thumb',
	'scroll-corner',
	'slider-root',
	'slider-label',
	'slider-control',
	'slider-track',
	'slider-indicator',
	'switch-root',
	'switch-thumb',
	'tabs-root',
	'tabs-list',
	'tabs-tab',
	'tabs-panel',
	'tabs-indicator',
	'toggle',
	'toggle-group',
	'toolbar-root',
	'toolbar-button',
	'toolbar-group',
	'toolbar-link'
] as const;

/** Parts that add their own nodes, so `children` stays a snippet with an empty slot. */
const owned = [
	'meter-root',
	'meter-value',
	'progress-root',
	'progress-value',
	'slider-thumb',
	'slider-value',
	'popover-viewport',
	'field-error'
] as const;

function host() {
	return page.getByTestId('host');
}

async function mount(part: string, label?: string) {
	const view = render(RenderChildrenHarness, label === undefined ? { part } : { part, label });
	await expect.element(host()).toBeInTheDocument();
	return view;
}

describe('render children', () => {
	it('gives the Button anchor snippet its label', async () => {
		render(RenderChildrenHarness, { part: 'button-anchor' });
		const link = host();

		await expect.element(link).toHaveTextContent('Create project');
		await expect.element(link).toHaveAttribute('data-kind', 'snippet');
		await expect.element(link).toHaveAttribute('href', '#');
		expect(link.element().tagName).toBe('A');
	});

	it('passes consumer children through every passthrough part', async () => {
		for (const part of passthrough) {
			const view = await mount(part, 'Label');
			try {
				await expect.element(host()).toHaveAttribute('data-kind', 'snippet');
				await expect.element(host()).toHaveTextContent('Label');
			} catch (error) {
				throw new Error(`${part} dropped its children`, { cause: error });
			} finally {
				view.unmount();
			}
		}
	});

	it('passes undefined when a passthrough part has no children', async () => {
		for (const part of passthrough) {
			const view = await mount(part);
			try {
				await expect.element(host()).toHaveAttribute('data-kind', 'undefined');
				expect(host().element().textContent ?? '').not.toContain('Label');
			} catch (error) {
				throw new Error(`${part} passed children it did not have`, { cause: error });
			} finally {
				view.unmount();
			}
		}
	});

	it('keeps injected content when the consumer passed no children', async () => {
		for (const part of owned) {
			const view = await mount(part);
			try {
				await expect.element(host()).toHaveAttribute('data-kind', 'snippet');
				const node = host().element();
				if (part === 'meter-root' || part === 'progress-root') {
					expect(node.textContent).toContain('x');
				}
				if (part === 'slider-thumb') {
					expect(node.querySelector('input')).toBeTruthy();
				}
				if (part === 'popover-viewport') {
					expect(node.querySelector('[data-current]')).toBeTruthy();
				}
				if (part === 'meter-value' || part === 'progress-value' || part === 'slider-value') {
					expect((node.textContent ?? '').trim().length).toBeGreaterThan(0);
				}
			} catch (error) {
				throw new Error(`${part} dropped its own content`, { cause: error });
			} finally {
				view.unmount();
			}
		}
	});

	it('includes consumer children in injected content', async () => {
		for (const part of owned) {
			const view = await mount(part, 'Label');
			try {
				await expect.element(host()).toHaveAttribute('data-kind', 'snippet');
				await expect.element(host()).toHaveTextContent('Label');
			} catch (error) {
				throw new Error(`${part} dropped consumer children`, { cause: error });
			} finally {
				view.unmount();
			}
		}
	});

	describe('number field scrub cursor', () => {
		let lock: { mockRestore: () => void };

		afterEach(() => {
			lock?.mockRestore();
		});

		async function scrub() {
			lock = vi
				.spyOn(Element.prototype, 'requestPointerLock')
				.mockResolvedValue(undefined as never);
			const area = page.getByTestId('scrub').element();
			area.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					cancelable: true,
					pointerType: 'mouse',
					clientX: 20,
					clientY: 20
				})
			);
		}

		it('passes the label while scrubbing', async () => {
			const view = render(RenderChildrenHarness, {
				part: 'number-field-scrub-cursor',
				label: 'Label'
			});
			await scrub();
			try {
				await expect.element(host()).toHaveAttribute('data-kind', 'snippet');
				await expect.element(host()).toHaveTextContent('Label');
			} finally {
				view.unmount();
			}
		});

		it('passes undefined while scrubbing when there are no children', async () => {
			const view = render(RenderChildrenHarness, { part: 'number-field-scrub-cursor' });
			await scrub();
			try {
				await expect.element(host()).toHaveAttribute('data-kind', 'undefined');
			} finally {
				view.unmount();
			}
		});
	});
});
