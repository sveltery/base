<script lang="ts">
	import { page } from '$app/state';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import type { NavSection } from '#lib/docs/types.ts';
	import { version } from '../../../../../package.json';
	import { githubIcon, npmIcon, svelteryMark } from './Icons.svelte';

	let { nav }: { nav: NavSection[] } = $props();

	const SCROLL_MARGIN = 48;

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function revealWhenActive(href: string) {
		return (item: HTMLElement) => {
			if (!isActive(href)) return;
			const viewport = item.closest<HTMLElement>('[data-side-nav-viewport]');
			if (!viewport) return;
			const bounds = viewport.getBoundingClientRect();
			const rect = item.getBoundingClientRect();
			if (rect.top < bounds.top) viewport.scrollTop -= bounds.top - rect.top + SCROLL_MARGIN;
			else if (rect.bottom > bounds.bottom)
				viewport.scrollTop += rect.bottom - bounds.bottom + SCROLL_MARGIN;
		};
	}

	function scrollToTop(event: MouseEvent, href: string) {
		if (page.url.pathname !== href) return;
		event.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<nav aria-label="Main navigation" class="SideNavRoot">
	<ScrollArea.Root>
		<ScrollArea.Viewport data-side-nav-viewport class="SideNavViewport">
			{#each nav as section (section.title)}
				<div class="SideNavSection">
					<div class="SideNavHeading">{section.title}</div>
					<ul class="SideNavList">
						{#each section.pages as item (item.href)}
							{@const active = isActive(item.href)}
							<li class="SideNavItem" {@attach revealWhenActive(item.href)}>
								<a
									class="SideNavLink"
									href={item.href}
									data-active={active || undefined}
									aria-current={active
										? page.url.pathname === item.href
											? 'page'
											: 'location'
										: undefined}
									onclick={(event) => scrollToTop(event, item.href)}
								>
									{item.title}
								</a>
							</li>
						{/each}
						{#if section.title === 'Handbook'}
							<li class="SideNavItem">
								<a class="SideNavLink" href="/llms.txt" data-sveltekit-reload>llms.txt</a>
							</li>
						{/if}
					</ul>
				</div>
			{/each}
			<hr class="SideNavSeparator" />
			<div class="SideNavSection">
				<ul class="SideNavList">
					<li class="SideNavItem">
						<a class="SideNavLink" href="https://github.com/sveltery/base">
							<span class="SideNavLinkIconContainer">{@render githubIcon()}GitHub</span>
						</a>
					</li>
					<li class="SideNavItem">
						<a class="SideNavLink" href="https://www.npmjs.com/package/@sveltery/base">
							<span class="SideNavLinkIconContainer"
								>{@render npmIcon()}<span>npm<span class="SideNavVersion">{version}</span></span
								></span
							>
						</a>
					</li>
					<li class="SideNavItem">
						<a class="SideNavLink" href="https://ui.sveltery.dev">
							<span class="SideNavLinkIconContainer">{@render svelteryMark(16)}Sveltery UI</span>
						</a>
					</li>
				</ul>
			</div>
		</ScrollArea.Viewport>
		<ScrollArea.Scrollbar class="SideNavScrollbar" orientation="vertical">
			<ScrollArea.Thumb class="SideNavScrollbarThumb" />
		</ScrollArea.Scrollbar>
	</ScrollArea.Root>
</nav>

<style>
	.SideNavRoot {
		--side-nav-item-height: 1.75rem;
		--side-nav-item-line-height: 1.375rem;
		--side-nav-item-padding-y: calc(
			var(--side-nav-item-height) / 2 - var(--side-nav-item-line-height) / 2
		);
		--side-nav-link-padding-x: 0.5rem;

		--side-nav-scrollbar-thumb-width: 0.25rem;
		--side-nav-scrollbar-width: 1.5rem;
		--side-nav-scrollbar-gap-left: 1rem;
		--side-nav-scrollbar-gap-right: 2.5rem;
		/* Leaves a gap between the sidebar's right edge and the main content. */
		--side-nav-gap-right: calc(
			var(--side-nav-scrollbar-gap-right) - var(--side-nav-scrollbar-width) / 2 +
				var(--side-nav-scrollbar-thumb-width) / 2
		);

		font-size: var(--font-size-14);
		line-height: 1.375rem;

		display: none;

		@media (width >= 64rem) {
			display: block;
			position: fixed;
			top: var(--header-height);
			/* Starts a link's padding early so the active pill bleeds past the logo's alignment line. */
			left: calc(
				max(
						var(--root-layout-padding-x),
						calc(50% - var(--breakpoint-max-layout-width) / 2 + var(--root-layout-padding-x))
					) -
					var(--side-nav-link-padding-x)
			);
			width: calc(
				var(--sidebar-width) - var(--side-nav-gap-right) + var(--side-nav-link-padding-x)
			);
		}
	}

	.SideNavRoot :global(.SideNavViewport) {
		max-height: calc(100dvh - var(--header-height));
		padding: 0
			calc(
				var(--side-nav-scrollbar-gap-left) + var(--side-nav-scrollbar-width) / 2 +
					var(--side-nav-scrollbar-thumb-width) / 2
			)
			2.5rem var(--side-nav-link-padding-x);
		outline: 0;
	}

	.SideNavRoot:has(:global(.SideNavViewport:focus-visible))::after {
		content: '';
		inset: 0 -2px;
		pointer-events: none;
		position: absolute;
		outline: 2px solid var(--gray-t2);
		outline-offset: -2px;
	}

	.SideNavRoot :global(.SideNavScrollbar) {
		display: flex;
		padding-block: 0.25rem;
		width: var(--side-nav-scrollbar-width);
		opacity: 0;
		transition: opacity 200ms 500ms;

		&:active,
		&:global([data-scrolling]) {
			transition-duration: 0ms;
			transition-delay: 0ms;
			opacity: 1;
		}
	}

	.SideNavRoot :global(.SideNavViewport:focus-visible + .SideNavScrollbar) {
		transition-duration: 0ms;
		transition-delay: 0ms;
		opacity: 1;
	}

	.SideNavRoot :global(.SideNavScrollbarThumb) {
		display: flex;
		justify-content: center;
		width: 100%;

		&::before {
			content: '';
			display: block;
			height: 100%;
			width: var(--side-nav-scrollbar-thumb-width);
			border-radius: var(--radius-4);
			background-color: var(--gray-p2);
		}
	}

	.SideNavSection:not(:last-child) {
		margin-bottom: 1rem;
	}

	.SideNavHeading {
		display: inline-flex;
		padding-block: var(--side-nav-item-padding-y);
		font-weight: var(--font-weight-400);
		color: var(--gray-t1);
	}

	.SideNavSeparator {
		margin-block: 1rem;
		border: none;
		border-top: 1px solid var(--color-border);
		width: var(--space-32);
	}

	.SideNavItem {
		display: flex;
	}

	.SideNavLink {
		display: block;
		flex-grow: 1;
		padding-block: calc(var(--side-nav-item-padding-y) - 1px);
		padding-inline: var(--side-nav-link-padding-x);
		/* Aligns the text with the heading and logo while the pill keeps its padding. */
		margin-inline-start: calc(-1 * var(--side-nav-link-padding-x));
		/* Keeps a 1px gap between the active item and its neighbors. */
		border-block: 1px solid transparent;
		background-clip: padding-box;
		border-radius: var(--radius-6);
		user-select: none;

		@media (hover: hover) {
			&:hover {
				text-decoration: underline;
				text-underline-offset: 2px;
				text-decoration-thickness: 1px;
				text-decoration-color: var(--gray-t2);
			}
		}

		&[data-active] {
			border: none;
			padding-block: var(--side-nav-item-padding-y);
			background-color: var(--gray-s2);
			outline: 1px solid var(--gray-c2);
			outline-offset: -1px;
			word-spacing: -0.005em;
		}

		&:focus-visible {
			z-index: 1;
			outline: 2px solid var(--gray-t2);
			outline-offset: -2px;
		}
	}

	.SideNavLinkIconContainer {
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}

	.SideNavVersion {
		/* Keeps the version out of the link's hover underline. */
		display: inline-block;
		margin-inline-start: 0.375rem;
		color: var(--gray-t1);
	}
</style>
