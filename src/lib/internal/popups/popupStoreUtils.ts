// Derived from Base UI v1.8.0 packages/react/src/utils/popups/popupStoreUtils.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// applyPopupOpenChange is not ported. Tooltip and PreviewCard own that dismiss-close rule.

import type { Attachment } from 'svelte/attachments';
import { FOCUSABLE_ATTRIBUTE } from '../floating-ui-react/utils/constants.js';
import { PopupTriggerMap } from './popupTriggerMap.js';

export const FOCUSABLE_POPUP_PROPS = {
	tabindex: -1,
	[FOCUSABLE_ATTRIBUTE]: ''
} as const;

export interface PopupOpenState {
	open: boolean;
	preventUnmountingOnClose: boolean;
	activeTriggerId: string | null;
	activeTriggerElement: Element | null;
}

export function createPopupOpenState(
	state: PopupOpenState,
	open: boolean,
	trigger: Element | undefined,
	preventUnmountOnClose = false
): PopupOpenState {
	let preventUnmountingOnClose = state.preventUnmountingOnClose;
	if (open) {
		preventUnmountingOnClose = false;
	} else if (preventUnmountOnClose) {
		preventUnmountingOnClose = true;
	}

	const triggerId = trigger?.id ?? null;
	let activeTriggerId = state.activeTriggerId;
	let activeTriggerElement = state.activeTriggerElement;
	if (triggerId || open) {
		activeTriggerId = triggerId;
		activeTriggerElement = trigger ?? null;
	}

	return { open, preventUnmountingOnClose, activeTriggerId, activeTriggerElement };
}

export function attachPreventUnmountOnClose(eventDetails: { preventUnmountOnClose: () => void }) {
	let preventUnmountOnClose = false;
	eventDetails.preventUnmountOnClose = () => {
		preventUnmountOnClose = true;
	};
	return () => preventUnmountOnClose;
}

/** Call signature stays bivariant so a narrower interaction type still assigns. */
interface PopupFocusFunction {
	(interaction: string): void | boolean | HTMLElement | null;
}

export type PopupFocusTarget = boolean | HTMLElement | null | PopupFocusFunction;

/** Touch focuses the popup. Every other interaction uses the default tab sequence. */
export function createDefaultInitialFocus(popup: () => HTMLElement | null) {
	return (interaction: string) => (interaction === 'touch' ? (popup() ?? false) : true);
}

/** Resolve a focus target when focus moves, not while deriving props. */
export function resolveFocus(
	spec: PopupFocusTarget | undefined,
	interaction: string | null,
	popup: HTMLElement | null
): boolean | HTMLElement {
	const kind = interaction || '';
	const chosen = spec === undefined ? createDefaultInitialFocus(() => popup)(kind) : spec;
	if (typeof chosen === 'function') {
		const result = chosen(kind);
		if (result instanceof HTMLElement) return result;
		if (result === false || result === undefined) return false;
		return true;
	}
	if (chosen instanceof HTMLElement) return chosen;
	if (chosen === false) return false;
	return true;
}

export function registerTrigger(
	store: { triggers: PopupTriggerMap; triggerCount: number },
	id: () => string | undefined
): Attachment<Element> {
	return (element) => {
		const triggerId = id();
		if (!triggerId) return;
		const triggers: PopupTriggerMap = store.triggers;
		triggers.add(triggerId, element);
		store.triggerCount = triggers.size;
		return () => {
			if (triggers.getById(triggerId) === element) triggers.delete(triggerId);
			store.triggerCount = triggers.size;
		};
	};
}
