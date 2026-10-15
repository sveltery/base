<!-- expect-error: Property 'form' does not exist on type 'EventTarget & NoInfer<HTMLAnchorElement>' -->
<!-- A handler on a Button rendered as a link cannot read button-only properties. -->
<script lang="ts">
	import { Button } from '#lib';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
</script>

{#snippet link(props: HTMLAnchorAttributes)}<a {...props} href="/docs">Docs</a>{/snippet}

<Button nativeButton={false} render={link} onclick={(event) => event.currentTarget.form} />
