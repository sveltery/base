<!--
	Provides a shared context for coordinating global Drawer UI, such as indent/background effects based on whether any Drawer is open.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/provider/DrawerProvider.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { DrawerProviderState, setDrawerProvider } from './context.svelte.js';
	import type { DrawerProviderProps } from './types.js';

	let { children }: DrawerProviderProps = $props();

	setDrawerProvider(new DrawerProviderState());
</script>

{@render children?.()}
