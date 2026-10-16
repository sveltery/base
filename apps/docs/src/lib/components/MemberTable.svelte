<script lang="ts">
	import type { MemberTable } from '../../../markdown/members.ts';

	/**
	 * A properties, parameters or methods table of a handle or function, as Base UI's
	 * `PropertiesReferenceAccordion`, `ParametersReferenceTable` and `MethodsReferenceAccordion` show it.
	 */
	let { table }: { table: MemberTable } = $props();

	const method = $derived(table.label === 'Method');
	const extra = $derived(table.extra);

	function keepSelection(event: MouseEvent) {
		if (!window.getSelection()?.isCollapsed) event.preventDefault();
	}
</script>

{#snippet chevron()}
	<svg class="AccordionIcon ReferenceIcon" width="10" height="10" viewBox="0 0 10 10" fill="none">
		<path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" />
	</svg>
{/snippet}

{#snippet item(term: string, separator: boolean, html: string)}
	<div class="DescriptionListItem">
		<dt class="DescriptionTerm" class:separator><div class="DescriptionListInner">{term}</div></dt>
		<dd class="DescriptionListDetails" class:ReferenceDescription={term === 'Description'}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- the page's own table cells, or Shiki output. -->
			<div class="DescriptionListInner">{@html html}</div>
		</dd>
	</div>
{/snippet}

<section
	class="AccordionRoot ReferenceAccordionRoot ReferenceBlock"
	data-hide-default={!method && !extra ? '' : undefined}
	style:--rows={table.rows.length}
	aria-label="{table.label}s"
>
	<div
		class="AccordionHeaderRow"
		class:ReferenceHeaderRow={!method}
		class:MethodsHeaderRow={method}
		aria-hidden="true"
	>
		<div class="AccordionHeaderCell">
			<span class="AccordionHeaderCellInner">{table.label}</span>
		</div>
		<div class="AccordionHeaderCell ReferenceHeaderTypeCell">
			<span class="AccordionHeaderCellInner">{method ? 'Returns' : 'Type'}</span>
		</div>
		{#if extra}
			<div
				class="AccordionHeaderCell ReferenceHeaderDefaultCell"
				class:PropertiesHeaderModifiersCell={extra === 'Modifiers'}
			>
				<span class="AccordionHeaderCellInner">{extra}</span>
			</div>
		{/if}
		<div class="AccordionHeaderCell ReferenceHeaderIconCell">
			<span class="AccordionHeaderCellInner"></span>
		</div>
	</div>
	{#each table.rows as row (row.name)}
		<details class="AccordionItem">
			<summary
				class="AccordionTrigger"
				class:ReferenceTrigger={!method}
				class:MethodsTrigger={method}
				aria-label="{table.label}: {row.name}"
				onclick={keepSelection}
			>
				<span class="AccordionScrollable ReferenceNameCell">
					<span class="AccordionScrollableInner">
						{#if method}
							<code class="Code TableCode"
								><span class="pl-en">{row.name}</span
								>({#each row.params as param, i (param.name)}{#if i},
									{/if}<span class="pl-v">{param.name}</span
									>{#if param.optional}?{/if}{/each})</code
							>
						{:else}
							<code class="Code TableCode whitespace-nowrap" style:color="var(--color-navy)"
								>{row.name}</code
							>
						{/if}
					</span>
				</span>
				<span class="AccordionScrollable ReferenceTypeCell">
					<span class="AccordionScrollableInner">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output of the page's own table. -->
						<code class="Code TableCode">{@html row.shortType}</code>
					</span>
				</span>
				{#if extra}
					<span class="AccordionScrollable ReferenceDefaultCell">
						<span class="AccordionScrollableInner">
							{#if row.extra}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output of the page's own table. -->
								<code class="Code TableCode">{@html row.extra}</code>
							{:else}
								<code class="Code TableCode" style:color="var(--color-docs-infra-syntax-nullish)"
									>—</code
								>
							{/if}
						</span>
					</span>
				{/if}
				<span class="ReferenceIconWrap">{@render chevron()}</span>
			</summary>
			<div class="AccordionPanel">
				<div class="AccordionContent">
					<dl class="DescriptionList ReferenceContent" aria-label="Info">
						{@render item(
							'Name',
							false,
							`<code class="Code TableCode" style="color:var(--color-blue)">${row.name}</code>`
						)}
						{#if row.description}
							{@render item('Description', true, row.description)}
						{/if}
						{#if method && row.params.length}
							<div class="DescriptionListItem">
								<dt class="DescriptionTerm separator">
									<div class="DescriptionListInner">Parameters</div>
								</dt>
								<dd class="DescriptionListDetails">
									<div class="DescriptionListInner">
										<ul class="MethodParamList">
											{#each row.params as param (param.name)}
												<li>
													<div class="MethodParamRow">
														<code
															class="Code TableCode whitespace-nowrap"
															style:color="var(--color-navy)"
															>{param.name}{#if param.optional}?{/if}</code
														>
														<span class="MethodParamSep">—</span>
														<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output of the page's own table. -->
														<code class="Code TableCode">{@html param.type}</code>
													</div>
												</li>
											{/each}
										</ul>
									</div>
								</dd>
							</div>
						{/if}
						{@render item(
							method ? 'Returns' : 'Type',
							true,
							`<code class="Code TableCode">${row.type}</code>`
						)}
						{#if row.extra}
							{@render item(extra!, true, `<code class="Code TableCode">${row.extra}</code>`)}
						{/if}
					</dl>
				</div>
			</div>
		</details>
	{/each}
</section>
