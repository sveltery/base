import { afterEach, describe, expect, it } from 'vitest';
import { platform } from '@sveltery/utils';
import { isVirtualPointerEvent } from './event.js';

function pointerEvent(overrides: Partial<PointerEvent>): PointerEvent {
	return {
		type: 'pointerdown',
		width: 1,
		height: 1,
		pressure: 0,
		detail: 0,
		buttons: 0,
		pointerType: 'mouse',
		...overrides
	} as PointerEvent;
}

function setAndroid(value: boolean) {
	Object.defineProperty(platform.os, 'android', { value, configurable: true });
}

describe('isVirtualPointerEvent', () => {
	afterEach(() => setAndroid(false));

	it('recognizes a pressureless 1x1 mouse pointerdown as a screen reader press', () => {
		expect(isVirtualPointerEvent(pointerEvent({}))).toBe(true);
	});

	it('ignores a pressed mouse', () => {
		expect(isVirtualPointerEvent(pointerEvent({ pressure: 0.5 }))).toBe(false);
		expect(isVirtualPointerEvent(pointerEvent({ pressure: 0, buttons: 1 }))).toBe(false);
	});

	it('recognizes a TalkBack press with a pressed button on Android', () => {
		setAndroid(true);
		expect(isVirtualPointerEvent(pointerEvent({ buttons: 1 }))).toBe(true);
		expect(isVirtualPointerEvent(pointerEvent({ buttons: 1, pressure: 0.5 }))).toBe(false);
	});

	it('ignores the same shape on other pointer types', () => {
		expect(isVirtualPointerEvent(pointerEvent({ pointerType: 'touch' }))).toBe(false);
		expect(isVirtualPointerEvent(pointerEvent({ pointerType: 'pen' }))).toBe(false);
	});

	it('ignores the same shape on events other than pointerdown', () => {
		expect(isVirtualPointerEvent(pointerEvent({ type: 'pointerup' }))).toBe(false);
		expect(isVirtualPointerEvent(pointerEvent({ type: 'pointermove' }))).toBe(false);
	});

	it('recognizes an iOS VoiceOver touch', () => {
		expect(
			isVirtualPointerEvent(pointerEvent({ pointerType: 'touch', width: 0.333, height: 0.333 }))
		).toBe(true);
	});
});
