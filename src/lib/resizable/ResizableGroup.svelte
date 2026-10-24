<!--
	Wraps a set of resizable panels, laid out horizontally or vertically.
	Renders a `<div>` element.
	Derived from react-resizable-panels v4.5.8 lib/components/group/Group.tsx
	(commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { setGroupContext, type PanelStyles } from './context.js';
	import { sortByElementOffset } from './engine/components/group/sortByElementOffset.js';
	import type { Layout, RegisteredGroup } from './engine/components/group/types.js';
	import type { RegisteredPanel } from './engine/components/panel/types.js';
	import type { RegisteredSeparator } from './engine/components/separator/types.js';
	import { mountGroup } from './engine/global/mountGroup.js';
	import { eventEmitter, read } from './engine/global/mutableState.js';
	import { getImperativeGroupMethods } from './engine/global/utils/getImperativeGroupMethods.js';
	import { layoutsEqual } from './engine/global/utils/layoutsEqual.js';
	import type { ResizableGroupProps } from './types.js';

	const dynamicId = $props.id();
	let {
		children,
		defaultLayout,
		disableCursor,
		disabled,
		id: idProp,
		onLayoutChange,
		onLayoutChanged,
		orientation = 'horizontal',
		resizeTargetMinimumSize = { coarse: 20, fine: 10 },
		style,
		...rest
	}: ResizableGroupProps = $props();

	const id = $derived(`${idProp ?? dynamicId}`);

	/** The group's current layout, as a map of panel id to percentage (0..100). */
	export function getLayout() {
		return getImperativeGroupMethods({ groupId: id }).getLayout();
	}

	/** Applies a layout, a map of panel id to percentage, and returns it after validation. */
	export function setLayout(layout: Layout) {
		return getImperativeGroupMethods({ groupId: id }).setLayout(layout);
	}

	const prevLayout: { onLayoutChange: Layout; onLayoutChanged: Layout } = {
		onLayoutChange: {},
		onLayoutChanged: {}
	};

	const reportLayoutChange = (layout: Layout) => {
		if (layoutsEqual(prevLayout.onLayoutChange, layout)) return;
		prevLayout.onLayoutChange = layout;
		onLayoutChange?.(layout);
	};

	const reportLayoutChanged = (layout: Layout) => {
		if (layoutsEqual(prevLayout.onLayoutChanged, layout)) return;
		prevLayout.onLayoutChanged = layout;
		onLayoutChanged?.(layout);
	};

	let element = $state<HTMLDivElement>();
	let registrations = $state(0);
	const forceUpdate = () => untrack(() => registrations++);

	const inMemoryValues: Pick<
		RegisteredGroup,
		| 'inMemoryLastExpandedPanelSizes'
		| 'inMemoryLayouts'
		| 'panels'
		| 'resizeTargetMinimumSize'
		| 'separators'
	> = {
		inMemoryLastExpandedPanelSizes: {},
		inMemoryLayouts: {},
		panels: [],
		resizeTargetMinimumSize: untrack(() => resizeTargetMinimumSize),
		separators: []
	};

	const getPanelStyles = (groupId: string, panelId: string): PanelStyles => {
		const { interactionState, mountedGroups } = read();

		for (const group of mountedGroups.keys()) {
			if (group.id !== groupId) continue;
			const match = mountedGroups.get(group);
			if (!match) continue;
			const dragActive =
				interactionState.state === 'active' &&
				interactionState.hitRegions.some((current) => current.group === group);
			return {
				flexGrow: match.layout[panelId] ?? 1,
				pointerEvents: dragActive ? 'none' : undefined
			};
		}

		return { flexGrow: defaultLayout?.[panelId] ?? 1 };
	};

	const registerPanel = $derived.by(() => {
		const currentOrientation = orientation;
		return (panel: RegisteredPanel) => {
			inMemoryValues.panels = sortByElementOffset(currentOrientation, [
				...inMemoryValues.panels,
				panel
			]);
			forceUpdate();

			return () => {
				inMemoryValues.panels = inMemoryValues.panels.filter((current) => current !== panel);
				forceUpdate();
			};
		};
	});

	const registerSeparator = $derived.by(() => {
		const currentOrientation = orientation;
		return (separator: RegisteredSeparator) => {
			inMemoryValues.separators = sortByElementOffset(currentOrientation, [
				...inMemoryValues.separators,
				separator
			]);
			forceUpdate();

			return () => {
				inMemoryValues.separators = inMemoryValues.separators.filter(
					(current) => current !== separator
				);
				forceUpdate();
			};
		};
	});

	const hostStyle = $derived(
		`height:100%;width:100%;overflow:hidden;${style ?? ''};display:flex;flex-direction:${orientation === 'horizontal' ? 'row' : 'column'};flex-wrap:nowrap`
	);

	setGroupContext({
		getPanelStyles,
		get id() {
			return id;
		},
		get orientation() {
			return orientation;
		},
		get registerPanel() {
			return registerPanel;
		},
		get registerSeparator() {
			return registerSeparator;
		}
	});

	let registeredGroup: RegisteredGroup | null = null;

	$effect(() => {
		const host = element;
		const groupDisabled = !!disabled;
		const groupId = id;
		const groupOrientation = orientation;
		void registrations;
		if (!host) return;

		return untrack(() => {
			const group: RegisteredGroup = {
				defaultLayout,
				disableCursor: !!disableCursor,
				disabled: groupDisabled,
				element: host,
				id: groupId,
				orientation: groupOrientation,
				...inMemoryValues
			};
			registeredGroup = group;

			const unmountGroup = mountGroup(group);

			const match = read().mountedGroups.get(group);
			if (match && !match.defaultLayoutDeferred && match.derivedPanelConstraints.length > 0) {
				reportLayoutChange(match.layout);
				reportLayoutChanged(match.layout);
				inMemoryValues.panels.forEach((panel) => panel.scheduleUpdate());
			}

			let interactionActive = false;
			const removeInteractionStateChangeListener = eventEmitter.addListener(
				'interactionStateChange',
				(interactionState) => {
					const active = interactionState.state === 'active';
					if (interactionActive === active) return;
					interactionActive = active;
					inMemoryValues.panels.forEach((panel) => panel.scheduleUpdate());
				}
			);

			const removeMountedGroupsChangeListener = eventEmitter.addListener(
				'mountedGroupsChange',
				(mountedGroups) => {
					const match = mountedGroups.get(group);
					if (!match || match.defaultLayoutDeferred || match.derivedPanelConstraints.length === 0)
						return;

					reportLayoutChange(match.layout);
					if (read().interactionState.state !== 'active') reportLayoutChanged(match.layout);

					inMemoryValues.panels.forEach((panel) => panel.scheduleUpdate());
				}
			);

			return () => {
				registeredGroup = null;
				unmountGroup();
				removeInteractionStateChangeListener();
				removeMountedGroupsChangeListener();
			};
		});
	});

	$effect(() => {
		const nextDefaultLayout = defaultLayout;
		const nextDisableCursor = !!disableCursor;
		if (registeredGroup) {
			registeredGroup.defaultLayout = nextDefaultLayout;
			registeredGroup.disableCursor = nextDisableCursor;
		}
	});
</script>

<div {...rest} data-group="true" data-testid={id} {id} bind:this={element} style={hostStyle}>
	{@render children?.()}
</div>
