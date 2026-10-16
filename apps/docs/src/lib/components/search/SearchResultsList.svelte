<script lang="ts" module>
	export type SearchResultsClasses = {
		list: string;
		group: string;
		groupLabel: string;
		item: string;
		breadcrumbText?: string;
		breadcrumbPart: string;
		breadcrumbPartLast?: string;
		separator: string;
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { groupLabel, type SearchDocument, type SearchGroup } from './search.svelte.ts';

	let {
		results,
		classes,
		separator,
		onNavigate
	}: {
		results: SearchGroup[];
		classes: SearchResultsClasses;
		separator: 'filled' | 'stroked';
		onNavigate: () => void;
	} = $props();

	const isUnmodifiedLeftClick = (event: MouseEvent) =>
		!event.defaultPrevented &&
		event.button === 0 &&
		!event.altKey &&
		!event.ctrlKey &&
		!event.metaKey &&
		!event.shiftKey;
</script>

<Autocomplete.List class={classes.list}>
	{#each results as group (group.group)}
		<Autocomplete.Group items={group.items} class={classes.group}>
			<Autocomplete.GroupLabel class={classes.groupLabel}>
				{groupLabel(group.group)}
			</Autocomplete.GroupLabel>
			<Autocomplete.Collection>
				{#snippet children(result: SearchDocument)}
					<Autocomplete.Item value={result} class={classes.item}>
						{#snippet render(props, _state, children)}
							<a
								{...props as unknown as HTMLAttributes<HTMLAnchorElement>}
								href={result.url}
								tabindex={-1}
								onclickcapture={(event) => {
									if (isUnmodifiedLeftClick(event)) onNavigate();
								}}
							>
								{@render children?.()}
							</a>
						{/snippet}
						{#if classes.breadcrumbText}
							<span class={classes.breadcrumbText}>{@render breadcrumb(result)}</span>
						{:else}
							{@render breadcrumb(result)}
						{/if}
					</Autocomplete.Item>
				{/snippet}
			</Autocomplete.Collection>
		</Autocomplete.Group>
	{/each}
</Autocomplete.List>

{#snippet breadcrumb(result: SearchDocument)}
	{@const parts = result.title.split(' ‣ ')}
	{#each parts as part, index (index)}
		{@const last = index === parts.length - 1}
		<span class={[classes.breadcrumbPart, last && classes.breadcrumbPartLast]}>{part}</span>
		{#if !last}
			{#if separator === 'stroked'}
				<svg
					class={classes.separator}
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 16 16"
					aria-hidden="true"
				>
					<path
						d="M6.5 3.5 11 8l-4.5 4.5"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{:else}
				<svg
					class={classes.separator}
					width="16"
					height="16"
					fill="none"
					viewBox="0 0 16 16"
					aria-hidden="true"
				>
					<path
						fill="currentColor"
						fill-rule="evenodd"
						d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		{/if}
	{/each}
{/snippet}
