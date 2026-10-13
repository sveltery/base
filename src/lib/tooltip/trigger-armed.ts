import type { HTMLAttributes } from 'svelte/elements';

/** Handlers a live store gives its trigger. `local` runs before the root's dismiss handlers. */
export interface TooltipTriggerArmed {
	base: HTMLAttributes<HTMLElement>;
	local: HTMLAttributes<HTMLElement>;
	attach: (node: HTMLElement) => () => void;
}
