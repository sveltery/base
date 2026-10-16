<script lang="ts">
	import { inlineMarkdown } from '../../../markdown/reference.ts';
	import { releases } from '#lib/docs/releases.ts';

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
</script>

<ul class="ReleaseTimeline" aria-label="Release timeline">
	{#each releases as release, i (release.version)}
		<li class="TimelineItem">
			<article class="TimelineCard">
				<div class="TimelineCardHeader">
					<time class="TimelineDate" datetime={release.date}>
						{dateFormatter.format(new Date(release.date))}
					</time>
					<h2 class="TimelineVersion">
						<a class="TimelineVersionLink" href={release.url}>{release.version}</a>
						{#if i === 0}<span class="TimelineBadge">Latest</span>{/if}
					</h2>
				</div>
				<ul class="TimelineHighlights">
					{#each release.highlights as highlight (highlight)}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- the docs' own release notes, escaped by inlineMarkdown. -->
						<li>{@html inlineMarkdown(highlight)}</li>
					{/each}
				</ul>
			</article>
		</li>
	{/each}
</ul>
