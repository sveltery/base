import { describe, expect, it } from 'vitest';
import { dialogOutsidePress, dialogOutsidePressEvent } from './outside-press.js';
import type { DialogStore } from './store.svelte.js';

function store(partial: Partial<DialogStore<unknown>> = {}) {
	return {
		outsidePressEnabled: true,
		nestedOpenDialogCount: 0,
		disablePointerDismissal: false,
		modal: true,
		internalBackdropElement: null,
		backdropElement: null,
		popupElement: null,
		...partial
	} as DialogStore<unknown>;
}

describe('dialogOutsidePress', () => {
	it('rejects a non-primary button', () => {
		const event = { button: 2, type: 'click' } as Event;
		expect(dialogOutsidePress(store(), event)).toBe(false);
	});

	it('rejects a press while a nested dialog is open', () => {
		const event = { button: 0, type: 'click' } as Event;
		expect(dialogOutsidePress(store({ nestedOpenDialogCount: 1 }), event)).toBe(false);
	});

	it('rejects a press when pointer dismissal is disabled', () => {
		const event = { button: 0, type: 'click' } as Event;
		expect(dialogOutsidePress(store({ disablePointerDismissal: true }), event)).toBe(false);
	});

	it('uses intentional mode when a backdrop is mounted', () => {
		const backdrop = {} as HTMLElement;
		expect(dialogOutsidePressEvent(store({ backdropElement: backdrop, modal: 'trap-focus' }))).toBe(
			'intentional'
		);
	});

	it('uses sloppy mode for trap-focus without a backdrop', () => {
		expect(dialogOutsidePressEvent(store({ modal: 'trap-focus' }))).toBe('sloppy');
	});
});
