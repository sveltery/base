<script lang="ts">
	import { Resizable } from '#lib';

	let {
		onGroupElement
	}: {
		onGroupElement?: (element: HTMLElement) => void;
	} = $props();

	let group = $state<ReturnType<typeof Resizable.Group>>();
	let panel = $state<ReturnType<typeof Resizable.Panel>>();
	let changes = $state<string[]>([]);

	export function groupApi() {
		return group!;
	}
	export function panelApi() {
		return panel!;
	}
	export function changeLog() {
		return changes;
	}
</script>

<div style="width: 1000px; height: 200px">
	<Resizable.Group
		bind:this={group}
		id="horizontal"
		class="horizontal"
		onLayoutChanged={(next) => changes.push(JSON.stringify(next))}
		{@attach (element) => onGroupElement?.(element)}
	>
		<Resizable.Panel
			bind:this={panel}
			id="left"
			defaultSize="30%"
			minSize="10%"
			collapsible
			class="left">Left</Resizable.Panel
		>
		<Resizable.Separator id="handle" />
		<Resizable.Panel id="right" defaultSize="70%" minSize="20%">Right</Resizable.Panel>
	</Resizable.Group>
</div>
<div style="width: 200px; height: 1000px">
	<Resizable.Group id="vertical" orientation="vertical">
		<Resizable.Panel id="top" defaultSize="25%">Top</Resizable.Panel>
		<Resizable.Separator id="vertical-handle" />
		<Resizable.Panel id="bottom" defaultSize="75%">Bottom</Resizable.Panel>
	</Resizable.Group>
</div>
