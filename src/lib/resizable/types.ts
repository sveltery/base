import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	GroupImperativeHandle,
	Layout,
	LayoutStorage,
	Orientation,
	ResizeTargetMinimumSize
} from './engine/components/group/types.js';
import type {
	PanelImperativeHandle,
	PanelSize,
	SizeUnit
} from './engine/components/panel/types.js';

/**
 * How a group lays out its panels and the direction they resize in.
 * It loosely relates to the `aria-orientation` attribute.
 */
export type ResizableOrientation = Orientation;

/** Map of panel id to its size, as a percentage (0..100) of the group. */
export type ResizableLayout = Layout;

/** The storage `useDefaultLayout` reads and writes, such as `localStorage`. */
export type ResizableLayoutStorage = LayoutStorage;

/** A panel's size as a percentage of its group and in pixels. */
export type ResizablePanelSize = PanelSize;

/** The CSS units a panel size can use. */
export type ResizableSizeUnit = SizeUnit;

export type ResizableGroupActions = GroupImperativeHandle;

export type ResizablePanelActions = PanelImperativeHandle;

export interface ResizableGroupProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'id' | 'style'
> {
	/** The panels and separators of the group. */
	children?: Snippet;
	/**
	 * The layout the group starts with, such as one `useDefaultLayout` restored.
	 * Read once at mount.
	 */
	defaultLayout?: ResizableLayout | undefined;
	/**
	 * Whether to leave the cursor alone. By default, the group sets the cursor to show the
	 * resize direction while the pointer hovers or drags an edge.
	 * @default false
	 */
	disableCursor?: boolean | undefined;
	/**
	 * Whether the panels of the group cannot be resized.
	 * @default false
	 */
	disabled?: boolean | undefined;
	/**
	 * Identifies the group within the application. Falls back to a generated id.
	 * The element also takes it as `data-testid`.
	 */
	id?: string | number | undefined;
	/**
	 * Called while the layout changes. A pointer drag calls it on every move, so prefer
	 * `onLayoutChanged` for most cases.
	 */
	onLayoutChange?: ((layout: ResizableLayout) => void) | undefined;
	/**
	 * Called once the layout has changed. A pointer drag calls it when the pointer is released.
	 * Save layouts from this callback.
	 */
	onLayoutChanged?: ((layout: ResizableLayout) => void) | undefined;
	/**
	 * The minimum size, in pixels, of the area that starts a resize around a separator or a
	 * panel edge, for coarse (touch) and fine (mouse) pointers.
	 * @default { coarse: 20, fine: 10 }
	 */
	resizeTargetMinimumSize?: ResizeTargetMinimumSize;
	/**
	 * The direction the panels are laid out and resized in.
	 * @default 'horizontal'
	 */
	orientation?: ResizableOrientation | undefined;
	/**
	 * Inline styles for the group element. `display`, `flex-direction`, `flex-wrap` and
	 * `overflow` cannot be overridden.
	 */
	style?: string | null | undefined;
}

export interface ResizablePanelProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'id' | 'onresize' | 'style'
> {
	children?: Snippet;
	/**
	 * CSS class for the inner element that holds the content, so the class does not interfere
	 * with the flex layout.
	 */
	class?: string | undefined;
	/**
	 * The panel's size when collapsed.
	 * @default '0%'
	 */
	collapsedSize?: number | string | undefined;
	/**
	 * Whether the panel collapses when it is resized below its `minSize`.
	 * @default false
	 */
	collapsible?: boolean | undefined;
	/** The size the panel starts with. Without it, the group shares out the free space. */
	defaultSize?: number | string | undefined;
	/**
	 * Identifies the panel within its group. Falls back to a generated id. Saved layouts
	 * use it to match a size to its panel. The element also takes it as `data-testid`.
	 */
	id?: string | number | undefined;
	/**
	 * The largest size of the panel.
	 * @default '100%'
	 */
	maxSize?: number | string | undefined;
	/**
	 * The smallest size of the panel.
	 * @default '0%'
	 */
	minSize?: number | string | undefined;
	/**
	 * Called when the panel's size changes, with the new size, the `id` prop and the previous
	 * size, which is `undefined` on mount.
	 */
	onResize?:
		| ((
				panelSize: ResizablePanelSize,
				id: string | number | undefined,
				prevPanelSize: ResizablePanelSize | undefined
		  ) => void)
		| undefined;
	/** Inline styles for the inner element that holds the content. */
	style?: string | null | undefined;
}

export interface ResizableSeparatorProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'id' | 'role' | 'style' | 'tabindex'
> {
	children?: Snippet;
	/**
	 * Identifies the separator within its group. Falls back to a generated id.
	 * The element also takes it as `data-testid`.
	 */
	id?: string | number | undefined;
	/** Inline styles for the separator. `flex-grow` and `flex-shrink` cannot be overridden. */
	style?: string | null | undefined;
}
