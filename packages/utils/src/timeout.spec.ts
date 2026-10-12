import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	AnimationFrame,
	Timeout,
	TimeoutManager,
	resetAnimationFrameScheduler
} from './timeout.js';

describe('Timeout', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('replaces a pending call and reports whether one is started', () => {
		vi.useFakeTimers();
		const timeout = Timeout.create();
		const calls: string[] = [];
		timeout.start(20, () => calls.push('first'));
		expect(timeout.isStarted()).toBe(true);
		timeout.start(20, () => calls.push('second'));
		vi.advanceTimersByTime(20);
		expect(calls).toEqual(['second']);
		expect(timeout.isStarted()).toBe(false);
	});

	it('clear cancels the pending call', () => {
		vi.useFakeTimers();
		const timeout = new Timeout();
		const calls: string[] = [];
		timeout.start(10, () => calls.push('ran'));
		timeout.clear();
		vi.advanceTimersByTime(10);
		expect(calls).toEqual([]);
	});
});

describe('TimeoutManager', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('keeps named timers independent and clearAll drops them', () => {
		vi.useFakeTimers();
		const manager = new TimeoutManager();
		const calls: string[] = [];
		manager.start('open', 10, () => calls.push('open'));
		manager.start('close', 30, () => calls.push('close'));
		manager.start('open', 15, () => calls.push('open-again'));
		vi.advanceTimersByTime(15);
		expect(calls).toEqual(['open-again']);
		manager.clearAll();
		vi.advanceTimersByTime(30);
		expect(calls).toEqual(['open-again']);
	});
});

describe('AnimationFrame', () => {
	afterEach(() => {
		resetAnimationFrameScheduler();
		vi.unstubAllGlobals();
	});

	it('runs a requested callback on the next frame and cancels the previous one', async () => {
		const queued: FrameRequestCallback[] = [];
		vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
			queued.push(callback);
			return queued.length;
		});
		resetAnimationFrameScheduler();

		const frame = AnimationFrame.create();
		const calls: string[] = [];
		frame.request(() => calls.push('first'));
		frame.request(() => calls.push('second'));
		expect(queued).toHaveLength(1);
		queued[0](0);
		await Promise.resolve();
		expect(calls).toEqual(['second']);
	});
});
