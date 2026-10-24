<!--
	The element that holds a group's items. Renders a `<div>` element.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { cmdk } from './utils.js';
	import { untrack, type Snippet } from 'svelte';
	import { setGroup, type GroupModel } from './item-state.svelte.js';
	import { setContainer } from './parts.svelte.js';

	const props: {
		group: GroupModel;
		labelledby: string | undefined;
		children: Snippet | undefined;
	} = $props();

	const group = untrack(() => props.group);
	setGroup(group);
	setContainer(group.items);
</script>

<div {...cmdk.groupItems} role="group" aria-labelledby={props.labelledby}>
	{@render props.children?.()}{#each group.items.parts as part (part)}{@render part.view()}{/each}
</div>
