// Forwards hook calls to whichever PopoverStore a handle currently exposes.
// The proxy identity stays put, so a detached trigger does not remount when
// the root attaches after hydration.

import type { PopupTriggerMap } from '../internal/popups/popupTriggerMap.js';
import { PopoverStore } from './store.svelte.js';

const methodNames = new Set([
	'setOpen',
	'noteTrigger',
	'forgetTrigger',
	'writeTriggerId',
	'isOpen',
	'openedBy',
	'mountedBy',
	'popupIdFor',
	'resolvedActiveTriggerId',
	'readPlacement',
	'owned'
]);

export function followPopupStore(
	read: () => PopoverStore | null,
	fallbackTriggers: PopupTriggerMap
): PopoverStore {
	const prototype = Object.create(PopoverStore.prototype) as PopoverStore;
	return new Proxy(prototype, {
		get(_target, prop) {
			const current = read();
			if (!current) return detached(prop, fallbackTriggers);
			const value = Reflect.get(current, prop, current);
			return typeof value === 'function' ? value.bind(current) : value;
		},
		set(_target, prop, value) {
			const current = read();
			if (!current) return true;
			return Reflect.set(current, prop, value, current);
		}
	});
}

function detached(prop: PropertyKey, triggers: PopupTriggerMap) {
	if (prop === 'triggers') return triggers;
	if (prop === 'events') return { on() {}, off() {} };
	if (prop === 'data' || prop === 'dismissReference' || prop === 'dismissFloating') return {};
	if (prop === 'hooks') {
		return {
			dismissReference: {},
			dismissFloating: {},
			placement: () => 'bottom',
			closeCount: () => 0,
			triggerSwitch: null
		};
	}
	if (
		prop === 'open' ||
		prop === 'mounted' ||
		prop === 'stickIfOpen' ||
		prop === 'focusManagerModal' ||
		prop === 'triggerDisabled' ||
		prop === 'openOnHover'
	) {
		return false;
	}
	if (prop === 'closeDelay' || prop === 'triggerCount') return 0;
	if (prop === 'pointerType' || prop === 'lastInteraction' || prop === 'closeInteraction')
		return '';
	if (prop === 'isOpen' || prop === 'openedBy' || prop === 'mountedBy') return () => false;
	if (prop === 'resolvedActiveTriggerId') return () => null;
	if (prop === 'popupIdFor' || prop === 'owned') return () => undefined;
	if (prop === 'readPlacement') return () => 'bottom';
	if (typeof prop === 'string' && methodNames.has(prop)) return () => {};
	return undefined;
}
