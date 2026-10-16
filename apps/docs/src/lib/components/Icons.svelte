<script module lang="ts">
	export { githubIcon, npmIcon, searchIcon, svelteryMark };
</script>

{#snippet githubIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
		<path
			d="M8 0C3.57983 0 0 3.67031 0 8.20221c0 3.62969 2.29009 6.69509 5.46991 7.78139.4.072.54957-.174.54957-.3894 0-.1947-.00974-.8402-.00974-1.5278-2.00974.3795-2.52939-.5021-2.68939-.9628-.09044-.2361-.48-.9643-.82087-1.1591-.27965-.1541-.67965-.5334-.00974-.5434.63026-.01 1.08035.5948 1.23061.8409.72 1.241 1.86991.8915 2.32974.6761.06956-.5328.27965-.8915.50991-1.0969-1.78017-.2047-3.63965-.9122-3.63965-4.04979 0-.89154.30956-1.62974.81948-2.20389-.08-.20542-.35966-1.04632.08-2.17395 0 0 .66991-.21539 2.20034.84091.64-.18473 1.31966-.27674 2-.27674.67966 0 1.36.09272 2.00003.27674 1.5304-1.06629 2.1996-.84091 2.1996-.84091.4404 1.12763.16 1.96853.08 2.17395.5099.57415.8202 1.30165.8202 2.20389 0 3.14759-1.8699 3.84439-3.65004 4.04979.29004.2567.53974.7489.53974 1.5177 0 1.097-.00975 1.9785-.00975 2.2553 0 .2154.15035.4721.54965.3902C13.7107 14.8973 16 11.8212 16 8.20221 16 3.67031 12.4202 0 8 0"
		/>
	</svg>
{/snippet}

{#snippet npmIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
		<rect width="16" height="16" fill="black" />
		<rect x="3" y="3" width="10" height="10" fill="white" />
		<path d="M8 5H11V13H8V5Z" fill="black" />
	</svg>
{/snippet}

{#snippet searchIcon(className: string)}
	<svg
		class={className}
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="m11 11 3.5 3.5" />
		<circle cx="7" cy="7" r="5.5" />
	</svg>
{/snippet}

{#snippet svelteryMark(size: number)}
	<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
		<rect width="32" height="32" rx="7" fill="currentColor" />
		<path
			d="M10 11h12M10 16h8M10 21h12"
			stroke="var(--color-content)"
			stroke-width="2.5"
			stroke-linecap="round"
		/>
	</svg>
{/snippet}
