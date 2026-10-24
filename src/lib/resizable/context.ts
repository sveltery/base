// Derived from react-resizable-panels v4.5.8 lib/components/group/GroupContext.ts and
// useGroupContext.ts (commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
import { createContext } from 'svelte';
import type { Orientation } from './engine/components/group/types.js';
import type { RegisteredPanel } from './engine/components/panel/types.js';
import type { RegisteredSeparator } from './engine/components/separator/types.js';
import { assert } from './engine/utils/assert.js';

export type PanelStyles = {
	flexGrow: number;
	pointerEvents?: 'none' | undefined;
};

export type GroupContext = {
	getPanelStyles: (groupId: string, panelId: string) => PanelStyles;
	readonly id: string;
	readonly orientation: Orientation;
	readonly registerPanel: (panel: RegisteredPanel) => () => void;
	readonly registerSeparator: (separator: RegisteredSeparator) => () => void;
};

const [getGroupContext, setGroupContext, hasGroupContext] = createContext<GroupContext>();

export { setGroupContext };

export function useGroupContext() {
	assert(
		hasGroupContext(),
		'Group Context not found; did you render a Panel or Separator outside of a Group?'
	);

	return getGroupContext();
}
