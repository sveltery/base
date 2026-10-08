// Assertions follow Base UI v1.8.0 packages/react/src/collapsible/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, className/style callbacks, and React.Activity are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CollapsibleAttachHarness from '../../tests/CollapsibleAttachHarness.svelte';
import CollapsibleBindHarness from '../../tests/CollapsibleBindHarness.svelte';
import CollapsibleHarness from '../../tests/CollapsibleHarness.svelte';
import { controllableRootCases } from '../../tests/controllable-root-cases.js';
import { Collapsible } from './index.js';
import { REASONS } from '../internal/event-details.js';

const PANEL_CONTENT = 'This is panel content';

const TRANSITION_CSS = `
	.transition-test-panel {
		overflow: hidden;
		height: var(--collapsible-panel-height);
		transition: height 100ms linear;
	}
	.transition-test-panel[data-starting-style],
	.transition-test-panel[data-ending-style] {
		height: 0;
	}
`;

const CLOSE_TRANSITION_CSS = `
	.transition-test-panel {
		overflow: hidden;
		height: var(--collapsible-panel-height);
		transition: height 100ms linear;
	}
	.transition-test-panel[data-ending-style] {
		height: 0;
	}
`;

async function frames(count = 1) {
	for (let index = 0; index < count; index += 1) {
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}
	await tick();
}

describe('Collapsible', () => {
	describe('ARIA attributes', () => {
		it('sets ARIA attributes', async () => {
			render(CollapsibleHarness, { open: true });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const panel = page.getByTestId('panel');

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger).toHaveAttribute('aria-controls', panel.element().id);
			expect(panel.element().id).toMatch(/^base-ui-/);
		});

		it('references a manual panel id in trigger aria-controls', async () => {
			render(CollapsibleHarness, { open: true, panelId: 'custom-panel-id' });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const panel = page.getByTestId('panel');

			await expect.element(trigger).toHaveAttribute('aria-controls', 'custom-panel-id');
			await expect.element(panel).toHaveAttribute('id', 'custom-panel-id');
		});

		it('unregisters and restores the generated panel id when the panel remounts', async () => {
			const view = render(CollapsibleHarness, { open: true });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const panel = page.getByTestId('panel');
			const id = panel.element().id;

			await expect.element(trigger).toHaveAttribute('aria-controls', id);

			await view.rerender({ open: true, showPanel: false });
			await expect.element(trigger).not.toHaveAttribute('aria-controls');

			await view.rerender({ open: true, showPanel: true });
			await expect
				.element(trigger)
				.toHaveAttribute('aria-controls', page.getByTestId('panel').element().id);
		});
	});

	describe('disabled', () => {
		it('sets data-disabled and stays focusable', async () => {
			render(CollapsibleHarness, { disabled: true });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const root = trigger.element().parentElement as HTMLElement;

			await expect.element(trigger).toHaveAttribute('data-disabled', '');
			await expect.element(trigger).toHaveAttribute('aria-disabled', 'true');
			await expect.element(trigger).not.toHaveAttribute('disabled');
			expect(root).toHaveAttribute('data-disabled', '');
			trigger.element().focus();
			expect(document.activeElement).toBe(trigger.element());
		});

		it('does not toggle or call onOpenChange when clicked while disabled', async () => {
			const handleOpenChange = vi.fn();
			render(CollapsibleHarness, { disabled: true, onOpenChange: handleOpenChange });
			const trigger = page.getByRole('button', { name: 'Trigger' });

			(trigger.element() as HTMLButtonElement).click();
			await tick();

			expect(handleOpenChange).not.toHaveBeenCalled();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
		});

		it.each(['Enter', ' '])('does not toggle on %s while disabled', async (keyName) => {
			const handleOpenChange = vi.fn();
			render(CollapsibleHarness, { disabled: true, onOpenChange: handleOpenChange });
			const trigger = page.getByRole('button', { name: 'Trigger' });

			trigger.element().focus();
			await userEvent.keyboard(keyName === ' ' ? '{Space}' : '{Enter}');

			expect(handleOpenChange).not.toHaveBeenCalled();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
		});
	});

	describe('onOpenChange', () => {
		it('calls onOpenChange with trigger-press details', async () => {
			const handleOpenChange = vi.fn();
			render(CollapsibleHarness, { onOpenChange: handleOpenChange });

			await page.getByRole('button', { name: 'Trigger' }).click();

			expect(handleOpenChange).toHaveBeenCalledTimes(1);
			const [openArg, details] = handleOpenChange.mock.calls[0];
			expect(openArg).toBe(true);
			expect(details.reason).toBe(REASONS.triggerPress);
			expect(details.event).toBeInstanceOf(MouseEvent);
			expect(details.isCanceled).toBe(false);
			expect(typeof details.cancel).toBe('function');
			expect(typeof details.allowPropagation).toBe('function');
		});

		it('cancel prevents opening', async () => {
			render(CollapsibleHarness, {
				onOpenChange: (_open, details) => details.cancel()
			});
			const trigger = page.getByRole('button', { name: 'Trigger' });

			await trigger.click();

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
		});

		it('cancel prevents closing', async () => {
			render(CollapsibleHarness, {
				open: true,
				onOpenChange: (_open, details) => details.cancel()
			});
			const trigger = page.getByRole('button', { name: 'Trigger' });

			await trigger.click();

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByText(PANEL_CONTENT)).toBeVisible();
		});
	});

	describe('open state', () => {
		it('opens and closes from the trigger', async () => {
			render(CollapsibleHarness);
			const trigger = page.getByRole('button', { name: 'Trigger' });

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect.element(trigger).not.toHaveAttribute('aria-controls');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);

			await trigger.click();

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(trigger).toHaveAttribute('data-panel-open', '');
			await expect.element(page.getByTestId('panel')).toHaveAttribute('data-open', '');
			await expect.element(page.getByText(PANEL_CONTENT)).toBeVisible();

			await trigger.click();
			await frames(2);

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect.element(trigger).not.toHaveAttribute('aria-controls');
			await expect.element(trigger).not.toHaveAttribute('data-panel-open');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
		});

		it.each(['Enter', ' '])('toggles with %s', async (keyName) => {
			render(CollapsibleHarness);
			const trigger = page.getByRole('button', { name: 'Trigger' });
			trigger.element().focus();
			await userEvent.keyboard(keyName === ' ' ? '{Space}' : '{Enter}');

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByText(PANEL_CONTENT)).toBeVisible();

			await userEvent.keyboard(keyName === ' ' ? '{Space}' : '{Enter}');
			await frames(2);

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
		});

		it('forwards the trigger id', async () => {
			render(CollapsibleHarness, { triggerId: 'custom-trigger-id' });
			await expect
				.element(page.getByRole('button', { name: 'Trigger' }))
				.toHaveAttribute('id', 'custom-trigger-id');
		});
	});

	describe('prop: keepMounted', () => {
		it('does not unmount the panel when true', async () => {
			render(CollapsibleHarness, { keepMounted: true });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const panel = page.getByTestId('panel');

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect.element(panel).not.toBeVisible();
			await expect.element(panel).toHaveAttribute('data-closed', '');
			await expect.element(panel).toHaveAttribute('hidden');

			await trigger.click();
			await tick();

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			expect(trigger.element().getAttribute('aria-controls')).toBe(panel.element().id);
			await expect.element(panel).toBeVisible();
			await expect.element(panel).toHaveAttribute('data-open', '');
			await expect.element(trigger).toHaveAttribute('data-panel-open', '');

			await trigger.click();
			await frames(2);

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			expect(trigger.element().getAttribute('aria-controls')).toBe(null);
			await expect.element(panel).not.toBeVisible();
			await expect.element(panel).toHaveAttribute('data-closed', '');
		});

		it('hides the panel after an external close when no animation is applied', async () => {
			render(CollapsibleHarness, { keepMounted: true, external: true });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const external = page.getByRole('button', { name: 'toggle externally' });
			const panel = page.getByTestId('panel');

			await expect.element(panel).toHaveAttribute('hidden');
			await expect.element(panel).toHaveAttribute('data-closed', '');
			await expect.element(panel).not.toHaveAttribute('data-ending-style');

			await external.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(panel).not.toHaveAttribute('hidden');
			await expect.element(panel).toHaveAttribute('data-open', '');

			await external.click();
			await frames(2);

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect.element(panel).toHaveAttribute('hidden');
			await expect.element(panel).toHaveAttribute('data-closed', '');
			await expect.element(panel).not.toHaveAttribute('data-ending-style');
		});
	});

	it('unmounts a panel that mounts after close has entered the ending phase', async () => {
		render(CollapsibleHarness, { open: true, hideUnlessEnding: true, recordStatuses: true });
		await page.getByRole('button', { name: 'Trigger' }).click();
		await frames(2);

		const statuses = JSON.parse(
			page.getByTestId('statuses').element().textContent ?? '[]'
		) as string[];
		expect(statuses).toContain('ending');
		expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
	});

	describe('CSS transitions', () => {
		it('applies data-starting-style while opening', async () => {
			render(CollapsibleHarness, { css: TRANSITION_CSS, panelClass: 'transition-test-panel' });
			const trigger = page.getByRole('button', { name: 'Trigger' });
			let sawStarting = false;
			const observer = new MutationObserver(() => {
				const panel = document.querySelector('[data-testid="panel"]');
				if (panel?.hasAttribute('data-starting-style')) sawStarting = true;
			});
			observer.observe(document.body, {
				attributes: true,
				childList: true,
				subtree: true
			});

			(trigger.element() as HTMLElement).click();
			await tick();
			observer.disconnect();

			const panel = page.getByTestId('panel');
			expect(sawStarting || panel.element().hasAttribute('data-starting-style')).toBe(true);
			await expect.element(panel).toHaveAttribute('data-open', '');
		});

		it('restores a measured height before applying closing transition styles', async () => {
			render(CollapsibleHarness, {
				open: true,
				css: CLOSE_TRANSITION_CSS,
				panelClass: 'transition-test-panel'
			});
			const panel = page.getByTestId('panel');

			await expect
				.poll(() => panel.element().style.getPropertyValue('--collapsible-panel-height'))
				.toBe('auto');

			await page.getByRole('button', { name: 'Trigger' }).click();

			await expect.poll(() => panel.element().hasAttribute('data-ending-style')).toBe(true);
			expect(panel.element().style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/);
		});

		it('unmounts a zero-size panel without waiting for unrelated transitions', async () => {
			render(CollapsibleHarness, {
				open: true,
				content: '',
				css: `
					.zero-size-panel {
						overflow: hidden;
						width: 0;
						height: 0;
						opacity: 1;
						transition: opacity 10s linear;
					}
					.zero-size-panel[data-ending-style] { opacity: 0; }
				`,
				panelClass: 'zero-size-panel'
			});

			await expect.element(page.getByTestId('panel')).toHaveAttribute('data-open', '');
			await page.getByRole('button', { name: 'Trigger' }).click();
			await frames(2);

			expect(page.getByTestId('panel').elements()).toHaveLength(0);
		});

		it('supports removing the rendered panel as it closes', async () => {
			const onOpenChange = vi.fn();
			render(CollapsibleHarness, {
				open: true,
				removeWhenClosed: true,
				panelStyle: 'transition: height 100ms linear',
				onOpenChange
			});

			await expect.element(page.getByText(PANEL_CONTENT)).toHaveAttribute('data-open', '');
			await page.getByRole('button', { name: 'Trigger' }).click();
			await frames(2);

			await expect
				.element(page.getByRole('button', { name: 'Trigger' }))
				.toHaveAttribute('aria-expanded', 'false');
			expect(page.getByText(PANEL_CONTENT).elements()).toHaveLength(0);
			expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
		});

		it('preserves inline alignment styles while measuring an opening panel', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				render(CollapsibleHarness, {
					keepMounted: true,
					panelStyle: 'justify-content: center',
					panelClass: 'mixed-motion-panel',
					css: `
						@keyframes panel-fade-in { from { opacity: 0; } to { opacity: 1; } }
						.mixed-motion-panel {
							height: var(--collapsible-panel-height);
							transition: height 100ms linear;
							animation: panel-fade-in 100ms linear;
						}
						.mixed-motion-panel[data-starting-style] { height: 0; }
					`
				});
				const panel = page.getByTestId('panel');
				(page.getByRole('button', { name: 'Trigger' }).element() as HTMLElement).click();
				await tick();

				expect(panel.element()).toHaveAttribute('data-starting-style');
				expect(panel.element().style.getPropertyValue('justify-content')).toBe('initial');
				expect(panel.element().style.getPropertyPriority('justify-content')).toBe('important');
				expect(warnSpy).toHaveBeenCalledWith(
					'Base UI: CSS transitions and CSS animations both detected on Collapsible or Accordion panel. Only one of either animation type should be used.'
				);

				await frames(2);
				expect(panel.element().style.justifyContent).toBe('center');
			} finally {
				warnSpy.mockRestore();
			}
		});
	});

	describe('CSS animations', () => {
		it('does not run the mount animation when initially open', async () => {
			render(CollapsibleHarness, {
				open: true,
				panelClass: 'animation-test-panel',
				css: `
					@keyframes panel-slide-down {
						from { height: 0; }
						to { height: var(--collapsible-panel-height); }
					}
					.animation-test-panel[data-open] {
						overflow: hidden;
						animation: panel-slide-down 100ms linear;
					}
				`
			});
			const panel = page.getByTestId('panel');

			await expect.element(panel).toHaveAttribute('data-open', '');
			expect(panel.element().getAnimations().length).toBe(0);
			expect(getComputedStyle(panel.element()).animationName).toBe('none');
		});

		it('still animates on close and reopen after being initially open', async () => {
			render(CollapsibleHarness, {
				open: true,
				keepMounted: true,
				panelClass: 'animation-test-panel',
				css: `
					@keyframes panel-slide-down {
						from { height: 0; }
						to { height: var(--collapsible-panel-height); }
					}
					@keyframes panel-slide-up {
						from { height: var(--collapsible-panel-height); }
						to { height: 0; }
					}
					.animation-test-panel[data-open] {
						overflow: hidden;
						animation: panel-slide-down 100ms linear;
					}
					.animation-test-panel[data-closed] {
						overflow: hidden;
						animation: panel-slide-up 100ms linear;
					}
				`
			});
			const trigger = page.getByRole('button', { name: 'Trigger' });
			const panel = page.getByTestId('panel');

			expect(panel.element().getAnimations().length).toBe(0);
			await trigger.click();

			await expect.poll(() => panel.element().getAnimations().length).toBe(1);
			await expect.element(panel).toHaveAttribute('data-closed', '');

			await trigger.click();
			await expect.poll(() => panel.element().getAnimations().length).toBe(1);
			await expect.element(panel).toHaveAttribute('data-open', '');
		});
	});

	describe('prop: hiddenUntilFound', () => {
		it('warns when hiddenUntilFound overrides keepMounted={false}', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				render(CollapsibleHarness, { hiddenUntilFound: true, keepMounted: false });
				await tick();
				expect(warnSpy).toHaveBeenCalledWith(
					'Base UI: The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.'
				);
				expect(page.getByText(PANEL_CONTENT).element().getAttribute('hidden')).toBe('until-found');
			} finally {
				warnSpy.mockRestore();
			}
		});

		it('opens from beforematch and uses hidden="until-found" while closed', async () => {
			const handleOpenChange = vi.fn();
			render(CollapsibleHarness, {
				hiddenUntilFound: true,
				keepMounted: true,
				onOpenChange: handleOpenChange
			});
			const panel = page.getByTestId('panel');

			expect(panel.element().getAttribute('hidden')).toBe('until-found');
			panel.element().dispatchEvent(new Event('beforematch', { bubbles: true }));
			await tick();

			expect(handleOpenChange).toHaveBeenCalledTimes(1);
			expect(handleOpenChange.mock.calls[0][1].reason).toBe(REASONS.none);
			await expect.element(panel).toHaveAttribute('data-open', '');
		});

		it('does not open when beforematch is canceled', async () => {
			const handleOpenChange = vi.fn(
				(_open: boolean, details: { reason: string; cancel: () => void }) => {
					if (details.reason === REASONS.none) details.cancel();
				}
			);
			render(CollapsibleHarness, {
				hiddenUntilFound: true,
				keepMounted: true,
				panelStyle: 'transition-duration: 123ms',
				onOpenChange: handleOpenChange
			});
			const panel = page.getByTestId('panel');
			const trigger = page.getByRole('button', { name: 'Trigger' });

			panel.element().dispatchEvent(new Event('beforematch', { bubbles: true }));
			await tick();

			expect(handleOpenChange).toHaveBeenCalledTimes(1);
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect.element(panel).toHaveAttribute('data-closed', '');

			await trigger.click();
			expect(handleOpenChange).toHaveBeenCalledTimes(2);
			await expect.element(panel).toHaveAttribute('data-open', '');
			expect(panel.element().style.transitionDuration).toBe('123ms');
		});
	});

	describe('context', () => {
		it('throws when Trigger is rendered outside Collapsible.Root', async () => {
			await expect(async () => {
				await render(Collapsible.Trigger);
			}).rejects.toThrow(
				'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.'
			);
		});

		it('throws when Panel is rendered outside Collapsible.Root', async () => {
			await expect(async () => {
				await render(Collapsible.Panel);
			}).rejects.toThrow(
				'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.'
			);
		});
	});

	describe('native Svelte', () => {
		it('bound open follows the owner and writes back', async () => {
			render(CollapsibleBindHarness);
			const checkbox = page.getByRole('checkbox');
			const trigger = page.getByRole('button', { name: 'Trigger' });

			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await checkbox.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await trigger.click();
			await frames(1);
			await expect.element(checkbox).not.toBeChecked();
		});

		it('one-way open sets the value, and clicks override it until the owner changes it', async () => {
			render(CollapsibleBindHarness, { bound: false });
			const checkbox = page.getByRole('checkbox');
			const trigger = page.getByRole('button', { name: 'Trigger' });

			await checkbox.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await trigger.click();
			await frames(1);
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect.element(checkbox).toBeChecked();
			await checkbox.click();
			await checkbox.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		});

		it('preventDefault in onclick skips the trigger handler', async () => {
			const handleOpenChange = vi.fn();
			render(CollapsibleHarness, {
				onclick: (event: MouseEvent) => event.preventDefault(),
				onOpenChange: handleOpenChange
			});

			await page.getByRole('button', { name: 'Trigger' }).click();

			expect(handleOpenChange).not.toHaveBeenCalled();
			await expect
				.element(page.getByRole('button', { name: 'Trigger' }))
				.toHaveAttribute('aria-expanded', 'false');
		});

		it('passes consumer attachments to the default root', async () => {
			render(CollapsibleAttachHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippets receive props, state, children, and attachments', async () => {
			render(CollapsibleAttachHarness, { custom: true });
			const trigger = page.getByRole('button', { name: 'Trigger' });

			await expect.element(page.getByTestId('host')).toHaveTextContent('from-props');
			await expect.element(trigger).toHaveAttribute('data-panel-open', 'false');
			await trigger.click();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect.element(page.getByText('Panel')).toBeVisible();
		});

		it('activates a non-button trigger from Enter and Space', async () => {
			render(CollapsibleHarness, { triggerAs: 'span' });
			const trigger = page.getByRole('button', { name: 'Trigger' });

			expect(trigger.element().tagName).toBe('SPAN');
			await expect.element(trigger).toHaveAttribute('role', 'button');
			trigger.element().focus();
			await userEvent.keyboard('{Enter}');
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
			await userEvent.keyboard('{Space}');
			await frames(2);
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('collapsible');
});
