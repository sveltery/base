<script lang="ts">
	import { Menu } from '#lib';

	let { mode }: { mode: 'element' | 'function' | 'virtual' | 'null-function' | 'toggle' } =
		$props();

	let anchorEl = $state<HTMLDivElement | null>(null);
	let useAnchor = $state(true);
	const virtual = {
		getBoundingClientRect: () => new DOMRect(200, 100, 0, 0)
	};

	const anchor = $derived.by(() => {
		if (mode === 'virtual') return virtual;
		if (mode === 'function') return () => anchorEl;
		if (mode === 'null-function') return () => null;
		if (mode === 'toggle') return useAnchor ? anchorEl : undefined;
		return anchorEl;
	});
</script>

<div style="margin: 50px">
	<button type="button" onclick={() => (useAnchor = false)}>undefined</button>
	<button type="button" onclick={() => (useAnchor = true)}>ref</button>
	<!-- Stays open like the upstream controlled root that ignores close requests. -->
	<Menu.Root
		open
		modal={false}
		onOpenChange={(next, details) => {
			if (!next) details.cancel();
		}}
	>
		<Menu.Trigger>trigger</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner
				side="bottom"
				align="start"
				{anchor}
				arrowPadding={0}
				data-testid="positioner"
			>
				<Menu.Popup>
					<Menu.Item>1</Menu.Item>
					<Menu.Item>2</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
	<div
		data-testid="anchor"
		style="margin-top: 100px; width: 10px; height: 10px"
		bind:this={anchorEl}
	></div>
</div>
