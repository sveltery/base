<!--
	Derived from Base UI v1.9.0 packages/react/src/internals/PrehydrationScript.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { useCSPContext } from './csp-context.js';

	let { script }: { script: string } = $props();

	const csp = useCSPContext();
	let hydrating = $state(true);

	onMount(() => {
		hydrating = false;
	});

	const nonce = $derived(
		csp.nonce == null
			? ''
			: ` nonce="${csp.nonce.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`
	);
</script>

{#if hydrating}
	<!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -- a hydration-time warning -->
	<!-- svelte-ignore hydration_html_changed -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script${nonce}>${script}</script>`}
{/if}
