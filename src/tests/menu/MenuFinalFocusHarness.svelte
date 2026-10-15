<!--
	A hover-opening menu whose `finalFocus` records each call and returns an outside button.
-->
<script lang="ts">
	import { Menu } from '#lib';
	let { calls }: { calls: string[] } = $props();
	let target = $state<HTMLButtonElement>();
</script>

<button bind:this={target} data-testid="target">Target</button>
<Menu.Root>
	<Menu.Trigger data-testid="trigger" openOnHover delay={0}>Open</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup
				data-testid="popup"
				finalFocus={(closeType) => {
					calls.push(closeType);
					return target ?? null;
				}}
			>
				<Menu.Item data-testid="item">One</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
