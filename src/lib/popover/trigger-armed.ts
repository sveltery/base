import type { HTMLAttributes } from 'svelte/elements';
import type { useTriggerFocusGuards } from '../internal/popups/useTriggerFocusGuards.js';

export interface TriggerArmed {
	click: HTMLAttributes<HTMLElement>;
	hover: HTMLAttributes<HTMLElement>;
	attach: (node: HTMLElement) => () => void;
	guards: ReturnType<typeof useTriggerFocusGuards>;
}
