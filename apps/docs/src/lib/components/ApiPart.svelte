<script lang="ts">
	import type { ReferencePart, ReferenceRow } from '../../../markdown/reference.ts';

	let { part }: { part: ReferencePart } = $props();

	// Base UI's anchors: `Checkbox.Root`'s `indeterminate` prop is `#CheckboxRoot-indeterminate`.
	const anchor = (row: ReferenceRow) => `${part.name.replace('.', '')}-${row.name}`;
	let root = $state<HTMLElement>();

	// Chrome opens a `<details>` whose summary the URL hash names. Other browsers need this.
	$effect(() => {
		const openTarget = () => {
			const summary = root?.querySelector(`summary[id="${CSS.escape(location.hash.slice(1))}"]`);
			if (summary?.parentElement instanceof HTMLDetailsElement) summary.parentElement.open = true;
		};
		openTarget();
		window.addEventListener('hashchange', openTarget);
		return () => window.removeEventListener('hashchange', openTarget);
	});

	/** Stops a click that ends a text selection from toggling the row, as Base UI does. */
	function keepSelection(event: MouseEvent) {
		if (!window.getSelection()?.isCollapsed) event.preventDefault();
	}
</script>

{#snippet chevron()}
	<svg class="AccordionIcon ReferenceIcon" width="10" height="10" viewBox="0 0 10 10" fill="none">
		<path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" />
	</svg>
{/snippet}

{#snippet accordion(rows: ReferenceRow[], label: string, state: boolean)}
	<section
		class="AccordionRoot ReferenceAccordionRoot ReferenceBlockSpaced"
		data-hide-default={state || undefined}
		style:--rows={rows.length}
		aria-label="{label}s"
	>
		<div class="AccordionHeaderRow ReferenceHeaderRow" aria-hidden="true">
			<div class="AccordionHeaderCell"><span class="AccordionHeaderCellInner">{label}</span></div>
			<div class="AccordionHeaderCell ReferenceHeaderTypeCell">
				<span class="AccordionHeaderCellInner">Type</span>
			</div>
			{#if !state}
				<div class="AccordionHeaderCell ReferenceHeaderDefaultCell">
					<span class="AccordionHeaderCellInner">Default</span>
				</div>
			{/if}
			<div class="AccordionHeaderCell ReferenceHeaderIconCell">
				<span class="AccordionHeaderCellInner"></span>
			</div>
		</div>
		{#each rows as row (row.name)}
			{@const id = state ? undefined : anchor(row)}
			{@const required = !state && row.required}
			<details class="AccordionItem">
				<summary
					{id}
					class="AccordionTrigger ReferenceTrigger"
					aria-label="{label}: {row.name},{required ? ' required,' : ''} type: {row.shortType.replace(
						/<[^>]+>/g,
						''
					)}"
					onclick={keepSelection}
				>
					<span class="AccordionScrollable ReferenceNameCell">
						<span class="AccordionScrollableInner">
							<code class="Code TableCode whitespace-nowrap" style:color="var(--color-navy)">
								{row.name}{#if required}<sup class="ReferenceRequired">*</sup>{/if}
							</code>
						</span>
					</span>
					<span class="AccordionScrollable ReferenceTypeCell">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from the library's types. -->
						<span class="AccordionScrollableInner"><code class="Code TableCode">{@html row.shortType}</code></span>
					</span>
					{#if !state}
						<span class="AccordionScrollable ReferenceDefaultCell">
							<span class="AccordionScrollableInner">
								{#if row.default === undefined}
									<code class="Code TableCode" style:color="var(--color-docs-infra-syntax-nullish)">—</code>
								{:else}
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from the library's defaults. -->
									<code class="Code TableCode">{@html row.default}</code>
								{/if}
							</span>
						</span>
					{/if}
					<span class="ReferenceIconWrap">{@render chevron()}</span>
				</summary>
				<div class="AccordionPanel">
					<div class="AccordionContent">
						<dl class="DescriptionList ReferenceContent" aria-label="Info">
							<div class="DescriptionListItem">
								<dt class="DescriptionTerm"><div class="DescriptionListInner">Name</div></dt>
								<dd class="DescriptionListDetails">
									<div class="DescriptionListInner">
										{#if id}
											<a class="Link" href="#{id}">
												<code class="Code TableCode" style:color="var(--color-blue)">{row.name}</code>
											</a>
										{:else}
											<code class="Code TableCode" style:color="var(--color-blue)">{row.name}</code>
										{/if}
									</div>
								</dd>
							</div>
							{#if row.description}
								<div class="DescriptionListItem">
									<dt class="DescriptionTerm separator">
										<div class="DescriptionListInner">Description</div>
									</dt>
									<dd class="DescriptionListDetails ReferenceDescription">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -- reference.ts escapes the doc comment first. -->
										<div class="DescriptionListInner">{@html row.description}</div>
									</dd>
								</div>
							{/if}
							<div class="DescriptionListItem">
								<dt class="DescriptionTerm separator"><div class="DescriptionListInner">Type</div></dt>
								<dd class="DescriptionListDetails">
									<div class="DescriptionListInner">
										<div class="CodeBlockRoot">
											<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from the library's types. -->
											<code class="Code">{@html row.type}</code>
										</div>
									</div>
								</dd>
							</div>
							{#if !state && row.default !== undefined}
								<div class="DescriptionListItem">
									<dt class="DescriptionTerm separator">
										<div class="DescriptionListInner">Default</div>
									</dt>
									<dd class="DescriptionListDetails">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from the library's defaults. -->
										<div class="DescriptionListInner"><code class="Code TableCode">{@html row.default}</code></div>
									</dd>
								</div>
							{/if}
							{#if row.bindable}
								<div class="DescriptionListItem">
									<dt class="DescriptionTerm separator">
										<div class="DescriptionListInner">Binding</div>
									</dt>
									<dd class="DescriptionListDetails">
										<div class="DescriptionListInner">
											<code class="Code TableCode">bind:{row.name}</code>
										</div>
									</dd>
								</div>
							{/if}
						</dl>
					</div>
				</div>
			</details>
		{/each}
	</section>
{/snippet}

<div bind:this={root} class="MdReferencePart">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- reference.ts escapes the doc comment first. -->
	{@html part.description}
	{#if part.props.length}
		{@render accordion(part.props, 'Prop', false)}
	{:else if part.empty}
		<p class="MdP">{part.empty}</p>
	{/if}
	{#if part.state.length}
		{@render accordion(part.state, 'State', true)}
	{/if}
</div>
