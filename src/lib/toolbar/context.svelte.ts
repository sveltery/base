// Derived from Base UI v1.9.0 packages/react/src/toolbar/root/ToolbarRootContext.ts
// and packages/react/src/toolbar/group/ToolbarGroupContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { CompositeRoot } from '../internal/composite-root.svelte.js';
import type { ToolbarOrientation } from './types.js';
import { defineContext, defineOptionalContext } from '../internal/context.js';

/**
 * Disabled and orientation are read from the root's props, so a later change
 * is visible without copying them into another `$state`.
 */
export class ToolbarRootContext {
	readonly roving: CompositeRoot;
	readonly readDisabled: () => boolean;
	readonly readOrientation: () => ToolbarOrientation;

	constructor(
		readDisabled: () => boolean,
		readOrientation: () => ToolbarOrientation,
		roving: CompositeRoot
	) {
		this.readDisabled = readDisabled;
		this.readOrientation = readOrientation;
		this.roving = roving;
	}

	get disabled() {
		return this.readDisabled();
	}

	get orientation() {
		return this.readOrientation();
	}
}

export class ToolbarGroupContext {
	readonly readDisabled: () => boolean;

	constructor(readDisabled: () => boolean) {
		this.readDisabled = readDisabled;
	}

	get disabled() {
		return this.readDisabled();
	}
}

export const [useToolbarRootContext, setToolbarRootContext] = defineContext<ToolbarRootContext>(
	'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.'
);

export const [useToolbarGroupContext, setToolbarGroupContext] = defineOptionalContext<
	ToolbarGroupContext | undefined
>(undefined);
