// Assertions follow Base UI v1.9.0 packages/react/src/tooltip/root/TooltipRoot.detached-triggers.test.tsx
// and packages/react/test/detachedTriggersConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipTriggersHarness from '../../tests/TooltipTriggersHarness.svelte';
import { parkPointer } from '../../tests/pointer.js';
import { byTestId, fire } from '../../tests/tooltip-events.js';
import { createTooltipHandle } from './handle.svelte.js';
import type { TooltipChangeEventDetails } from './types.js';

const flags = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };

beforeEach(async () => {
	await parkPointer();
	flags.BASE_UI_ANIMATIONS_DISABLED = true;
	document.body.click();
	await expect.poll(() => document.querySelectorAll('[data-open]').length).toBe(0);
});

type Interaction = 'hover' | 'focus';

function trigger(number: number) {
	const element = byTestId(`trigger-${number}`);
	if (!element) throw new Error(`trigger-${number} missing`);
	return element;
}

const popup = () => byTestId('popup');
const content = () => byTestId('content')?.textContent;

async function openWith(interaction: Interaction, element: HTMLElement) {
	if (interaction === 'hover') {
		fire.mouseEnter(element);
		fire.mouseMove(element);
	} else {
		element.focus();
	}
	await tick();
}

async function closeWith(interaction: Interaction, element: HTMLElement) {
	if (interaction === 'hover') fire.mouseLeave(element);
	else element.blur();
	await tick();
}

async function switchTrigger(interaction: Interaction, from: HTMLElement, to: HTMLElement) {
	if (interaction === 'hover') {
		fire.mouseLeave(from);
		fire.mouseEnter(to);
		fire.mouseMove(to);
		await tick();
	} else {
		await openWith(interaction, to);
	}
}

function activeTriggers(count = 2) {
	return Array.from({ length: count }, (_, index) => index + 1).filter((number) =>
		trigger(number).hasAttribute('data-popup-open')
	);
}

describe.for([{ mode: 'contained' as const }, { mode: 'detached' as const }])(
	'$mode triggers',
	({ mode }) => {
		it.for(['hover', 'focus'] as const)(
			'opens with any trigger on %s and marks only that trigger as active',
			async (interaction) => {
				render(TooltipTriggersHarness, { mode, triggerCount: 3 });
				expect(popup()).toBeNull();
				expect(activeTriggers(3)).toEqual([]);
				for (const number of [1, 2, 3]) {
					await openWith(interaction, trigger(number));
					await expect.poll(popup).not.toBeNull();
					expect(activeTriggers(3)).toEqual([number]);
					await closeWith(interaction, trigger(number));
					await expect.poll(popup).toBeNull();
					expect(activeTriggers(3)).toEqual([]);
				}
			}
		);

		it('sets the payload of the active trigger and renders content based on it', async () => {
			render(TooltipTriggersHarness, { mode });
			await openWith('hover', trigger(1));
			await expect.poll(content).toBe('1');
			expect(byTestId('root-payload')?.textContent).toBe('1');
			await switchTrigger('hover', trigger(1), trigger(2));
			await expect.poll(content).toBe('2');
			expect(byTestId('root-payload')?.textContent).toBe('2');
			expect(activeTriggers()).toEqual([2]);
		});

		it('reuses the popup DOM nodes when switching triggers', async () => {
			render(TooltipTriggersHarness, { mode });
			await openWith('focus', trigger(1));
			await expect.poll(content).toBe('1');
			const popupElement = popup();
			const positionerElement = byTestId('positioner');
			await switchTrigger('focus', trigger(1), trigger(2));
			await expect.poll(content).toBe('2');
			expect(popup()).toBe(popupElement);
			expect(byTestId('positioner')).toBe(positionerElement);
		});

		it('marks the trigger matching a passed triggerId as active', async () => {
			render(TooltipTriggersHarness, { mode, rootProps: { open: true, triggerId: 'trigger-2' } });
			await expect.poll(popup).not.toBeNull();
			expect(content()).toBe('2');
			expect(activeTriggers()).toEqual([2]);
		});

		it('opens initially with the payload of a non-first triggerId', async () => {
			render(TooltipTriggersHarness, {
				mode,
				triggerCount: 3,
				rootProps: { open: true, triggerId: 'trigger-2' }
			});
			await expect.poll(content).toBe('2');
			expect(activeTriggers(3)).toEqual([2]);
		});

		it('allows controlling the open state and active trigger programmatically', async () => {
			render(TooltipTriggersHarness, {
				mode,
				bound: true,
				positionerProps: { side: 'bottom', align: 'start' }
			});
			const aligned = (number: number) =>
				Math.abs(
					byTestId('positioner')!.getBoundingClientRect().left -
						trigger(number).getBoundingClientRect().left
				) <= 1;
			(page.getByRole('button', { name: 'Open Trigger 1' }).element() as HTMLElement).click();
			await expect.poll(content).toBe('1');
			expect(activeTriggers()).toEqual([1]);
			await expect.poll(() => aligned(1)).toBe(true);
			(page.getByRole('button', { name: 'Open Trigger 2' }).element() as HTMLElement).click();
			await expect.poll(content).toBe('2');
			expect(activeTriggers()).toEqual([2]);
			await expect.poll(() => aligned(2)).toBe(true);
			(page.getByRole('button', { name: 'Close externally' }).element() as HTMLElement).click();
			await expect.poll(popup).toBeNull();
			expect(activeTriggers()).toEqual([]);
		});

		it('does not leave an inline scale style on the popup after switching triggers', async () => {
			flags.BASE_UI_ANIMATIONS_DISABLED = false;
			const onOpenChange = vi.fn();
			render(TooltipTriggersHarness, { mode, rootProps: { onOpenChange }, withViewport: true });
			await openWith('focus', trigger(1));
			await expect.poll(content).toBe('1');
			await switchTrigger('focus', trigger(1), trigger(2));
			await expect.poll(content).toBe('2');
			expect(onOpenChange).toHaveBeenCalled();
			expect(onOpenChange.mock.calls.map(([open]) => open)).not.toContain(false);
			expect(popup()?.style.scale).toBe('');
		});
	}
);

describe('detached triggers', () => {
	it('opens by trigger id with its payload and closes', async () => {
		const handle = createTooltipHandle();
		render(TooltipTriggersHarness, { handle });
		expect(popup()).toBeNull();
		expect(handle.isOpen).toBe(false);
		handle.open('trigger-2');
		await expect.poll(content).toBe('2');
		expect(handle.isOpen).toBe(true);
		expect(activeTriggers()).toEqual([2]);
		handle.close();
		await expect.poll(popup).toBeNull();
		expect(handle.isOpen).toBe(false);
		expect(activeTriggers()).toEqual([]);
	});

	it('throws when opened with an unregistered trigger id', () => {
		const handle = createTooltipHandle();
		render(TooltipTriggersHarness, { handle });
		expect(() => handle.open('missing')).toThrow(
			'was called with the trigger id "missing", but no matching trigger is registered'
		);
		expect(handle.isOpen).toBe(false);
	});

	it('ignores imperative calls while no root is attached and follows the root across remounts', async () => {
		const handle = createTooltipHandle();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const warnings = () =>
			warn.mock.calls.filter(
				([message]) =>
					typeof message === 'string' && message.includes('no root using this handle is mounted')
			).length;
		try {
			handle.open('trigger-1');
			handle.close();
			expect(handle.isOpen).toBe(false);
			expect(warnings()).toBe(2);

			const view = render(TooltipTriggersHarness, { handle, rootMounted: true });
			expect(popup()).toBeNull();
			expect(byTestId('root-payload')?.textContent).toBe('No payload');
			handle.open('trigger-1');
			await expect.poll(content).toBe('1');
			expect(handle.isOpen).toBe(true);

			await view.rerender({ handle, rootMounted: false });
			expect(handle.isOpen).toBe(false);
			expect(popup()).toBeNull();

			warn.mockClear();
			handle.open('trigger-1');
			handle.close();
			expect(handle.isOpen).toBe(false);
			expect(warnings()).toBe(2);

			await view.rerender({ handle, rootMounted: true });
			expect(popup()).toBeNull();
			expect(byTestId('root-payload')?.textContent).toBe('No payload');
			handle.open('trigger-2');
			await expect.poll(content).toBe('2');
			expect(handle.isOpen).toBe(true);
		} finally {
			warn.mockRestore();
		}
	});

	it('registers a detached trigger declared after the root', async () => {
		render(TooltipTriggersHarness, { rootFirst: true });
		await openWith('hover', trigger(2));
		await expect.poll(content).toBe('2');
		expect(activeTriggers()).toEqual([2]);
	});

	describe.for([
		{ name: 'when wrappers are removed', nestings: [3, 2, 1, 0], recreateHandle: false },
		{ name: 'when wrappers are added', nestings: [0, 1, 2, 3], recreateHandle: false },
		{ name: 'when the handle is recreated', nestings: [1, 1, 1], recreateHandle: true },
		{
			name: 'when reparented while the handle is recreated',
			nestings: [3, 2, 1, 0],
			recreateHandle: true
		}
	])('reparenting', ({ name, nestings, recreateHandle }) => {
		it(`keeps a detached trigger working ${name}`, async () => {
			const [initial, ...next] = nestings;
			let handle = createTooltipHandle();
			const view = render(TooltipTriggersHarness, { handle, triggerCount: 1, nesting: initial });
			const opensAndCloses = async () => {
				await openWith('hover', trigger(1));
				await expect.poll(popup).not.toBeNull();
				expect(activeTriggers(1)).toEqual([1]);
				await closeWith('hover', trigger(1));
				await expect.poll(popup).toBeNull();
			};
			await opensAndCloses();
			for (const nesting of next) {
				if (recreateHandle) handle = createTooltipHandle();
				await view.rerender({ handle, triggerCount: 1, nesting });
				await opensAndCloses();
			}
		});
	});

	it('closes a cursor-tracking tooltip when an inactive trigger is pressed', async () => {
		const handle = createTooltipHandle();
		render(TooltipTriggersHarness, {
			handle,
			triggerProps: {},
			rootProps: { trackCursorAxis: 'both' }
		});
		handle.open('trigger-1');
		await expect.poll(popup).not.toBeNull();
		fire.pointerDown(trigger(2), { pointerType: 'touch' });
		fire.click(trigger(2));
		await expect.poll(popup).toBeNull();
	});
});

describe('multiple triggers within Root', () => {
	it('hands off open state and payload to a trigger with its own DOM id while open', async () => {
		render(TooltipTriggersHarness, {
			mode: 'contained',
			triggerProps: { delay: 0, closeDelay: 0, style: 'pointer-events: none' },
			perTrigger: { 2: { as: 'custom-id' } }
		});
		trigger(1).focus();
		await expect.poll(content).toBe('1');
		trigger(2).focus();
		await expect.poll(content).toBe('2');
		expect(trigger(2).id).toBe('custom-button');
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(true);
	});

	it.for([{ mode: 'contained' as const }, { mode: 'detached' as const }])(
		'closes when the active $mode trigger unmounts',
		async ({ mode }) => {
			const view = render(TooltipTriggersHarness, {
				mode,
				triggerProps: { delay: 0 },
				rootProps: { open: true, triggerId: 'trigger-1' },
				positionerProps: { side: 'bottom', align: 'start' }
			});
			await expect.poll(content).toBe('1');
			await view.rerender({ hidden: [1] });
			await expect.poll(popup).toBeNull();
			expect(byTestId('trigger-1')).toBeNull();
			expect(trigger(2).hasAttribute('data-popup-open')).toBe(false);
		}
	);

	it('remains open when the close after the active trigger unmounts is canceled', async () => {
		const onOpenChange = vi.fn((open: boolean, details: TooltipChangeEventDetails) => {
			if (!open) details.cancel();
		});
		const view = render(TooltipTriggersHarness, {
			mode: 'contained',
			triggerProps: { delay: 0 },
			rootProps: { open: true, triggerId: 'trigger-1', onOpenChange },
			positionerProps: { side: 'bottom', align: 'start' }
		});
		await expect.poll(content).toBe('1');
		await view.rerender({ hidden: [1] });
		await expect
			.poll(() => onOpenChange.mock.calls.map(([open, details]) => [open, details.reason]))
			.toEqual([[false, 'none']]);
		expect(byTestId('trigger-1')).toBeNull();
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(false);
		expect(content()).toBe('1');
	});
});

describe('multiple detached triggers', () => {
	it('closes when focusing a disabled trigger while another trigger is open', async () => {
		render(TooltipTriggersHarness, { perTrigger: { 2: { disabled: true } } });
		trigger(1).focus();
		await expect.poll(content).toBe('1');
		trigger(2).focus();
		await expect.poll(popup).toBeNull();
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(false);
	});

	it('closes when hovering a disabled trigger while another trigger is open', async () => {
		render(TooltipTriggersHarness, { perTrigger: { 2: { disabled: true } } });
		fire.mouseEnter(trigger(1));
		fire.mouseMove(trigger(1));
		await expect.poll(content).toBe('1');
		// A real pointer move names the trigger it enters.
		fire.mouseLeave(trigger(1), { relatedTarget: trigger(2) });
		fire.mouseEnter(trigger(2), { relatedTarget: trigger(1) });
		fire.mouseMove(trigger(2));
		await expect.poll(popup).toBeNull();
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(false);
	});

	it('switches to a rendered disabled button trigger when trigger hover is enabled', async () => {
		render(TooltipTriggersHarness, { perTrigger: { 2: { as: 'disabled-button' } } });
		fire.mouseEnter(trigger(1));
		fire.mouseMove(trigger(1));
		await expect.poll(content).toBe('1');
		fire.mouseLeave(trigger(1));
		fire.mouseEnter(trigger(2));
		fire.mouseMove(trigger(2));
		await expect.poll(content).toBe('2');
		await expect.poll(() => trigger(2).hasAttribute('data-popup-open')).toBe(true);
	});
});
