<script lang="ts">
	import { onMount } from 'svelte';
	import type { NavSection } from '#lib/docs/types.ts';
	import LogoLink from './LogoLink.svelte';
	import MobileNav from './MobileNav.svelte';
	import SkipNav from './SkipNav.svelte';

	let { nav }: { nav: NavSection[] } = $props();

	let isMac = $state(true);
	onMount(() => {
		isMac = /Mac|iPhone|iPad/.test(navigator.platform);
	});
</script>

<header class="Header">
	<div class="HeaderInner">
		<SkipNav />
		<LogoLink />
		<div class="HeaderSearch">
			<button type="button" class="SearchTrigger HeaderSearchDesktopTrigger">
				Search
				<span class="SearchTriggerShortcut"
					>({#if isMac}<kbd>⌘</kbd>{:else}<kbd>Ctrl+</kbd>{/if}<kbd>k</kbd>)</span
				>
			</button>
			<MobileNav {nav} triggerClass="SearchTrigger HeaderSearchMobileTrigger" />
		</div>
	</div>
</header>

<style>
	.Header {
		font-size: var(--font-size-15);
		line-height: 1.375rem;
		position: absolute;
		left: 0;
		top: 0;
		height: var(--header-height);
		width: 100%;
	}

	.HeaderInner {
		height: inherit;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--content-layout-padding-x);
		position: fixed;
		top: 0;
		inset-inline: 0;
		background: var(--color-content);
		z-index: 2;

		@media (width >= 64rem) {
			max-width: var(--breakpoint-max-layout-width);
			margin-inline: auto;
			padding-inline: var(--root-layout-padding-x);
		}

		@media (width >= 84rem) {
			background: none;
			/* The header is transparent here, so clicks fall through to the content under it. */
			pointer-events: none;

			& > :global(*) {
				pointer-events: auto;
			}
		}

		@media print {
			position: absolute;
		}
	}

	.HeaderSearch {
		display: flex;
		align-items: center;

		@media (width >= 84rem) {
			/* Aligns the trigger's text with the quick nav links. */
			width: calc(var(--sidebar-width) - 2.5rem);
		}
	}

	.HeaderSearch :global(.SearchTrigger) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-4);
		height: 1.75rem;
		width: fit-content;
		padding: 0.25rem 0.5rem;
		margin: -0.25rem -0.5rem;
		border: 0;
		background: transparent;
		font-family: var(--font-sans);
		font-weight: var(--font-weight-400);
		font-size: var(--font-size-15);
		line-height: 1.375rem;
		color: var(--gray-t2);
		text-align: left;
		white-space: nowrap;
		border-radius: var(--radius-8);
		user-select: none;
		outline: 0;

		& kbd {
			font: inherit;
		}

		@media (hover: hover) {
			&:hover {
				background-color: var(--gray-c1);
			}

			&:active {
				background-color: var(--gray-c2);
			}
		}

		&:focus-visible {
			outline: 2px solid currentColor;
			outline-offset: -1px;
		}
	}

	.SearchTriggerShortcut {
		color: var(--gray-t1);
	}

	.HeaderSearch :global(.HeaderSearchDesktopTrigger) {
		display: none;

		@media (width >= 64rem) {
			display: inline-flex;
		}
	}

	.HeaderSearch :global(.HeaderSearchMobileTrigger) {
		@media (width >= 64rem) {
			display: none;
		}
	}
</style>
