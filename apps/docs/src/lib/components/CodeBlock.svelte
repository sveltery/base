<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	let { html, raw }: { html: string; raw: string } = $props();
</script>

<div class="code-block not-typeset relative my-5">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from repository files. -->
	{@html html}
	<CopyButton value={raw} />
</div>
