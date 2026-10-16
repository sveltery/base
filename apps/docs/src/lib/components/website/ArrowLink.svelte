<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { children, class: className, ...rest }: HTMLAnchorAttributes = $props();
</script>

<a {...rest} class={['Link', className]}>
	{@render children?.()}
	<svg
		width="20"
		height="20"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-width="1"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="Icon"
		aria-hidden="true"
	>
		<path class="LinkArrowCaret" d="M6 12L10 8L6 4" />
		<path class="LinkArrowLine" d="M2 8L13 8" />
	</svg>
</a>
