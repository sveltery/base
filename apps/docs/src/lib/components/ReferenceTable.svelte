<script lang="ts">
	/**
	 * A data-attribute or CSS-variable table. Narrow screens get an accordion, wide screens a table,
	 * as Base UI's `AttributesReferenceTable` and `CssVariablesReferenceTable` do.
	 */
	let { label, rows }: { label: string; rows: Array<{ name: string; description: string }> } =
		$props();
</script>

<section class="AccordionRoot ReferenceAccordionRoot ReferenceBlockSpaced min-[32rem]:hidden" style:--rows={rows.length}>
	<div class="AccordionHeaderRow" aria-hidden="true">
		<div class="AccordionHeaderCell"><span class="AccordionHeaderCellInner">{label}</span></div>
	</div>
	{#each rows as row (row.name)}
		<details class="AccordionItem">
			<summary class="AccordionTrigger">
				<code class="Code TableCode" style:color="var(--color-navy)">{row.name}</code>
				<svg class="AccordionIcon ml-auto mr-1" width="10" height="10" viewBox="0 0 10 10" fill="none">
					<path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" />
				</svg>
			</summary>
			<div class="AccordionPanel">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- mdsvex output of the page's own table. -->
				<div class="AccordionContent ReferenceCompactPanel">{@html row.description}</div>
			</div>
		</details>
	{/each}
</section>
<div class="TableRoot ReferenceTableRoot ReferenceBlockSpaced hidden min-[32rem]:block" style:--rows={rows.length}>
	<table class="TableRootTable">
		<thead class="TableHead">
			<tr class="TableRow">
				<th scope="col" class="TableColumnHeader ReferenceWideNameColumn">
					<div class="TableCellInner">{label}</div>
				</th>
				<th scope="col" class="TableColumnHeader ReferenceWideDescriptionColumn">
					<div class="TableCellInner">Description</div>
				</th>
				<th scope="col" class="TableColumnHeader w-10" aria-hidden="true">
					<div class="TableCellInner"><span class="invisible">-</span></div>
				</th>
			</tr>
		</thead>
		<tbody class="TableBody">
			{#each rows as row (row.name)}
				<tr class="TableRow">
					<th scope="row" class="TableCell">
						<div class="TableCellInner">
							<code class="Code TableCode whitespace-nowrap" style:color="var(--color-navy)">{row.name}</code>
						</div>
					</th>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- mdsvex output of the page's own table. -->
					<td class="TableCell" colspan="2"><div class="TableCellInner">{@html row.description}</div></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
