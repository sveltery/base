<!--
	Derived from Base UI v1.9.0 packages/react/src/utils/styles.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Svelte has no per-render dedupe on the server, so each instance server-renders its own head copy.
	Once `node` mounts, every instance shares one hoisted element in its root and drops its copy.
-->
<script lang="ts">
	import { useCSPContext } from './csp-context.js';
	import {
		DISABLE_SCROLLBAR_CSS,
		hoistDisableScrollbarStyle,
		isDisableScrollbarStyleHoisted
	} from './styles.js';

	let { node }: { node: Node | null | undefined } = $props();

	const csp = useCSPContext();
	let hoisted = $state(isDisableScrollbarStyleHoisted());

	$effect(() => {
		if (!node || csp.disableStyleElements === true) return;
		hoistDisableScrollbarStyle(node, csp.nonce);
		hoisted = true;
	});
</script>

<svelte:head>
	{#if !hoisted && csp.disableStyleElements !== true}
		<svelte:element this={"style"} nonce={csp.nonce}>{DISABLE_SCROLLBAR_CSS}</svelte:element>
	{/if}
</svelte:head>
