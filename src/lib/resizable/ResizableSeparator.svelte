<!--
	A focusable handle between two panels that resizes them with the pointer and the keyboard.
	Renders a `<div>` element.
	Derived from react-resizable-panels v4.5.8 lib/components/separator/Separator.tsx
	(commit 119437b6a973c10b6513613eb9453fc9fb850259). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { useGroupContext } from './context.js';
	import type { RegisteredSeparator } from './engine/components/separator/types.js';
	import { eventEmitter } from './engine/global/mutableState.js';
	import type { InteractionState } from './engine/global/types.js';
	import { calculateSeparatorAriaValues } from './engine/global/utils/calculateSeparatorAriaValues.js';
	import type { ResizableSeparatorProps } from './types.js';

	const dynamicId = $props.id();
	let { children, id: idProp, style, ...rest }: ResizableSeparatorProps = $props();

	const id = $derived(`${idProp ?? dynamicId}`);

	let element = $state<HTMLDivElement>();
	let aria = $state.raw<Partial<ReturnType<typeof calculateSeparatorAriaValues>>>({});
	let dragState = $state<InteractionState['state']>('inactive');

	const context = useGroupContext();

	const orientation = $derived(context.orientation === 'horizontal' ? 'vertical' : 'horizontal');

	$effect(() => {
		const host = element;
		const groupId = context.id;
		const separatorId = id;
		const registerSeparator = context.registerSeparator;
		if (!host) return;

		return untrack(() => {
			const separator: RegisteredSeparator = { element: host, id: separatorId };

			const unregisterSeparator = registerSeparator(separator);

			const removeInteractionStateChangeListener = eventEmitter.addListener(
				'interactionStateChange',
				(interactionState) => {
					dragState =
						interactionState.state !== 'inactive' &&
						interactionState.hitRegions.some((hitRegion) => hitRegion.separator === separator)
							? interactionState.state
							: 'inactive';
				}
			);

			const removeMountedGroupsChangeListener = eventEmitter.addListener(
				'mountedGroupsChange',
				(mountedGroups) => {
					mountedGroups.forEach(
						({ derivedPanelConstraints, layout, separatorToPanels }, mountedGroup) => {
							if (mountedGroup.id !== groupId) return;
							const panels = separatorToPanels.get(separator);
							if (!panels) return;
							const primaryPanel = panels[0];
							aria = calculateSeparatorAriaValues({
								layout,
								panelConstraints: derivedPanelConstraints,
								panelId: primaryPanel.id,
								panelIndex: mountedGroup.panels.indexOf(primaryPanel)
							});
						}
					);
				}
			);

			return () => {
				removeInteractionStateChangeListener();
				removeMountedGroupsChangeListener();
				unregisterSeparator();
			};
		});
	});
</script>

<!-- A window splitter is interactive: it takes focus and the arrow keys. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...rest}
	aria-controls={aria.valueControls}
	aria-orientation={orientation}
	aria-valuemax={aria.valueMax}
	aria-valuemin={aria.valueMin}
	aria-valuenow={aria.valueNow}
	data-separator={dragState}
	data-testid={id}
	{id}
	bind:this={element}
	role="separator"
	style="flex-basis:auto;{style ?? ''};flex-grow:0;flex-shrink:0"
	tabindex={0}
>
	{@render children?.()}
</div>
