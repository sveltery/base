<!--
	Marks where a part is written, while its element renders in its List or Group.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { ANCHOR_PREFIX, type Part } from './parts.svelte.js';

	const { part }: { part: Part } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- a comment around the part's own $props.id() -->
{@html `<!--${ANCHOR_PREFIX}${part.anchor}-->`}
