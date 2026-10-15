<!-- Button types its handlers for the element its render snippet names, and a snippet without a type still spreads onto any element. -->
<script lang="ts">
	import { Button } from '#lib';
	import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
</script>

{#snippet link(props: HTMLAnchorAttributes)}<a {...props} href="/docs">Docs</a>{/snippet}

<Button nativeButton={false} render={link} onclick={(event) => event.currentTarget.href} />
<Button nativeButton={false} onkeydown={(event) => event.currentTarget.align}>
	{#snippet render(props: HTMLAttributes<HTMLDivElement>)}<div {...props}>Div</div>{/snippet}
</Button>
<Button nativeButton={false}>
	{#snippet render(props)}<span {...props}>Span</span>{/snippet}
</Button>
<Button onclick={(event) => event.currentTarget.form?.requestSubmit()} />
