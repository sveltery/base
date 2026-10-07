// Derived from Base UI v1.8.0 packages/react/src/toolbar/root/ToolbarRootContext.ts
// and packages/react/src/toolbar/group/ToolbarGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, hasContext, setContext } from 'svelte';
import type { ToolbarOrientation } from './types.js';
import { ToolbarRoving } from './roving-focus.svelte.js';

const TOOLBAR_ROOT_CONTEXT = Symbol('toolbar-root');
const TOOLBAR_GROUP_CONTEXT = Symbol('toolbar-group');

/**
 * Disabled and orientation are read from the root's props, so a later change
 * is visible without copying them into another `$state`.
 */
export class ToolbarRootContext {
	readonly roving = new ToolbarRoving();
	readonly readDisabled: () => boolean;
	readonly readOrientation: () => ToolbarOrientation;

	constructor(readDisabled: () => boolean, readOrientation: () => ToolbarOrientation) {
		this.readDisabled = readDisabled;
		this.readOrientation = readOrientation;
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

export function setToolbarRootContext(context: ToolbarRootContext) {
	setContext(TOOLBAR_ROOT_CONTEXT, context);
}

export function useToolbarRootContext(optional: true): ToolbarRootContext | undefined;
export function useToolbarRootContext(optional?: false): ToolbarRootContext;
export function useToolbarRootContext(optional = false) {
	if (!hasContext(TOOLBAR_ROOT_CONTEXT)) {
		if (optional) return undefined;
		throw new Error(
			'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.'
		);
	}
	return getContext<ToolbarRootContext>(TOOLBAR_ROOT_CONTEXT);
}

export function setToolbarGroupContext(context: ToolbarGroupContext) {
	setContext(TOOLBAR_GROUP_CONTEXT, context);
}

export function useToolbarGroupContext(): ToolbarGroupContext | undefined {
	if (!hasContext(TOOLBAR_GROUP_CONTEXT)) return undefined;
	return getContext<ToolbarGroupContext>(TOOLBAR_GROUP_CONTEXT);
}
