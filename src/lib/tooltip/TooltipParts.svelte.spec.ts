// Assertions follow Base UI v1.9.0 packages/react/src/tooltip/{trigger,popup,positioner,arrow,
// portal,viewport,provider}/*.test.tsx and packages/react/test/positionerConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipPartsHarness from '../../tests/TooltipPartsHarness.svelte';
import TooltipPositionerHarness from '../../tests/TooltipPositionerHarness.svelte';
import TooltipProviderHarness from '../../tests/TooltipProviderHarness.svelte';
import { byTestId, fire } from '../../tests/tooltip-events.js';
import { OPEN_DELAY } from './constants.js';
import type { OffsetFunction } from '../internal/useAnchorPositioning.svelte.js';

const flags = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };

beforeEach(async () => {
	await userEvent.unhover(document.body);
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
});

afterEach(() => {
	vi.useRealTimers();
});

async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

const text = (value: string) => page.getByText(value, { exact: true }).query();

describe('Tooltip.Trigger', () => {
	it('throws a descriptive error when rendered without a root or a handle', () => {
		expect(() => render(TooltipPartsHarness, { scene: 'trigger-alone' })).toThrow(
			'Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.'
		);
	});

	it('removes data-popup-open as soon as open becomes false', async () => {
		render(TooltipPartsHarness, { scene: 'prevent-unmount' });
		const trigger = byTestId('trigger')!;
		fire.mouseEnter(trigger);
		fire.mouseMove(trigger);
		await expect.poll(() => trigger.hasAttribute('data-popup-open')).toBe(true);
		expect(text('Content')).not.toBeNull();
		fire.mouseLeave(trigger);
		await tick();
		expect(trigger.hasAttribute('data-popup-open')).toBe(false);
		expect(text('Content')).not.toBeNull();
	});

	it('opens when the rendered trigger element has its own id', async () => {
		render(TooltipPartsHarness, { scene: 'own-id' });
		const trigger = byTestId('trigger')!;
		expect(trigger.id).toBe('custom-button');
		await userEvent.hover(trigger);
		await expect.poll(() => byTestId('popup')).not.toBeNull();
		expect(trigger.hasAttribute('data-popup-open')).toBe(true);
	});

	it('opens on delayed hover when rendered as a disabled toolbar button', async () => {
		render(TooltipPartsHarness, { scene: 'toolbar' });
		const trigger = byTestId('trigger')!;
		expect(trigger.hasAttribute('disabled')).toBe(false);
		expect(trigger.getAttribute('aria-disabled')).toBe('true');
		await userEvent.hover(trigger);
		await expect.poll(() => byTestId('popup')).not.toBeNull();
	});
});

describe('Tooltip.Popup', () => {
	it('renders the children', () => {
		render(TooltipPartsHarness, { scene: 'popup' });
		expect(text('Content')).not.toBeNull();
	});

	it('throws a descriptive error when rendered outside Tooltip.Positioner', () => {
		expect(() => render(TooltipPartsHarness, { scene: 'popup-outside-positioner' })).toThrow(
			'Base UI: TooltipPositionerContext is missing. TooltipPositioner parts must be placed within <Tooltip.Positioner>.'
		);
	});
});

describe('Tooltip.Positioner', () => {
	it('throws a descriptive error when rendered outside Tooltip.Root', () => {
		expect(() => render(TooltipPartsHarness, { scene: 'positioner-alone' })).toThrow(
			'Base UI: TooltipRootContext is missing. Tooltip parts must be placed within <Tooltip.Root>.'
		);
	});

	it('throws a descriptive error when rendered outside Tooltip.Portal', () => {
		expect(() => render(TooltipPartsHarness, { scene: 'positioner-outside-portal' })).toThrow(
			'Base UI: <Tooltip.Portal> is missing.'
		);
	});

	describe('positioner conformance', () => {
		const baselineX = (72 - 52) / 2;
		const baselineY = 36;

		async function positioned(
			props: Parameters<typeof render<typeof TooltipPositionerHarness>>[1]
		) {
			render(TooltipPositionerHarness, props);
			const positioner = byTestId('positioner')!;
			await expect.poll(() => positioner.getBoundingClientRect().height).toBeGreaterThan(0);
			return positioner;
		}

		const offsetCases = [
			{
				prop: 'sideOffset',
				numberPosition: (offset: number) => ({ x: baselineX, y: baselineY + offset }),
				offsetFunction: ((data) => data.positioner.width + data.anchor.width) as OffsetFunction,
				functionPosition: { x: baselineX, y: baselineY + 52 + 72 }
			},
			{
				prop: 'alignOffset',
				numberPosition: (offset: number) => ({ x: baselineX + offset, y: baselineY }),
				offsetFunction: ((data) => data.positioner.width) as OffsetFunction,
				functionPosition: { x: baselineX + 52, y: baselineY }
			}
		] as const;

		describe.for(offsetCases)(
			'prop: $prop',
			({ prop, numberPosition, offsetFunction, functionPosition }) => {
				it('offsets the positioner when a number is specified', async () => {
					const positioner = await positioned({ positioner: { side: 'bottom', [prop]: 7 } });
					const { x, y } = numberPosition(7);
					await expect.poll(() => positioner.getBoundingClientRect()).toMatchObject({ x, y });
				});

				it('offsets the positioner when a function is specified', async () => {
					const positioner = await positioned({
						positioner: { side: 'bottom', [prop]: offsetFunction }
					});
					await expect
						.poll(() => positioner.getBoundingClientRect())
						.toMatchObject(functionPosition);
				});

				it.for([
					{
						name: 'the latest side after a flip',
						side: 'left',
						align: undefined,
						key: 'side',
						direction: 'ltr',
						expected: 'right'
					},
					{
						name: 'the latest align after a flip',
						side: 'right',
						align: 'start',
						key: 'align',
						direction: 'ltr',
						expected: 'end'
					},
					{
						name: 'the logical side after a flip',
						side: 'inline-start',
						align: undefined,
						key: 'side',
						direction: 'ltr',
						expected: 'inline-end'
					},
					{
						name: 'the logical side in RTL mode',
						side: 'inline-start',
						align: undefined,
						key: 'side',
						direction: 'rtl',
						expected: 'inline-start'
					}
				] as const)(
					'reads $name inside the function',
					async ({ side, align, key, direction, expected }) => {
						let value = 'none';
						render(TooltipPositionerHarness, {
							direction,
							positioner: {
								side,
								align,
								[prop]: ((data) => {
									value = data[key];
									return 0;
								}) satisfies OffsetFunction
							}
						});
						await expect.poll(() => value).toBe(expected);
						await expect
							.poll(() => byTestId('positioner')?.getAttribute(`data-${key}`))
							.toBe(expected);
					}
				);
			}
		);

		it('rests exactly at collisionPadding from the colliding edge', async () => {
			const view = render(TooltipPositionerHarness, {
				open: false,
				wrapperStyle: 'position: fixed; bottom: 8px; left: 16px',
				positioner: {
					side: 'bottom',
					sideOffset: 8,
					collisionPadding: 12,
					collisionAvoidance: { fallbackAxisSide: 'none' }
				},
				popupStyle: 'width: 200px; height: 1000px; max-height: var(--available-height)'
			});
			await view.rerender({ open: true });
			await expect.poll(() => byTestId('positioner')?.getAttribute('data-side')).toBe('top');
			await expect
				.poll(() => Math.round(byTestId('positioner')!.getBoundingClientRect().top))
				.toBe(12);
		});

		// useAnchorPositioning in src/lib/internal still places the positioner with left/top.
		it.todo('uses transform positioning without Viewport');
		it.todo('updates positioning when Viewport mounts and unmounts');

		it('uses top/left positioning with Viewport', async () => {
			const positioner = await positioned({ viewport: true, positioner: { side: 'bottom' } });
			expect(positioner.style.transform).toBe('');
			await expect.poll(() => positioner.style.left).toBe(`${baselineX}px`);
			await expect.poll(() => positioner.style.top).toBe(`${baselineY}px`);
		});
	});
});

describe('Tooltip.Arrow', () => {
	it('is hidden from assistive technology and mirrors the resolved side', async () => {
		render(TooltipPartsHarness, { scene: 'arrow' });
		const arrow = byTestId('arrow')!;
		expect(arrow.getAttribute('aria-hidden')).toBe('true');
		await expect.poll(() => arrow.getAttribute('data-side')).toBe('bottom');
		expect(arrow.hasAttribute('data-open')).toBe(true);
	});

	it('is marked uncentered when it cannot point at the anchor', async () => {
		render(TooltipPartsHarness, { scene: 'arrow', arrowPadding: 40 });
		await expect.poll(() => byTestId('arrow')?.hasAttribute('data-uncentered')).toBe(true);
	});

	it('is not marked uncentered when it can point at the anchor', async () => {
		render(TooltipPartsHarness, { scene: 'arrow', arrowPadding: 0, triggerWidth: 200 });
		const arrow = byTestId('arrow')!;
		await expect
			.poll(() => arrow.closest('[role="presentation"]')?.getBoundingClientRect().top)
			.toBe(20);
		await expect.poll(() => arrow.hasAttribute('data-uncentered')).toBe(false);
	});
});

describe('Tooltip.Portal', () => {
	it('renders the closed popup as hidden instead of unmounting it with keepMounted', () => {
		render(TooltipPartsHarness, { scene: 'portal', keepMounted: true });
		expect(byTestId('popup')).not.toBeNull();
		expect(byTestId('positioner')?.hidden).toBe(true);
	});

	it('unmounts the closed popup by default', () => {
		render(TooltipPartsHarness, { scene: 'portal' });
		expect(byTestId('popup')).toBeNull();
	});
});

describe('Tooltip.Viewport', () => {
	it('anchors the positioner from the far edge while it transitions', async () => {
		render(TooltipPartsHarness, { scene: 'viewport-left' });
		page.getByRole('button', { name: 'Trigger' }).element().focus();
		await expect.poll(() => byTestId('positioner')).not.toBeNull();
		const positioner = byTestId('positioner')!;
		await expect.poll(() => positioner.getAttribute('data-side')).toBe('left');
		await expect.poll(() => positioner.style.right).not.toBe('');
		expect(positioner.style.left).toBe('');
	});

	it('mirrors the instant animation type of the tooltip', async () => {
		render(TooltipPartsHarness, { scene: 'viewport-instant' });
		page.getByRole('button', { name: 'Trigger' }).element().focus();
		await expect.poll(() => byTestId('viewport')?.getAttribute('data-instant')).toBe('focus');
	});
});

describe('Tooltip.Provider', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	function hover(name: string) {
		const trigger = page.getByRole('button', { name, exact: true }).element();
		fire.mouseEnter(trigger);
		fire.mouseMove(trigger);
		return trigger;
	}

	it('waits for the delay before showing the tooltip', async () => {
		render(TooltipProviderHarness, { provider: { delay: 10_000 } });
		hover('Trigger');
		await tick();
		expect(text('Content')).toBeNull();
		await advance(1_000);
		expect(text('Content')).toBeNull();
		await advance(9_000);
		expect(text('Content')).not.toBeNull();
	});

	it('respects delay of 0', async () => {
		render(TooltipProviderHarness, { provider: { delay: 0 } });
		hover('Trigger');
		await advance(0);
		expect(text('Content')).not.toBeNull();
	});

	it('respects the trigger delay over the provider delay', async () => {
		render(TooltipProviderHarness, { provider: { delay: 10 }, triggerDelay: 100 });
		hover('Trigger');
		await tick();
		expect(text('Content')).toBeNull();
		await advance(99);
		expect(text('Content')).toBeNull();
		await advance(1);
		expect(text('Content')).not.toBeNull();
	});

	it('waits for the closeDelay before hiding the tooltip', async () => {
		render(TooltipProviderHarness, { provider: { closeDelay: 400 } });
		const trigger = hover('Trigger');
		await advance(OPEN_DELAY);
		expect(text('Content')).not.toBeNull();
		fire.mouseLeave(trigger);
		await advance(300);
		expect(text('Content')).not.toBeNull();
		await advance(300);
		expect(text('Content')).toBeNull();
	});

	it('uses the latest closeDelay after the prop updates', async () => {
		const view = render(TooltipProviderHarness, { provider: { closeDelay: 400 } });
		const trigger = hover('Trigger');
		await advance(OPEN_DELAY);
		expect(text('Content')).not.toBeNull();
		await view.rerender({ provider: { closeDelay: 1000 } });
		fire.mouseLeave(trigger);
		await advance(999);
		expect(text('Content')).not.toBeNull();
		await advance(1);
		expect(text('Content')).toBeNull();
	});

	describe('prop: timeout', () => {
		const two = ['One', 'Two'];

		it('opens an adjacent tooltip instantly while the group is active', async () => {
			render(TooltipProviderHarness, { provider: { delay: 100, timeout: 400 }, names: two });
			const first = hover('One');
			await advance(100);
			expect(text('Content One')).not.toBeNull();
			fire.mouseLeave(first);
			hover('Two');
			await advance(0);
			expect(text('Content Two')).not.toBeNull();
			expect(text('Content One')).toBeNull();
		});

		it('respects a trigger delay over delay=0 outside the instant phase', async () => {
			render(TooltipProviderHarness, {
				provider: { delay: 0, timeout: 400 },
				names: two,
				triggerDelay: 100
			});
			const first = hover('One');
			await advance(99);
			expect(text('Content One')).toBeNull();
			await advance(1);
			expect(text('Content One')).not.toBeNull();
			fire.mouseLeave(first);
			const second = hover('Two');
			await advance(0);
			expect(text('Content Two')).not.toBeNull();
			expect(text('Content One')).toBeNull();
			fire.mouseLeave(second);
			await advance(400);
			hover('One');
			await advance(99);
			expect(text('Content One')).toBeNull();
			await advance(1);
			expect(text('Content One')).not.toBeNull();
		});

		it('requires the full delay again once the timeout elapses', async () => {
			render(TooltipProviderHarness, { provider: { delay: 100, timeout: 400 }, names: two });
			const first = hover('One');
			await advance(100);
			expect(text('Content One')).not.toBeNull();
			fire.mouseLeave(first);
			await advance(400);
			hover('Two');
			await tick();
			expect(text('Content Two')).toBeNull();
			await advance(100);
			expect(text('Content Two')).not.toBeNull();
		});
	});
});
