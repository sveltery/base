<!--
	Renders a toast's `string | Snippet` content: a snippet with `{@render}`, a string as text.
	Upstream renders the React node directly (packages/react/src/toast, Base UI v1.9.0,
	commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { ToastNode } from './types.js';

	let { value }: { value: ToastNode | null | undefined } = $props();
</script>

{#if typeof value === 'function'}{@render value()}{:else if value != null}{value}{/if}
