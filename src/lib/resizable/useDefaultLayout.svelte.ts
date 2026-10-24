// Derived from react-resizable-panels v4.5.8 lib/components/group/useDefaultLayout.ts
// (commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
import { ScopedTimeout } from '@sveltery/utils';
import { getStorageKey } from './engine/components/group/auto-save/getStorageKey.js';
import type { ResizableLayout, ResizableLayoutStorage } from './types.js';

export type UseDefaultLayoutOptions = {
	/**
	 * Debounce save operation by the specified number of milliseconds; defaults to 100ms
	 *
	 * @deprecated Use the `onLayoutChanged` callback instead; it does not require debouncing
	 */
	debounceSaveMs?: number;
	/**
	 * For Groups that contain conditionally-rendered Panels, this prop can be used to save and restore multiple layouts.
	 *
	 * ℹ️ This prevents layout shift for server-rendered apps.
	 *
	 * ⚠️ Panel ids must match the Panels rendered within the Group during mount or the initial layout will be incorrect.
	 */
	panelIds?: string[] | undefined;
	/** Storage implementation; supports localStorage, sessionStorage, and custom implementations. */
	storage?: ResizableLayoutStorage;
} & (
	| {
			/**
			 * Group id; must be unique in order for layouts to be saved separately.
			 * @deprecated Use the `id` param instead
			 */
			groupId: string;
	  }
	| {
			/** Uniquely identifies a specific group/layout. */
			id: string;
	  }
);

/**
 * Saves and restores group layouts between page loads, in `localStorage`, `sessionStorage`,
 * cookies, or any other storage. Call it while a component initializes.
 */
export function useDefaultLayout({
	debounceSaveMs = 100,
	panelIds,
	storage = localStorage,
	...rest
}: UseDefaultLayoutOptions) {
	const hasPanelIds = panelIds !== undefined;
	const id = 'id' in rest ? rest.id : rest.groupId;

	const defaultLayoutString = storage.getItem(getStorageKey(id, panelIds ?? []));
	const defaultLayout = defaultLayoutString
		? (JSON.parse(defaultLayoutString) as ResizableLayout)
		: undefined;

	const timeout = new ScopedTimeout();

	const onLayoutChanged = (layout: ResizableLayout) => {
		timeout.clear();

		const writeStorageKey = getStorageKey(id, hasPanelIds ? Object.keys(layout) : []);
		try {
			storage.setItem(writeStorageKey, JSON.stringify(layout));
		} catch (error) {
			console.error(error);
		}
	};

	const onLayoutChange = (layout: ResizableLayout) => {
		timeout.clear();

		if (debounceSaveMs === 0) {
			onLayoutChanged(layout);
		} else {
			timeout.start(debounceSaveMs, () => onLayoutChanged(layout));
		}
	};

	return {
		/** Pass this value to `Resizable.Group` as the `defaultLayout` prop. */
		defaultLayout,
		/**
		 * Pass this callback to `Resizable.Group` as the `onLayoutChange` prop.
		 *
		 * @deprecated Use `onLayoutChanged` instead.
		 */
		onLayoutChange,
		/** Pass this callback to `Resizable.Group` as the `onLayoutChanged` prop. */
		onLayoutChanged
	};
}
