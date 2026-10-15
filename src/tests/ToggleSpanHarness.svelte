<script lang="ts">
	import { Toggle } from '#lib';
	import type { ToggleProps } from '#lib/toggle/types.js';

	let props: ToggleProps = $props();
</script>

<Toggle nativeButton={false} {...props}>
	{#snippet render(hostProps)}
		<span {...hostProps}>Bold</span>
	{/snippet}
</Toggle>
