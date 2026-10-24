<!--
	The list of items, groups and other parts. Renders a `<div>` element.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Container, setContainer } from './parts.svelte.js';
	import { getCommand } from './root-state.svelte.js';
	import type { CommandListProps } from './types.js';
	import { cmdk, trackListHeight } from './utils.js';

	let { label = 'Suggestions', children, ...rest }: CommandListProps = $props();

	const root = getCommand();
	const container = new Container(root);
	setContainer(container);
</script>

<div
	{...rest}
	{...cmdk.list}
	role="listbox"
	tabindex="-1"
	aria-activedescendant={root.selectedItem?.id}
	aria-label={label}
	id={root.ids.list}
	{@attach root.observe}
>
	<div {...cmdk.listSizer} {@attach trackListHeight}>
		{@render children?.()}{#each container.parts as part (part)}{@render part.view()}{/each}
	</div>
</div>
