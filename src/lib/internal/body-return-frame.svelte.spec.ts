// bodyReturnFrame.cancel() in FloatingFocusManager: before a new body return is
// scheduled, and when the popup opens again. MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync, tick } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogHarness from '../../tests/DialogHarness.svelte';
import { AnimationFrame } from './timeout.js';

type FrameLog = { kind: 'cancel' | 'request'; id: number; insideRequest: boolean };

function watchFrames() {
	const request = AnimationFrame.prototype.request;
	const cancel = AnimationFrame.prototype.cancel;
	const ids = new WeakMap<object, number>();
	let next = 0;
	let inside = 0;
	const events: FrameLog[] = [];

	function idOf(frame: object) {
		let id = ids.get(frame);
		if (id == null) {
			next += 1;
			id = next;
			ids.set(frame, id);
		}
		return id;
	}

	AnimationFrame.prototype.request = function (fn: () => void) {
		const id = idOf(this);
		events.push({ kind: 'request', id, insideRequest: false });
		inside += 1;
		try {
			return request.call(this, fn);
		} finally {
			inside -= 1;
		}
	};
	AnimationFrame.prototype.cancel = function () {
		events.push({ kind: 'cancel', id: idOf(this), insideRequest: inside > 0 });
		return cancel.call(this);
	};

	return {
		events,
		restore() {
			AnimationFrame.prototype.request = request;
			AnimationFrame.prototype.cancel = cancel;
		}
	};
}

function bareCancelBeforeRequest(events: FrameLog[]) {
	const hits: number[] = [];
	for (let index = 0; index < events.length; index += 1) {
		const event = events[index];
		if (event?.kind !== 'request') continue;
		const previous = events[index - 1];
		if (previous?.kind === 'cancel' && !previous.insideRequest && previous.id === event.id) {
			hits.push(event.id);
		}
	}
	return hits;
}

describe('FloatingFocusManager body return frame', () => {
	it('cancels a pending body return before scheduling the next one and when the popup opens', async () => {
		const watch = watchFrames();
		try {
			render(DialogHarness, { modal: false, withBackdrop: false });
			const trigger = page.getByRole('button', { name: 'Open' });
			(trigger.element() as HTMLElement).click();
			await tick();
			await new Promise<void>((resolve) => {
				requestAnimationFrame(() => resolve());
			});
			watch.events.length = 0;

			(page.getByRole('button', { name: 'Close' }).element() as HTMLElement).click();
			flushSync();
			const scheduled = bareCancelBeforeRequest(watch.events);
			expect(scheduled).toHaveLength(1);
			const bodyFrame = scheduled[0];
			expect(bodyFrame).toBeDefined();

			const afterClose = watch.events.length;
			(trigger.element() as HTMLElement).click();
			flushSync();
			const reopened = watch.events.slice(afterClose);
			expect(
				reopened.some(
					(event) => event.kind === 'cancel' && !event.insideRequest && event.id === bodyFrame
				)
			).toBe(true);
			expect(reopened.some((event) => event.kind === 'request' && event.id === bodyFrame)).toBe(
				false
			);
			await expect.element(page.getByRole('dialog')).toBeVisible();
		} finally {
			watch.restore();
		}
	});
});
