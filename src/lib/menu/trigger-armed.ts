import type { HTMLAttributes } from 'svelte/elements';
import type { TriggerFocusGuards } from '../internal/popups/triggerFocusGuards.js';

/** Interaction props one trigger receives from the live menu store. */
export interface TriggerArmed {
	click: HTMLAttributes<HTMLElement>;
	hover: HTMLAttributes<HTMLElement>;
	attach: (node: HTMLElement) => () => void;
	guards: TriggerFocusGuards;
}
