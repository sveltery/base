<!--
	Renders its children a microtask after it mounts.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let ready = $state(false);

	onMount(() => queueMicrotask(() => (ready = true)));
</script>

{#if ready}{@render children()}{/if}
