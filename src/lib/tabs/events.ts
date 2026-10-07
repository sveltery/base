// Change details for Tabs. Automatic reasons ignore cancel(), matching
// Base UI v1.8.0 TabsRoot (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.

import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import type {
	TabsActivationDirection,
	TabsRootChangeEventDetails,
	TabsRootChangeEventReason
} from './types.js';

export function createTabsChangeEventDetails(
	reason: TabsRootChangeEventReason,
	event: Event | undefined,
	activationDirection: TabsActivationDirection
): TabsRootChangeEventDetails {
	const details = createChangeEventDetails(reason, event);
	const automatic = reason !== REASONS.none;
	return {
		reason: details.reason,
		event: details.event,
		activationDirection,
		trigger: details.trigger,
		cancel() {
			if (!automatic) details.cancel();
		},
		allowPropagation() {
			details.allowPropagation();
		},
		get isCanceled() {
			return automatic ? false : details.isCanceled;
		},
		get isPropagationAllowed() {
			return details.isPropagationAllowed;
		}
	};
}
