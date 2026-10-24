<!--
	A group of items with an optional heading. Renders a `<div>` element.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { cmdk } from './utils.js';
	import PartAnchor from './PartAnchor.svelte';
	import CommandGroupItems from './CommandGroupItems.svelte';
	import { GroupModel } from './item-state.svelte.js';
	import { usePart } from './parts.svelte.js';
	import { getCommand } from './root-state.svelte.js';
	import type { CommandGroupProps } from './types.js';

	let { heading, value, forceMount = false, children, ...rest }: CommandGroupProps = $props();

	const anchor = $props.id();
	const headingId = `${anchor}-heading`;
	const root = getCommand();
	const group = new GroupModel(root, {
		anchor,
		view,
		get forceMount() {
			return forceMount;
		}
	});
	const container = usePart(root, group, () => root.registerGroup(group));
</script>

{#snippet view()}
	<div
		{...rest}
		{...cmdk.group}
		role="presentation"
		data-value={value?.trim() ??
			(typeof heading === 'string' ? heading.trim() : group.headingElement?.textContent?.trim())}
		hidden={group.hidden}
	>
		{#if heading}
			<div {...cmdk.groupHeading} aria-hidden="true" id={headingId} {@attach group.attachHeading}>
				{#if typeof heading === 'string'}{heading}{:else}{@render heading()}{/if}
			</div>
		{/if}<CommandGroupItems {group} labelledby={heading ? headingId : undefined} {children} />
	</div>
{/snippet}

<PartAnchor part={group} />{#if !container}{@render view()}{/if}
