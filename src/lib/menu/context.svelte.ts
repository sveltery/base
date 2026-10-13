// Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRootContext.ts,
// portal/MenuPortalContext.ts, positioner/MenuPositionerContext.ts, group/MenuGroupContext.ts,
// radio-group/MenuRadioGroupContext.ts, checkbox-item/MenuCheckboxItemContext.ts and
// radio-item/MenuRadioItemContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The filter fields of MenuRootContext (`virtualFocus`, `allowEscape`, rendered floating id)
// are not ported.

import { defineContext } from '../internal/context.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { MenuParent } from './parent.svelte.js';
import type { MenuStore } from './store.svelte.js';
import type { MenuChangeEventDetails, MenuItemIndicatorState, MenuOrientation } from './types.js';

export interface MenuRootContext {
	readonly store: MenuStore;
	/** Where this `Menu.Root` sits. A detached trigger never replaces it. */
	readonly parent: MenuParent;
	readonly orientation: MenuOrientation;
}

export const [useMenuRoot, setMenuRoot, findMenuRoot] = defineContext<MenuRootContext>(
	'Base UI: MenuRootContext is missing. Menu parts must be placed within <Menu.Root>.'
);

export const [useMenuPortal, setMenuPortal] = defineContext<{ readonly keepMounted: boolean }>(
	'Base UI: <Menu.Portal> is missing.'
);

export const [useMenuPositioner, setMenuPositioner, findMenuPositioner] =
	defineContext<AnchorPositioning>(
		'Base UI: MenuPositionerContext is missing. MenuPositioner parts must be placed within <Menu.Positioner>.'
	);

/** A group's label registers its id here. */
export interface MenuGroupContext {
	setLabelId(id: string | undefined): void;
	readonly labelId: string | undefined;
}

export const [useMenuGroup, setMenuGroup] = defineContext<MenuGroupContext>(
	'Base UI: MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>.'
);

export interface MenuRadioGroupContext {
	readonly value: unknown;
	readonly disabled: boolean;
	setValue(value: unknown, details: MenuChangeEventDetails): void;
}

export const [useMenuRadioGroup, setMenuRadioGroup] = defineContext<MenuRadioGroupContext>(
	'Base UI: MenuRadioGroupContext is missing. MenuRadioGroup parts must be placed within <Menu.RadioGroup>.'
);

export type MenuItemIndicatorContext = Omit<MenuItemIndicatorState, 'transitionStatus'>;

export const [useMenuCheckboxItem, setMenuCheckboxItem] = defineContext<MenuItemIndicatorContext>(
	'Base UI: MenuCheckboxItemContext is missing. MenuCheckboxItem parts must be placed within <Menu.CheckboxItem>.'
);

export const [useMenuRadioItem, setMenuRadioItem] = defineContext<MenuItemIndicatorContext>(
	'Base UI: MenuRadioItemContext is missing. MenuRadioItem parts must be placed within <Menu.RadioItem>.'
);
