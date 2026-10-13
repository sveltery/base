<!--
	A menu whose items render a microtask after it opens.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
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
