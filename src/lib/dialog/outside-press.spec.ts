import { describe, expect, it } from 'vitest';
import { dialogOutsidePress, dialogPressMode } from './outside-press.js';
import type { DialogStore } from './store.svelte.js';

function store(partial: Partial<DialogStore<unknown>> = {}) {
	return {
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
		const event = { button: 2, type: 'click' } as unknown as Event;
		expect(dialogOutsidePress(store(), event)).toBe(false);
	});

	it('rejects a press while a nested dialog is open', () => {
		const event = { button: 0, type: 'click' } as unknown as Event;
		expect(dialogOutsidePress(store({ nestedOpenDialogCount: 1 }), event)).toBe(false);
	});

	it('rejects a press when pointer dismissal is disabled', () => {
		const event = { button: 0, type: 'click' } as unknown as Event;
		expect(dialogOutsidePress(store({ disablePointerDismissal: true }), event)).toBe(false);
	});

	it('uses intentional mode for both pointers when a backdrop is mounted', () => {
		const backdrop = {} as HTMLElement;
		const dialog = store({ backdropElement: backdrop, modal: 'trap-focus' });
		expect(dialogPressMode(dialog, 'mouse')).toBe('intentional');
		expect(dialogPressMode(dialog, 'touch')).toBe('intentional');
	});

	it('uses sloppy mouse for trap-focus and sloppy touch without a backdrop', () => {
		const dialog = store({ modal: 'trap-focus' });
		expect(dialogPressMode(dialog, 'mouse')).toBe('sloppy');
		expect(dialogPressMode(dialog, 'touch')).toBe('sloppy');
	});

	it('uses intentional mouse and sloppy touch when nothing backs the dialog', () => {
		const dialog = store({ modal: false });
		expect(dialogPressMode(dialog, 'mouse')).toBe('intentional');
		expect(dialogPressMode(dialog, 'touch')).toBe('sloppy');
	});
});
