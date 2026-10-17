<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Accordion } from '@sveltery/base/accordion';
	import ArrowLink from '#lib/components/website/ArrowLink.svelte';
	import PageMeta from '#lib/components/PageMeta.svelte';

	const description = 'Unstyled UI components for building accessible web apps and design systems.';

	const jsonLd = `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Sveltery Base',
		url: 'https://base.sveltery.dev'
	})}</${'script'}>`;

	const faq: { question: string; answer: Snippet }[] = [
		{ question: 'What is Sveltery Base?', answer: whatIs },
		{ question: 'Does Sveltery Base work with any styling library?', answer: styling },
		{ question: 'Which accessibility standards does Sveltery Base follow?', answer: a11y },
		{ question: 'How does Sveltery Base differ from Base UI?', answer: baseUi },
		{ question: 'Can I use Sveltery Base without Svelte?', answer: withoutSvelte },
		{ question: 'Is Sveltery Base free for commercial use?', answer: license },
		{ question: 'Do you offer enterprise SLAs?', answer: slas }
	];
</script>

<PageMeta
	title="Unstyled UI components for accessible design systems · Sveltery Base"
	{description}
	group="website"
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- Constant JSON built in this file. -->
	{@html jsonLd}
</svelte:head>

{#snippet whatIs()}
	<p class="Text sz-2" itemprop="text">
		Sveltery Base is a library of unstyled UI components for building accessible component
		libraries, user interfaces, web applications, and websites with Svelte. It is a Svelte port of
		Base UI. Its components are highly configurable, composable, and customizable.
	</p>
{/snippet}

{#snippet styling()}
	<p class="Text sz-2" itemprop="text">
		Yes. Sveltery Base works with Tailwind, plain CSS, Svelte's scoped styles, and any other styling
		library you prefer. It also works with plain CSS transitions. Sveltery Base is an unstyled
		component library. The package does not bundle any CSS, and does not prescribe any styling
		solution.
	</p>
{/snippet}

{#snippet a11y()}
	<p class="Text sz-2" itemprop="text">
		Sveltery Base ports Base UI's behavior, which follows
		<a class="Link" href="https://www.w3.org/WAI/ARIA/apg/patterns/"
			>ARIA Authoring Practices Guide patterns</a
		>, and complies with the
		<a class="Link" href="https://www.w3.org/TR/WCAG22/#new-features-in-wcag-2-2"
			>WCAG 2.2 standard</a
		>. Base UI is compliant with all Success Criteria levels relating to component behavior.
	</p>
{/snippet}

{#snippet baseUi()}
	<div class="flex flex-col gap-4" itemprop="text">
		<p class="Text sz-2">
			In terms of API design, both libraries are very similar. Sveltery Base keeps Base UI's
			components, parts, props, and data attributes, so Base UI's documentation and knowledge carry
			over.
		</p>
		<p class="Text sz-2">
			The differences come from Svelte. Where Svelte works differently from React, Sveltery Base
			follows Svelte's conventions instead.
		</p>
	</div>
{/snippet}

{#snippet withoutSvelte()}
	<p class="Text sz-2" itemprop="text">
		Sveltery Base is a Svelte 5 library. It is not designed to be used without Svelte. For React,
		use <a class="Link" href="https://base-ui.com">Base UI</a>.
	</p>
{/snippet}

{#snippet license()}
	<p class="Text sz-2" itemprop="text">
		Yes. Sveltery Base is licensed under the MIT license, and is free for commercial use. You are
		free to use it in your commercial projects, and to modify it to suit your needs.
	</p>
{/snippet}

{#snippet slas()}
	<p class="Text sz-2" itemprop="text">
		No. Sveltery Base does not provide Service Level Agreements, guaranteed response times, issue
		escalation, feature prioritization, or any other formal support guarantees.
	</p>
{/snippet}

<section class="contents">
	<h1 class="Text sz-3 md:sz-4 col-start-1 col-end-9 xl:col-end-5">
		Unstyled UI components for building accessible user interfaces
	</h1>
	<div class="col-start-1 col-end-9">
		<ArrowLink class="Text sz-2 inline-flex" href="/overview/quick-start">Documentation</ArrowLink>
	</div>
</section>
<section class="contents">
	<div class="col-start-1 col-end-9 flex flex-col gap-4 md:col-start-3 xl:col-end-7">
		<p class="Text sz-2">
			Sveltery&nbsp;Base is a Svelte port of Base&nbsp;UI: a comprehensive UI component library for
			building accessible user interfaces with Svelte.
		</p>
		<p class="Text sz-2">
			Each component is meticulously designed for composability, consistency, and craft. The
			library's architecture prioritizes flexibility—without imposing visual opinions—helping teams
			craft distinctive interfaces that are fundamentally accessible and reliable.
		</p>
		<p class="Text sz-2">
			Sveltery Base follows Base UI v1.9.0. It keeps the same parts, props, and behavior, and
			changes only what Svelte does differently. What you learn in one carries over to the other.
		</p>
		<p class="Text sz-2">
			Sveltery Base is built to last. It is designed with care and maintained with intent. Our
			mission is to provide a future-proof foundation for professional interface design on the Web.
		</p>
	</div>
</section>
<div class="col-start-1 col-end-9 lg:col-start-3">
	<div class="Separator" role="separator" aria-hidden="true"></div>
</div>
<section class="contents">
	<div class="col-start-1 col-end-9 md:col-end-3">
		<h2 class="Text sz-2">The fine print</h2>
	</div>
	<div class="col-start-1 col-end-9 md:col-start-3 xl:col-end-7">
		<Accordion.Root
			class="AccordionWebsiteRoot"
			itemscope
			itemtype="https://schema.org/FAQPage"
			keepMounted
		>
			{#each faq as item (item.question)}
				<Accordion.Item
					class="AccordionWebsiteItem"
					itemscope
					itemprop="mainEntity"
					itemtype="https://schema.org/Question"
				>
					<Accordion.Header class="AccordionWebsiteHeader">
						<Accordion.Trigger class="AccordionWebsiteTrigger Text sz-2" itemprop="name">
							{item.question}
							{@render plusIcon()}
							{@render minusIcon()}
						</Accordion.Trigger>
					</Accordion.Header>
					<Accordion.Panel
						class="AccordionWebsitePanel"
						itemscope
						itemprop="acceptedAnswer"
						itemtype="https://schema.org/Answer"
					>
						{@render item.answer()}
					</Accordion.Panel>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
</section>

{#snippet plusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		class="Icon AccordionWebsiteIconPlus"
		aria-hidden="true"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}

{#snippet minusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		class="Icon AccordionWebsiteIconMinus"
		aria-hidden="true"
	>
		<path d="M1.5 8h13" />
	</svg>
{/snippet}
