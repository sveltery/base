// Derived from Base UI v1.9.0
// packages/react/src/internals/field-root-context/useSetFieldFocused.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import type { FieldContext } from './model.svelte.js';

/**
 * Publishes one control's focus to its Field. Disabling or unmounting a focused control
 * moves focus away without a `blur` event, so the control releases the Field's focused
 * state itself. A Field can hold several focus targets, so a control releases it only
 * when focus last landed on that control.
 */
export class FieldFocusOwner {
	private readonly disabled: boolean;

	constructor(
		private readonly field: FieldContext,
		private readonly read: {
			disabled: () => boolean;
			target: () => Element | null;
			onFocusedChange?: (focused: boolean) => void;
		}
	) {
		this.disabled = $derived(read.disabled());
		// Re-runs when `disabled` changes. The setup reclaims focus that no focus event
		// reported: a control focused before hydration, or an `aria-disabled` control
		// re-enabled while it kept focus.
		$effect(() => {
			void this.disabled;
			const target = read.target();
			untrack(() => {
				const root = target?.getRootNode() as Document | ShadowRoot | undefined;
				if (target && root?.activeElement === target) this.set(true);
			});
			return () => untrack(() => this.set(false));
		});
	}

	set = (focused: boolean) => {
		// A disabled target can still take focus (`aria-disabled` stays focusable), but
		// must not publish the Field's focused styling.
		if (focused ? this.disabled : this.field.focusOwner !== this) return;
		this.field.focusOwner = focused ? this : undefined;
		this.read.onFocusedChange?.(focused);
		this.field.setFocused(focused);
	};
}
