<script lang="ts">
	import { Menu } from '#lib';
	import RenderNextMicrotask from './RenderNextMicrotask.svelte';
</script>

<Menu.Root>
	<Menu.Trigger data-testid="trigger">Open</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				<RenderNextMicrotask>
					<Menu.Item>One</Menu.Item>
					<Menu.Item>Two</Menu.Item>
				</RenderNextMicrotask>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
