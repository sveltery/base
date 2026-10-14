// Assertions follow Base UI v1.9.0 packages/react/src/preview-card/root/PreviewCardRoot.detached-triggers.test.tsx
// and packages/react/test/detachedTriggersConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the "does not re-render inactive triggers" cases (they count React renders),
// `defaultOpen` / `defaultTriggerId` (a root takes an initial `open` and `triggerId` instead),
// and the Strict-Mode and JSDOM-only branches.
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PreviewCardHandoffHarness from '../../tests/PreviewCardHandoffHarness.svelte';
import PreviewCardMultiHarness from '../../tests/PreviewCardMultiHarness.svelte';
import { byId, hover, leave, settlePositioning } from '../../tests/previewCardEvents.js';
import { OPEN_DELAY } from './constants.js';
import { PreviewCard } from './index.js';

type Interaction = 'hover' | 'focus';
type Mode = 'contained' | 'detached';

const CLOSE_TRANSITION_MS = 50;
const CLOSE_TRANSITION_TIMEOUT = 300;

function trigger(number: number) {
	const element = byId(`trigger-${number}`);
	if (!element) throw new Error(`trigger ${number} is not rendered`);
	return element;
}

function popup() {
	return byId('popup');
}

function contentText() {
	return byId('content')?.textContent ?? null;
}

async function useKeyboardModality() {
	await userEvent.keyboard('a');
}

function openWith(interaction: Interaction, element: HTMLElement) {
	if (interaction === 'hover') hover(element);
	else element.focus();
}

function closeWith(interaction: Interaction, element: HTMLElement) {
	if (interaction === 'hover') leave(element);
	else element.blur();
}

function expectActiveTrigger(activeNumber: number | null, count = 2) {
	for (let number = 1; number <= count; number += 1) {
		expect(trigger(number).hasAttribute('data-popup-open')).toBe(number === activeNumber);
	}
}

afterEach(settlePositioning);

function leftOffset(element: Element, reference: Element) {
	return Math.abs(element.getBoundingClientRect().left - reference.getBoundingClientRect().left);
}

describe.each<{ mode: Mode }>([{ mode: 'contained' }, { mode: 'detached' }])(
	'PreviewCard detached triggers conformance with $mode triggers',
	({ mode }) => {
		describe.each<{ interaction: Interaction }>([
			{ interaction: 'hover' },
			{ interaction: 'focus' }
		])('opening on $interaction', ({ interaction }) => {
			it('opens with any trigger and marks only that trigger as active', async () => {
				render(PreviewCardMultiHarness, { mode, triggerCount: 3 });
				await useKeyboardModality();
				expect(popup()).toBeNull();
				expectActiveTrigger(null, 3);

				for (const number of [1, 2, 3]) {
					openWith(interaction, trigger(number));
					await expect.poll(popup).not.toBeNull();
					expectActiveTrigger(number, 3);

					closeWith(interaction, trigger(number));
					await expect.poll(popup).toBeNull();
					expectActiveTrigger(null, 3);
				}
			});
		});

		it('sets the payload of the active trigger and renders content based on it', async () => {
			render(PreviewCardMultiHarness, { mode });
			await useKeyboardModality();

			openWith('focus', trigger(1));
			await expect.poll(contentText).toBe('1');
			expect(byId('root-payload')?.textContent).toBe('1');

			openWith('focus', trigger(2));
			await expect.poll(contentText).toBe('2');
			expect(byId('root-payload')?.textContent).toBe('2');
			expectActiveTrigger(2);
		});

		it('reuses the popup DOM nodes when switching triggers', async () => {
			render(PreviewCardMultiHarness, { mode });
			await useKeyboardModality();

			openWith('focus', trigger(1));
			await expect.poll(contentText).toBe('1');
			const popupElement = popup();
			const positionerElement = byId('positioner');

			openWith('focus', trigger(2));
			await expect.poll(contentText).toBe('2');
			expect(popup()).toBe(popupElement);
			expect(byId('positioner')).toBe(positionerElement);
		});

		it('marks the trigger matching the initial `triggerId` as active', async () => {
			render(PreviewCardMultiHarness, {
				mode,
				triggerCount: 3,
				open: true,
				triggerId: 'trigger-2'
			});

			await expect.poll(contentText).toBe('2');
			expectActiveTrigger(2, 3);
		});

		it('follows `open` and `triggerId` set from the outside', async () => {
			const view = render(PreviewCardMultiHarness, { mode });

			await view.rerender({ mode, open: true, triggerId: 'trigger-1' });
			await expect.poll(contentText).toBe('1');
			expectActiveTrigger(1);
			await expect.poll(() => leftOffset(byId('positioner')!, trigger(1))).toBeLessThanOrEqual(1);

			await view.rerender({ mode, open: true, triggerId: 'trigger-2' });
			await expect.poll(contentText).toBe('2');
			expectActiveTrigger(2);
			await expect.poll(() => leftOffset(byId('positioner')!, trigger(2))).toBeLessThanOrEqual(1);

			await view.rerender({ mode, open: false, triggerId: null });
			await expect.poll(popup).toBeNull();
			expectActiveTrigger(null);
		});

		it('does not leave an inline scale style on the popup after switching triggers', async () => {
			const onOpenChange = vi.fn();
			render(PreviewCardMultiHarness, { mode, withViewport: true, onOpenChange });
			await useKeyboardModality();

			openWith('focus', trigger(1));
			await expect.poll(contentText).toBe('1');
			openWith('focus', trigger(2));
			await expect.poll(contentText).toBe('2');

			expect(onOpenChange.mock.calls.map(([open]) => open)).not.toContain(false);
			expect(popup()!.style.scale).toBe('');
		});
	}
);

describe('PreviewCard detached triggers conformance, imperative actions on the handle', () => {
	it('opens by trigger id with its payload and closes', async () => {
		const handle = PreviewCard.createHandle<number>();
		render(PreviewCardMultiHarness, { mode: 'detached', handle });
		expect(popup()).toBeNull();
		expect(handle.isOpen).toBe(false);

		handle.open('trigger-2');
		await expect.poll(contentText).toBe('2');
		expect(handle.isOpen).toBe(true);
		expectActiveTrigger(2);

		handle.close();
		await expect.poll(popup).toBeNull();
		expect(handle.isOpen).toBe(false);
		expectActiveTrigger(null);
	});

	it('throws when opened with an unregistered trigger id', () => {
		const handle = PreviewCard.createHandle<number>();
		render(PreviewCardMultiHarness, { mode: 'detached', handle });

		expect(() => handle.open('missing')).toThrow(
			'was called with the trigger id "missing", but no matching trigger is registered'
		);
		expect(handle.isOpen).toBe(false);
	});
});

describe('PreviewCard detached triggers conformance, root ownership', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	function warnings(spy: { mock: { calls: unknown[][] } }, text: string) {
		return spy.mock.calls.filter(
			([message]) => typeof message === 'string' && message.includes(text)
		).length;
	}

	it('ignores imperative calls while no root is attached and follows the root across remounts', async () => {
		const handle = PreviewCard.createHandle<number>();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		handle.open('trigger-1');
		handle.close();
		expect(handle.isOpen).toBe(false);
		expect(warnings(warn, 'no root using this handle is mounted')).toBe(2);

		const view = render(PreviewCardMultiHarness, { mode: 'detached', handle, rootMounted: true });
		expect(popup()).toBeNull();
		expect(byId('root-payload')?.textContent).toBe('No payload');

		handle.open('trigger-1');
		await expect.poll(contentText).toBe('1');
		expect(handle.isOpen).toBe(true);
		await settlePositioning();

		await view.rerender({ mode: 'detached', handle, rootMounted: false });
		expect(handle.isOpen).toBe(false);
		expect(popup()).toBeNull();

		warn.mockClear();
		handle.open('trigger-1');
		handle.close();
		expect(handle.isOpen).toBe(false);
		expect(warnings(warn, 'no root using this handle is mounted')).toBe(2);

		await view.rerender({ mode: 'detached', handle, rootMounted: true });
		expect(popup()).toBeNull();
		expect(byId('root-payload')?.textContent).toBe('No payload');

		handle.open('trigger-2');
		await expect.poll(contentText).toBe('2');
		expect(handle.isOpen).toBe(true);
	});

	it('registers a detached trigger declared after the root', async () => {
		render(PreviewCardMultiHarness, { mode: 'detached', rootFirst: true });

		hover(trigger(2));
		await expect.poll(contentText).toBe('2');
		expectActiveTrigger(2);
	});

	it('resolves a trigger still registered to the previous root during a transient overlap', async () => {
		const handle = PreviewCard.createHandle<number>();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const openErrors: unknown[] = [];
		const onOpenError = (error: unknown) => openErrors.push(error);

		const view = render(PreviewCardHandoffHarness, { handle, phase: 'outgoing', onOpenError });
		await view.rerender({ handle, phase: 'overlap', onOpenError });

		await expect.poll(() => handle.isOpen).toBe(true);
		expect(openErrors).toEqual([]);
		expect(warnings(warn, 'No trigger found')).toBe(0);
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(true);
		expect(trigger(1).hasAttribute('data-popup-open')).toBe(false);

		await view.rerender({ handle, phase: 'incoming', onOpenError });
		expect(handle.isOpen).toBe(true);
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(true);
		expect(trigger(1).hasAttribute('data-popup-open')).toBe(false);
	});

	it('keeps an initially open root open while a detached trigger declared after it registers', async () => {
		const handle = PreviewCard.createHandle<number>();
		const onOpenChange = vi.fn();
		render(PreviewCardMultiHarness, {
			mode: 'detached',
			handle,
			rootFirst: true,
			triggerCount: 1,
			open: true,
			triggerId: 'trigger-1',
			onOpenChange
		});

		await expect.poll(() => trigger(1).hasAttribute('data-popup-open')).toBe(true);
		expect(handle.isOpen).toBe(true);
		expect(popup()?.hasAttribute('data-open')).toBe(true);
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});

describe('PreviewCard detached triggers conformance, reparenting', () => {
	async function expectOpensAndCloses() {
		hover(trigger(1));
		await expect.poll(popup).not.toBeNull();
		expectActiveTrigger(1, 1);
		leave(trigger(1));
		await expect.poll(popup).toBeNull();
	}

	it.each([
		{ name: 'when wrappers are removed', nestings: [3, 2, 1, 0], recreateHandle: false },
		{ name: 'when wrappers are added', nestings: [0, 1, 2, 3], recreateHandle: false },
		{
			name: 'during Fast Refresh-like handle recreation',
			nestings: [1, 1, 1],
			recreateHandle: true
		},
		{
			name: 'when reparented during Fast Refresh-like handle recreation',
			nestings: [3, 2, 1, 0],
			recreateHandle: true
		}
	])('keeps a detached trigger working $name', async ({ nestings, recreateHandle }) => {
		const [initialNesting, ...nextNestings] = nestings;
		const props = {
			mode: 'detached' as const,
			triggerCount: 1,
			handle: PreviewCard.createHandle<number>()
		};
		const view = render(PreviewCardMultiHarness, { ...props, nesting: initialNesting });
		await expectOpensAndCloses();

		for (const nesting of nextNestings) {
			const handle = recreateHandle ? PreviewCard.createHandle<number>() : props.handle;
			await view.rerender({ ...props, handle, nesting });
			await expectOpensAndCloses();
		}
	});
});

describe.each<{ mode: Mode; name: string }>([
	{ mode: 'contained', name: 'multiple triggers within Root' },
	{ mode: 'detached', name: 'multiple detached triggers' }
])('PreviewCard $name', ({ mode }) => {
	it('opens immediately when hovering another trigger', async () => {
		render(PreviewCardMultiHarness, { mode, delay: 0, secondDelay: 2000, closeDelay: 300 });

		hover(trigger(1));
		await expect.poll(contentText).toBe('1');

		leave(trigger(1));
		hover(trigger(2));
		await expect.poll(contentText).toBe('2');
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(true);
	});

	it('opens again after Escape when focusing another trigger', async () => {
		render(PreviewCardMultiHarness, { mode });
		await useKeyboardModality();

		trigger(1).focus();
		await expect.poll(popup).not.toBeNull();

		await userEvent.keyboard('{Escape}');
		await expect.poll(popup).toBeNull();

		trigger(2).focus();
		await expect.poll(popup).not.toBeNull();
	});

	it('switches immediately when focusing another trigger while open', async () => {
		render(PreviewCardMultiHarness, { mode, delay: 0, secondDelay: 2000 });
		await useKeyboardModality();

		trigger(1).focus();
		await expect.poll(contentText).toBe('1');

		trigger(2).focus();
		await expect.poll(contentText).toBe('2');
	});

	it('closes when the active trigger unmounts', async () => {
		const view = render(PreviewCardMultiHarness, {
			mode,
			open: true,
			triggerId: 'trigger-1'
		});
		await expect.poll(contentText).toBe('1');

		await view.rerender({ mode, open: true, triggerId: 'trigger-1', showFirst: false });

		await expect.poll(popup).toBeNull();
		expect(byId('trigger-1')).toBeNull();
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(false);
	});

	it('stays open when the close caused by the active trigger unmounting is canceled', async () => {
		const onOpenChange = vi.fn((nextOpen: boolean, details: { cancel: () => void }) => {
			if (!nextOpen) details.cancel();
		});
		const view = render(PreviewCardMultiHarness, {
			mode,
			open: true,
			triggerId: 'trigger-1',
			onOpenChange
		});
		await expect.poll(contentText).toBe('1');

		await view.rerender({
			mode,
			open: true,
			triggerId: 'trigger-1',
			onOpenChange,
			showFirst: false
		});

		await expect.poll(() => onOpenChange.mock.calls.length).toBeGreaterThan(0);
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'none' }));
		expect(byId('trigger-1')).toBeNull();
		expect(trigger(2).hasAttribute('data-popup-open')).toBe(false);
		expect(contentText()).toBe('1');
	});
});

describe('PreviewCard multiple detached triggers with keepMounted', () => {
	it('repositions to a different trigger when reopened', async () => {
		render(PreviewCardMultiHarness, { mode: 'detached', keepMounted: true });
		const positioner = byId('positioner')!;

		hover(trigger(1));
		await expect.poll(popup).not.toBeNull();
		await expect.poll(() => leftOffset(positioner, trigger(1))).toBeLessThanOrEqual(1);

		leave(trigger(1));
		await expect.poll(() => positioner.hasAttribute('hidden')).toBe(true);

		hover(trigger(2));
		await expect.poll(() => positioner.hasAttribute('hidden')).toBe(false);
		await expect.poll(() => leftOffset(positioner, trigger(2))).toBeLessThanOrEqual(1);
	});
});

describe('PreviewCard close transition handoff', () => {
	let style: HTMLStyleElement | undefined;

	function addCloseTransition() {
		style = document.createElement('style');
		style.textContent = `
			@keyframes preview-card-close-transition {
				from { opacity: 1; }
				to { opacity: 0.01; }
			}
			[data-testid="popup"][data-ending-style] {
				animation: preview-card-close-transition ${CLOSE_TRANSITION_MS}ms linear forwards;
			}
		`;
		document.head.append(style);
	}

	afterEach(() => {
		style?.remove();
		style = undefined;
	});

	function renderCard(props: { delay: number; secondDelay?: number; triggerCount?: number }) {
		addCloseTransition();
		return render(PreviewCardMultiHarness, { mode: 'detached', keepMounted: true, ...props });
	}

	async function openFirstThenStartClosing() {
		hover(trigger(1));
		await expect.poll(contentText).toBe('1');
		leave(trigger(1));
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
	}

	it('opens immediately when entering trigger B during trigger A close transition', async () => {
		renderCard({ delay: 0, secondDelay: OPEN_DELAY });
		await openFirstThenStartClosing();

		hover(trigger(2));

		await expect.poll(contentText, { timeout: 200 }).toBe('2');
	});

	it('still respects trigger B open delay after trigger A close transition finishes', async () => {
		renderCard({ delay: 0, secondDelay: OPEN_DELAY });
		await openFirstThenStartClosing();

		await expect
			.poll(() => popup()?.hasAttribute('data-ending-style'), { timeout: CLOSE_TRANSITION_TIMEOUT })
			.toBe(false);
		await expect.poll(() => popup()?.hasAttribute('data-closed')).toBe(true);

		hover(trigger(2));

		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(popup()?.hasAttribute('data-closed')).toBe(true);

		await expect.poll(() => popup()?.hasAttribute('data-open'), { timeout: 3000 }).toBe(true);
	});

	it('reopens immediately when re-hovering trigger A during its close transition', async () => {
		renderCard({ delay: OPEN_DELAY, triggerCount: 1 });
		hover(trigger(1));
		await expect.poll(contentText, { timeout: 3000 }).toBe('1');
		leave(trigger(1));
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);

		hover(trigger(1));

		await expect.poll(() => popup()?.hasAttribute('data-open'), { timeout: 200 }).toBe(true);
		expect(popup()?.hasAttribute('data-closed')).toBe(false);
		expect(contentText()).toBe('1');
	});

	it('respects the open delay on later same-trigger hovers after the close lifecycle finishes', async () => {
		renderCard({ delay: OPEN_DELAY, triggerCount: 1 });
		hover(trigger(1));
		await expect.poll(contentText, { timeout: 3000 }).toBe('1');
		leave(trigger(1));
		await expect.poll(() => popup()?.hasAttribute('data-ending-style')).toBe(true);
		hover(trigger(1));
		await expect.poll(() => popup()?.hasAttribute('data-open'), { timeout: 200 }).toBe(true);
		expect(popup()?.hasAttribute('data-closed')).toBe(false);

		leave(trigger(1));
		await expect.poll(() => popup()?.hasAttribute('data-closed')).toBe(true);
		await expect
			.poll(() => popup()?.hasAttribute('data-ending-style'), { timeout: CLOSE_TRANSITION_TIMEOUT })
			.toBe(false);

		hover(trigger(1));

		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(popup()?.hasAttribute('data-closed')).toBe(true);

		await expect.poll(() => popup()?.hasAttribute('data-open'), { timeout: 3000 }).toBe(true);
	});
});
