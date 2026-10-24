// Derived from react-resizable-panels v4.5.8 lib/components/panel/types.ts
// (commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
// The engine's types, without React's props. The props are in ../../../types.ts.

export type PanelSize = {
	asPercentage: number;
	inPixels: number;
};

/**
 * Numeric Panel constraints are represented as numeric percentages (0..100)
 * Values specified using other CSS units must be pre-converted.
 */
export type PanelConstraints = {
	collapsedSize: number;
	collapsible: boolean;
	defaultSize: number | undefined;
	maxSize: number;
	minSize: number;
	panelId: string;
};

export type SizeUnit = 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw';

/**
 * Size constraints may be specified in a variety of ways:
 * - Percentage of the parent Group (0..100)
 * - Pixels
 * - Relative font units (em, rem)
 * - Viewport relative units (vh, vw)
 *
 * Numeric values are assumed to be pixels.
 * Strings without explicit units are assumed to be percentages (0%..100%).
 */
export type PanelConstraintProps = {
	collapsedSize?: number | string | undefined;
	collapsible?: boolean | undefined;
	defaultSize?: number | string | undefined;
	maxSize?: number | string | undefined;
	minSize?: number | string | undefined;
};

export type OnPanelResize = (
	panelSize: PanelSize,
	id: string | number | undefined,
	prevPanelSize: PanelSize | undefined
) => void;

export type RegisteredPanel = {
	id: string;
	idIsStable: boolean;
	element: HTMLDivElement;
	mutableValues: {
		expandToSize: number | undefined;
		prevSize: PanelSize | undefined;
	};
	onResize: OnPanelResize | undefined;
	panelConstraints: PanelConstraintProps;
	scheduleUpdate: () => void;
};

/** Methods on the `Resizable.Panel` instance. Reach them with `bind:this`. */
export interface PanelImperativeHandle {
	/**
	 * Collapse the Panel to its `collapsedSize`.
	 *
	 * ⚠️ This method will do nothing if the Panel is not `collapsible` or if it is already collapsed.
	 */
	collapse: () => void;

	/**
	 * Expand a collapsed Panel to its most recent size.
	 *
	 * ⚠️ This method will do nothing if the Panel is not currently collapsed.
	 */
	expand: () => void;

	/**
	 * Get the current size of the Panel in pixels as well as a percentage of the parent group (0..100).
	 *
	 * @return Panel size (in pixels and as a percentage of the parent group)
	 */
	getSize: () => PanelSize;

	/** The Panel is currently collapsed. */
	isCollapsed: () => boolean;

	/**
	 * Update the Panel's size.
	 *
	 * Size can be in the following formats:
	 * - Percentage of the parent Group (0..100)
	 * - Pixels
	 * - Relative font units (em, rem)
	 * - Viewport relative units (vh, vw)
	 *
	 * ℹ️ Numeric values are assumed to be pixels.
	 * Strings without explicit units are assumed to be percentages (0%..100%).
	 * Percentages may also be specified as strings ending with "%" (e.g. "33%")
	 * Pixels may also be specified as strings ending with the unit "px".
	 * Other units should be specified as strings ending with their CSS property units (e.g. 1rem, 50vh)
	 *
	 * @param size New panel size
	 */
	resize: (size: number | string) => void;
}
