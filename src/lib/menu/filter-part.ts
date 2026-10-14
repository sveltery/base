// Derived from Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterContext.ts
// (`useMenuFilterPart`) (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import { findMenuRoot, type MenuRootContext } from './context.svelte.js';
import type { MenuFilter } from './filter-root.svelte.js';

/** The filter of the menu a part renders in. Throws, naming the part, when the menu has none. */
export function useMenuFilterPart(part: string): { root: MenuRootContext; filter: MenuFilter } {
	const root = findMenuRoot();
	const filter = root?.store.filter;
	if (!root || !filter) {
		throw new Error(
			`Base UI: <Menu.${part}> must be placed in a menu wrapped in <Menu.FilterProvider>. ` +
				'It reads the filter query and the matching items from the provider, which a plain menu ' +
				'does not have. Wrap the <Menu.Root> or <Menu.SubmenuRoot> it belongs to in ' +
				'<Menu.FilterProvider>. See https://base-ui.com/react/components/menu#filtering'
		);
	}
	return { root, filter };
}
