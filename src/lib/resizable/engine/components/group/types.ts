// Derived from react-resizable-panels v4.5.8 lib/components/group/types.ts
// (commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
// The engine's types, without React's props. The props are in ../../../types.ts.
import type { RegisteredPanel } from '../panel/types.js';
import type { RegisteredSeparator } from '../separator/types.js';

/**
 * Panel group orientation loosely relates to the `aria-orientation` attribute.
 * It determines how panels are laid out within the group and the direction they can be resized in.
 */
export type Orientation = 'horizontal' | 'vertical';

/** Map of Panel id to flexGrow value. */
export type Layout = {
	[id: string]: number;
};

export type LayoutStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type ResizeTargetMinimumSize = {
	coarse: number;
	fine: number;
};

export type RegisteredGroup = {
	defaultLayout: Layout | undefined;
	disableCursor: boolean;
	disabled: boolean;
	element: HTMLElement;
	id: string;
	inMemoryLastExpandedPanelSizes: {
		[panelId: string]: number;
	};
	inMemoryLayouts: {
		[panelIds: string]: Layout;
	};
	orientation: Orientation;
	panels: RegisteredPanel[];
	resizeTargetMinimumSize: ResizeTargetMinimumSize;
	separators: RegisteredSeparator[];
};

/** Methods on the `Resizable.Group` instance. Reach them with `bind:this`. */
export interface GroupImperativeHandle {
	/**
	 * Get the Group's current layout as a map of Panel id to percentage (0..100)
	 *
	 * @return Map of Panel id to percentages (specified as numbers ranging between 0..100)
	 */
	getLayout: () => { [panelId: string]: number };

	/**
	 * Set a new layout for the Group
	 *
	 * @param layout Map of Panel id to percentage (a number between 0..100)
	 * @return Applied layout (after validation)
	 */
	setLayout: (layout: { [panelId: string]: number }) => Layout;
}
