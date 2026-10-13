<script lang="ts">
	import type { ApiPart, ApiProp } from '../../../markdown/api.ts';

	let { part }: { part: ApiPart } = $props();

	const escape = (value: string) =>
		value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	/** Doc comments use markdown code spans and nothing else. */
	const inline = (value: string) => escape(value).replace(/`([^`]+)`/g, '<code>$1</code>');
</script>

{#snippet table(rows: ApiProp[], label: string, withDefault: boolean)}
	<div class="not-typeset my-4 overflow-x-auto rounded-lg border border-line">
		<table class="api-table w-full text-sm">
			<thead>
				<tr>
					<th scope="col">{label}</th>
					<th scope="col">Type</th>
					{#if withDefault}<th scope="col">Default</th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.name)}
					<tr class={row.description ? 'has-description' : ''}>
						<th scope="row">
							<code class="name">{row.name}</code>
							{#if row.bindable}<span class="badge" title="Supports bind:{row.name}">bindable</span
								>{/if}
						</th>
						<td><code class="type">{row.type}</code></td>
						{#if withDefault}<td><code class="default">{row.default ?? '-'}</code></td>{/if}
					</tr>
					{#if row.description}
						<tr class="description">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- inline() escapes the doc comment first. -->
							<td colspan={withDefault ? 3 : 2}>{@html inline(row.description)}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

{#if part.description}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- inline() escapes the doc comment first. -->
	<p>{@html inline(part.description)}</p>
{/if}
{#if part.props.length}
	{@render table(part.props, 'Prop', true)}
{:else}
	<p class="text-muted">
		{part.element
			? "This part takes no props beyond its element's HTML attributes."
			: 'This part takes no props.'}
	</p>
{/if}
{#if part.state.length}
	<details class="not-typeset my-4 text-sm">
		<summary class="cursor-pointer text-muted hover:text-fg">State</summary>
		<p class="my-3">
			{#if part.props.some((prop) => prop.name === 'render')}
				The <code>render</code> snippet receives this state as its second argument.
			{:else}
				The part tracks this state.
			{/if}
		</p>
		{@render table(part.state, 'State', false)}
	</details>
{/if}
