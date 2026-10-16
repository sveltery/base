<script module lang="ts">
	export { checkIcon, copyIcon, externalLinkIcon, markdownIcon, moreVertIcon };
</script>

{#snippet copyIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
		<path stroke-linecap="square" d="M1.5 1.5h10v10h-10z" />
		<path stroke-linecap="square" d="M4.5 11.5h-3v-10h10v3" />
		<path d="M12 4.5h2.5v10h-10V12" />
	</svg>
{/snippet}

{#snippet checkIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

{#snippet markdownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path
			d="M14.846 12.9233H1.154a1.153 1.153 0 0 1-.44136-.0878 1.152 1.152 0 0 1-.37416-.25 1.153 1.153 0 0 1-.25002-.3741 1.154 1.154 0 0 1-.08779-.4414V4.22999A1.15335 1.15335 0 0 1 1.154 3.07666h13.692c.1515 0 .3014.02983.4414.08779a1.1535 1.1535 0 0 1 .7119 1.06554v7.53871c.0001.1515-.0296.3015-.0876.4415-.0579.14-.1428.2673-.2499.3744a1.153 1.153 0 0 1-.3743.2502c-.14.058-.29.0885-.4415.0885m-11-2.308V7.61533l1.53867 1.92333 1.538-1.92333v2.99997h1.53867V5.38533H6.92267l-1.538 1.92333L3.846 5.38533H2.30734v5.23137zm10.308-2.61531h-1.5387V5.38466h-1.538v2.61533H9.53867L11.846 10.6927z"
			fill="currentColor"
		/>
	</svg>
{/snippet}

{#snippet externalLinkIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
		<path stroke-linecap="square" stroke-linejoin="round" d="m4 12 8-8" />
		<path d="M5 3.5h7.5V11" />
	</svg>
{/snippet}

{#snippet moreVertIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
		<path
			d="M9.5 13c0 .8284-.67157 1.5-1.5 1.5s-1.5-.6716-1.5-1.5.67157-1.5 1.5-1.5 1.5.6716 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 8.82843 6.5 8 7.17157 6.5 8 6.5s1.5.67157 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 3.82843 6.5 3 7.17157 1.5 8 1.5s1.5.67157 1.5 1.5"
		/>
	</svg>
{/snippet}
