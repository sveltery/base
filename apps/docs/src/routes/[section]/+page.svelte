<script lang="ts">
	import { slugify } from '../../../markdown/headings.ts';
	import Toc from '#lib/components/Toc.svelte';
	import '#lib/docs/css/index.css';

	let { data } = $props();

	type Heading = { title: string; children: string[] };

	const pages = $derived(
		data.section.pages.map((page) => ({
			...page,
			id: slugify(page.title),
			outline: page.toc.reduce<Heading[]>((list, item) => {
				if (item.depth > 2 && list.length) list.at(-1)!.children.push(item.title);
				else list.push({ title: item.title, children: [] });
				return list;
			}, [])
		}))
	);
	const toc = $derived(pages.map((page) => ({ title: page.title, url: `#${page.id}`, depth: 2 })));
</script>

<svelte:head>
	<title>{data.section.title} · Sveltery Base</title>
</svelte:head>

<!-- Base UI generates each section's index from its pages: a list, then each page's outline. -->
<Toc title={data.section.title} {toc} />
<div class="QuickNavContent">
	<h1 class="MdH1">{data.section.title}</h1>
	<ul class="MdUl">
		{#each pages as page (page.href)}
			<li class="MdListItem">
				{page.title} — (<a class="Link" href="#{page.id}">Outline</a>,
				<a class="Link" href={page.href}>Contents</a>)
			</li>
		{/each}
	</ul>
	{#each pages as page (page.href)}
		<h2 class="MdH2" id={page.id}><a class="HeadingLink" href="#{page.id}">{page.title}</a></h2>
		<p class="MdP">{page.description}</p>
		{#if page.outline.length}
			<details>
				<summary>Outline</summary>
				<ul class="MdUl">
					<li class="MdListItem">
						Sections:
						<ul class="MdUl">
							{#each page.outline as heading (heading.title)}
								<li class="MdListItem">
									{heading.title}
									{#if heading.children.length}
										<ul class="MdUl">
											{#each heading.children as child (child)}<li class="MdListItem">
													{child}
												</li>{/each}
										</ul>
									{/if}
								</li>
							{/each}
						</ul>
					</li>
				</ul>
			</details>
		{/if}
		<p class="MdP"><a class="Link" href={page.href}>Read more</a></p>
	{/each}
</div>

<style>
	.QuickNavContent {
		padding-top: 1.5rem;
		padding-bottom: 4rem;

		@media (width >= 64rem) {
			padding-top: 0;
		}
	}
</style>
