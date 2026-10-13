// Derived from Base UI v1.9.0 packages/react/src/navigation-menu/root/NavigationMenuRootContext.ts,
// packages/react/src/navigation-menu/item/NavigationMenuItemContext.ts,
// packages/react/src/navigation-menu/portal/NavigationMenuPortalContext.ts, and
// packages/react/src/navigation-menu/positioner/NavigationMenuPositionerContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The dismiss context of the list lives on the root store, which owns one list.

import type { CompositeRoot } from '../internal/composite-root.svelte.js';
import { defineContext, defineOptionalContext } from '../internal/context.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { NavigationMenuRootStore } from './root-store.svelte.js';

export const [useNavigationMenuRoot, setNavigationMenuRoot, findNavigationMenuRoot] =
	defineContext<NavigationMenuRootStore>(
		'Base UI: NavigationMenuRootContext is missing. Navigation Menu parts must be placed within <NavigationMenu.Root>.'
	);

export interface NavigationMenuItemContext {
	readonly value: unknown;
}

export const [useNavigationMenuItem, setNavigationMenuItem] =
	defineContext<NavigationMenuItemContext>(
		'Base UI: NavigationMenuItem parts must be used within a <NavigationMenu.Item>.'
	);

export interface NavigationMenuPortalContext {
	readonly keepMounted: boolean;
}

export const [useNavigationMenuPortal, setNavigationMenuPortal] =
	defineContext<NavigationMenuPortalContext>('Base UI: <NavigationMenu.Portal> is missing.');

export const [
	useNavigationMenuPositioner,
	setNavigationMenuPositioner,
	findNavigationMenuPositioner
] = defineContext<AnchorPositioning>(
	'Base UI: NavigationMenuPositionerContext is missing. NavigationMenuPositioner parts must be placed within <NavigationMenu.Positioner>.'
);

/** The composite list a trigger or link joins: the top-level list, or the content around it. */
export const [useNavigationMenuComposite, setNavigationMenuComposite] =
	defineOptionalContext<CompositeRoot | null>(null);
