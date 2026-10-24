<!--
	Wraps resizable content, with optional size constraints and collapsible behavior.
	Renders a `<div>` element.
	Derived from react-resizable-panels v4.5.8 lib/components/panel/Panel.tsx
	(commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { useGroupContext } from './context.js';
	import type { PanelSize } from './engine/components/panel/types.js';
	import { getImperativePanelMethods } from './engine/global/utils/getImperativePanelMethods.js';
	import type { ResizablePanelProps } from './types.js';

	const dynamicId = $props.id();
	let {
		children,
		class: className,
		collapsedSize = '0%',
		collapsible = false,
		defaultSize,
		id: idProp,
		maxSize = '100%',
		minSize = '0%',
		onResize,
		style,
		...rest
	}: ResizablePanelProps = $props();

	const idIsStable = $derived(!!idProp);
	const id = $derived(`${idProp ?? dynamicId}`);

	const context = useGroupContext();
	const methods = () => getImperativePanelMethods({ groupId: context.id, panelId: id });

	/** Collapses the panel to its `collapsedSize`, if it is collapsible and not collapsed. */
	export function collapse() {
		methods().collapse();
	}

	/** Expands a collapsed panel to its most recent size. */
	export function expand() {
		methods().expand();
	}

	/** The panel's size as a percentage of its group (0..100) and in pixels. */
	export function getSize() {
		return methods().getSize();
	}

	/** Whether the panel is collapsed. */
	export function isCollapsed() {
		return methods().isCollapsed();
	}

	/**
	 * Resizes the panel. A number is pixels. A string takes a unit (`%`, `px`, `em`, `rem`, `vh`
	 * or `vw`), and a string without one is a percentage.
	 */
	export function resize(size: number | string) {
		methods().resize(size);
	}

	let element = $state<HTMLDivElement>();
	let updates = $state(0);
	const forceUpdate = () => untrack(() => updates++);

	const hasOnResize = $derived(onResize !== null);
	const reportResize = (
		panelSize: PanelSize,
		_: string | number | undefined,
		prevPanelSize: PanelSize | undefined
	) => {
		onResize?.(panelSize, idProp, prevPanelSize);
	};

	$effect(() => {
		const host = element;
		const panel = {
			id,
			idIsStable,
			mutableValues: {
				expandToSize: undefined,
				prevSize: undefined
			},
			onResize: hasOnResize ? reportResize : undefined,
			panelConstraints: {
				collapsedSize,
				collapsible,
				defaultSize,
				maxSize,
				minSize
			},
			scheduleUpdate: forceUpdate
		};
		const registerPanel = context.registerPanel;
		if (host) return untrack(() => registerPanel({ element: host, ...panel }));
	});

	const panelStyles = $derived.by(() => {
		void updates;
		return context.getPanelStyles(context.id, id);
	});
</script>

<div
	{...rest}
	data-panel="true"
	data-testid={id}
	{id}
	bind:this={element}
	style="min-height:0;max-height:100%;height:auto;min-width:0;max-width:100%;width:auto;border:none;border-width:0;padding:0;margin:0;display:flex;flex-basis:0;flex-shrink:1;overflow:hidden;flex-grow:{panelStyles.flexGrow}{panelStyles.pointerEvents
		? `;pointer-events:${panelStyles.pointerEvents}`
		: ''}"
>
	<div class={className} style="max-height:100%;max-width:100%;flex-grow:1;{style ?? ''}">
		{@render children?.()}
	</div>
</div>
