<script lang="ts">
	import { Resizable, type ResizableLayout } from '#lib';
	import type { ResizableCase } from './cases.js';

	let { scenario }: { scenario: ResizableCase } = $props();

	const orientation = $derived(scenario === 'vertical' ? 'vertical' : 'horizontal');
	let panel = $state<ReturnType<typeof Resizable.Panel>>();
	let settled = $state<ResizableLayout>({});
</script>

<div style="width: 600px; height: 600px">
	<Resizable.Group
		id="group"
		{orientation}
		disabled={scenario === 'disabled'}
		onLayoutChanged={(layout) => (settled = layout)}
	>
		<Resizable.Panel
			bind:this={panel}
			id="first"
			defaultSize="30%"
			minSize="10%"
			collapsible={scenario === 'collapsible'}>First</Resizable.Panel
		>
		<Resizable.Separator id="separator" style="width: 8px; height: 8px; background: gray" />
		<Resizable.Panel id="second" minSize="20%">Second</Resizable.Panel>
	</Resizable.Group>
</div>
<output data-testid="layout">{JSON.stringify(settled)}</output>
<button type="button" onclick={() => panel?.collapse()}>Collapse</button>
<button type="button" onclick={() => panel?.expand()}>Expand</button>
<button type="button" onclick={() => panel?.resize('50%')}>Half</button>
