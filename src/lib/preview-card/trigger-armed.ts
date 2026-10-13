import type { HTMLAttributes } from 'svelte/elements';

export interface TriggerArmed {
	hover: HTMLAttributes<HTMLElement>;
	focus: HTMLAttributes<HTMLElement>;
	inline: HTMLAttributes<HTMLElement>;
	attach: (node: HTMLElement) => () => void;
}
