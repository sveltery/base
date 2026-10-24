// Derived from react-resizable-panels v4.5.8 lib/components/group/Group.tsx, panel/Panel.tsx and
// separator/Separator.tsx (commit 119437b6a973c10b6513613eb9453fc9fb850259).
// MIT, see THIRD_PARTY_NOTICES.md.

export const ResizableGroupDataAttributes = {
	/** Present on every group. */
	group: 'data-group',
	/**
	 * The group's `id`, for test queries.
	 * @type {string}
	 */
	testid: 'data-testid'
} as const;

export const ResizablePanelDataAttributes = {
	/** Present on every panel. */
	panel: 'data-panel',
	/**
	 * The panel's `id`, for test queries.
	 * @type {string}
	 */
	testid: 'data-testid'
} as const;

export const ResizableSeparatorDataAttributes = {
	/**
	 * Whether the pointer is over the separator's hit area (`hover`), dragging it (`active`),
	 * or neither (`inactive`).
	 * @type {'inactive' | 'hover' | 'active'}
	 */
	separator: 'data-separator',
	/**
	 * The separator's `id`, for test queries.
	 * @type {string}
	 */
	testid: 'data-testid'
} as const;
