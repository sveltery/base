import { describe, expect, it } from 'vitest';
import { createPopupOpenState } from './popupStoreUtils.js';
import { PopupTriggerMap } from './popupTriggerMap.js';
import { popupTransitionStateMapping, triggerOpenStateMapping } from '../popupStateMapping.js';
import { getStateAttributesProps } from '../state-attributes.js';

const base = {
	open: true,
	preventUnmountingOnClose: false,
	activeTriggerId: 'open-trigger',
	activeTriggerElement: { id: 'open-trigger' } as Element
};

describe('createPopupOpenState', () => {
	it('clears preventUnmountingOnClose when a close cycle opens again', () => {
		const next = createPopupOpenState({ ...base, preventUnmountingOnClose: true }, true, undefined);
		expect(next.preventUnmountingOnClose).toBe(false);
		expect(next.open).toBe(true);
	});

	it('keeps a stuck preventUnmount flag on a close that does not ask again', () => {
		const next = createPopupOpenState(
			{ ...base, preventUnmountingOnClose: true },
			false,
			undefined
		);
		expect(next.open).toBe(false);
		expect(next.preventUnmountingOnClose).toBe(true);
		expect(next.activeTriggerId).toBe('open-trigger');
	});

	it('sets the flag when the close asks to prevent unmount', () => {
		const next = createPopupOpenState(base, false, undefined, true);
		expect(next.preventUnmountingOnClose).toBe(true);
	});
});

describe('PopupTriggerMap', () => {
	it('registers and removes a trigger by id', () => {
		const map = new PopupTriggerMap();
		const element = {} as Element;
		map.add('a', element);
		expect(map.getById('a')).toBe(element);
		expect(map.hasElement(element)).toBe(true);
		expect(map.size).toBe(1);
		map.delete('a');
		expect(map.size).toBe(0);
	});

	it('rejects one element registered under two ids', () => {
		const map = new PopupTriggerMap();
		const element = {} as Element;
		map.add('a', element);
		expect(() => map.add('b', element)).toThrow(/multiple IDs/);
	});
});

describe('popup state attributes', () => {
	it('maps open, closed, and transition status', () => {
		expect(getStateAttributesProps({ open: true }, triggerOpenStateMapping)).toEqual({
			'data-popup-open': ''
		});
		expect(
			getStateAttributesProps(
				{ open: false, anchorHidden: false, transitionStatus: 'ending' as const },
				popupTransitionStateMapping
			)
		).toMatchObject({ 'data-closed': '', 'data-ending-style': '' });
		expect(
			getStateAttributesProps(
				{ open: true, anchorHidden: false, transitionStatus: 'starting' as const },
				popupTransitionStateMapping
			)
		).toMatchObject({ 'data-open': '', 'data-starting-style': '' });
	});
});
