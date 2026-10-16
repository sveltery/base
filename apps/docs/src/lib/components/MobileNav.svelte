<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Drawer } from '@sveltery/base/drawer';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import type { NavSection } from '#lib/docs/types.ts';
	import { version } from '../../../../../package.json';
	import { githubIcon, npmIcon, searchIcon, svelteryMark } from './Icons.svelte';
	import { DocsSearch, openInNewTab, type SearchDocument } from './search/search.svelte.ts';
	import SearchResultsList from './search/SearchResultsList.svelte';

	let {
		nav,
		triggerClass,
		open = $bindable(false),
		focusSearch = false
	}: { nav: NavSection[]; triggerClass: string; open?: boolean; focusSearch?: boolean } = $props();

	const search = new DocsSearch(() => nav);
	let highlighted: SearchDocument | undefined;

	afterNavigate(() => {
		open = false;
	});

	// `initialFocus` only runs on open, so the shortcut focuses the input of an open drawer here.
	$effect(() => {
		if (open && focusSearch) document.getElementById('mobile-docs-search-input')?.focus();
	});

	function closeOnCurrentPage(event: MouseEvent, href: string) {
		if (page.url.pathname !== href) return;
		event.preventDefault();
		open = false;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function setQuery(value: string) {
		const hadQuery = search.hasQuery;
		if (!value.trim()) highlighted = undefined;
		const done = search.search(value);
		// Switching between the nav and the results starts the list at the top.
		if (hadQuery !== search.hasQuery) {
			await tick();
			document.querySelector('.MobileNavScrollAreaViewport')?.scrollTo({ top: 0, left: 0 });
		}
		await done;
	}

	function onkeydowncapture(event: KeyboardEvent) {
		// Escape during IME composition only cancels the composition.
		if (event.isComposing || event.keyCode === 229) return;
		if (event.key === 'Escape' && search.hasQuery) {
			event.preventDefault();
			event.stopPropagation();
			void setQuery('');
			return;
		}
		openInNewTab(event, highlighted);
	}
</script>

<Drawer.Root
	bind:open
	onOpenChangeComplete={(isOpen) => {
		if (isOpen) void search.activate().catch(() => {});
		else search.reset();
	}}
>
	<Drawer.Trigger class={triggerClass}>
		{@render searchIcon('MobileNavTriggerIcon')}
		Navigation
	</Drawer.Trigger>
	<Drawer.VirtualKeyboardProvider>
		<Drawer.Portal>
			<Drawer.Backdrop class="MobileNavBackdrop" />
			<Drawer.Viewport class="MobileNavViewport">
				<Drawer.Popup
					class="MobileNavPopup"
					initialFocus={() =>
						document.querySelector<HTMLElement>(
							focusSearch ? '#mobile-docs-search-input' : '.MobileNavPopup'
						)}
				>
					<Drawer.Title class="sr-only">Docs navigation</Drawer.Title>
					<Autocomplete.Root
						items={search.pending ? [] : search.results}
						value={search.value}
						onValueChange={setQuery}
						onOpenChange={(next, details) => {
							if (next || details.reason !== 'escape-key') return;
							if (search.hasQuery) void setQuery('');
							else open = false;
						}}
						onItemHighlighted={(item) => (highlighted = item as SearchDocument | undefined)}
						open={search.hasQuery}
						inline
						itemToStringValue={(item) => (item as SearchDocument).title}
						filter={null}
						autoHighlight={search.hasQuery}
					>
						<div class="MobileNavSearchHeader">
							<div class="MobileNavHandle"></div>
							<div class="MobileNavSearchInputRoot">
								{@render searchIcon('MobileNavSearchIcon')}
								<Autocomplete.Input
									id="mobile-docs-search-input"
									aria-label="Search"
									placeholder="Search"
									class="MobileNavSearchInput"
									{onkeydowncapture}
								/>
								{#if search.hasQuery}
									<Autocomplete.Clear aria-label="Clear search" class="MobileNavClearSearch">
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											stroke-linecap="square"
											stroke-linejoin="round"
											aria-hidden="true"
										>
											<path d="m2.5 2.5 11 11m-11 0 11-11" />
										</svg>
									</Autocomplete.Clear>
								{/if}
							</div>
						</div>
						<Drawer.Content class="MobileNavContent">
							<ScrollArea.Root class="MobileNavScrollAreaRoot">
								<ScrollArea.Viewport class="MobileNavScrollAreaViewport">
									{#if search.hasQuery}
										<div class="MobileNavSearchResults">
											{#if search.empty}
												<Autocomplete.Status class="MobileNavEmptyState">
													No results found.
												</Autocomplete.Status>
											{:else if !search.pending}
												<SearchResultsList
													results={search.results}
													classes={{
														list: 'MobileNavSearchList',
														group: 'MobileNavSection',
														groupLabel: 'MobileNavHeading',
														item: 'MobileNavSearchOption',
														breadcrumbText: 'MobileNavSearchBreadcrumbText',
														breadcrumbPart: 'MobileNavSearchBreadcrumbPart',
														separator: 'MobileNavSearchBreadcrumbSeparator'
													}}
													separator="stroked"
													onNavigate={() => (open = false)}
												/>
											{/if}
										</div>
									{:else}
										<nav aria-label="Docs navigation" class="MobileNavPanel">
											{#each nav as section (section.title)}
												{@render navSection(section)}
											{/each}
											<div class="MobileNavSection">
												<div class="MobileNavHeading">Resources</div>
												<ul class="MobileNavList">
													<li>
														<a
															class="MobileNavLink"
															href="https://www.npmjs.com/package/@sveltery/base"
														>
															{@render npmIcon()}
															<span class="MobileNavResourceRow">
																<span class="MobileNavLinkText">npm package</span>
																<span class="MobileNavVersion">{version}</span>
															</span>
														</a>
													</li>
													<li>
														<a class="MobileNavLink" href="https://github.com/sveltery/base">
															{@render githubIcon()}
															<span class="MobileNavLinkText">GitHub</span>
														</a>
													</li>
													<li>
														<a class="MobileNavLink" href="https://ui.sveltery.dev">
															{@render svelteryMark(16)}
															<span class="MobileNavLinkText">Sveltery UI</span>
														</a>
													</li>
												</ul>
											</div>
										</nav>
									{/if}
								</ScrollArea.Viewport>
								<ScrollArea.Scrollbar class="MobileNavScrollbar">
									<ScrollArea.Thumb class="MobileNavScrollbarThumb" />
								</ScrollArea.Scrollbar>
							</ScrollArea.Root>
						</Drawer.Content>
					</Autocomplete.Root>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.VirtualKeyboardProvider>
</Drawer.Root>

{#snippet navSection(section: NavSection)}
	<div class="MobileNavSection">
		<div class="MobileNavHeading">{section.title}</div>
		<ul class="MobileNavList">
			{#each section.pages as item (item.href)}
				{@const active = page.url.pathname === item.href}
				<li>
					<a
						class="MobileNavLink"
						href={item.href}
						aria-current={active ? 'page' : undefined}
						data-active={active ? '' : undefined}
						onclick={(event) => closeOnCurrentPage(event, item.href)}
					>
						<span class="MobileNavLinkText">{item.title}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/snippet}

<style>
	:global(.MobileNavTriggerIcon) {
		width: var(--space-16);
		height: var(--space-16);
		flex-shrink: 0;
	}

	:global(.MobileNavBackdrop) {
		position: fixed;
		inset: 0;
		min-height: 100dvh;
		opacity: calc(1 - var(--drawer-swipe-progress, 1));
		background-color: rgb(0 0 0 / 10%);
		transition-duration: 300ms;
		transition-property: opacity;
		transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);

		@supports (-webkit-touch-callout: none) {
			position: absolute;
		}

		@media (prefers-color-scheme: dark) {
			background-color: rgb(0 0 0 / 40%);
		}

		&:global([data-starting-style]),
		&:global([data-ending-style]) {
			opacity: 0;
		}

		&:global([data-swiping]) {
			transition-duration: 0ms;
		}

		&:global([data-ending-style]) {
			transition-duration: calc(var(--drawer-swipe-strength, 1) * 400ms);
		}
	}

	:global(.MobileNavViewport) {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		touch-action: none;
	}

	:global(.MobileNavPopup) {
		--mobile-nav-bleed: 3rem;
		--mobile-nav-item-height: var(--space-40);
		--mobile-nav-item-padding-x: var(--space-28);
		--mobile-nav-shadow-clearance: 5rem;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 100%;
		height: calc(100dvh - var(--space-4) + var(--mobile-nav-bleed));
		max-height: calc(100dvh - var(--space-4) + var(--mobile-nav-bleed));
		margin-bottom: calc(-1 * var(--mobile-nav-bleed));
		border-top-left-radius: var(--radius-36);
		border-top-right-radius: var(--radius-36);
		background-color: var(--color-popup);
		color: var(--gray-t2);
		outline: 0;
		touch-action: none;
		box-shadow:
			0 10px 64px -10px rgb(36 40 52 / 20%),
			0 0.25px 0 1px var(--color-border);
		transform: translateY(var(--drawer-swipe-movement-y));
		transition: transform 340ms cubic-bezier(0.32, 0.72, 0, 1);
		will-change: transform;

		@media (prefers-color-scheme: dark) {
			box-shadow: 0 0 0 1px var(--color-border);
		}

		&:global([data-swiping]) {
			user-select: none;
		}

		&:global([data-starting-style]) {
			transform: translateY(calc(100% - var(--mobile-nav-bleed) + 2px));
		}

		&:global([data-ending-style]) {
			transform: translateY(
				calc(100% - var(--mobile-nav-bleed) + var(--mobile-nav-shadow-clearance))
			);
			transition-duration: calc(var(--drawer-swipe-strength, 1) * 400ms);
		}

		@media (width >= 40rem) {
			width: calc(100% - 6rem);
			max-width: 40rem;
		}

		/* Taller screens leave the header visible above the sheet. */
		@media (min-height: 27rem) {
			height: calc(100dvh - var(--header-height) + var(--mobile-nav-bleed));
			max-height: calc(100dvh - var(--header-height) + var(--mobile-nav-bleed));
		}
	}

	.MobileNavSearchHeader {
		position: relative;
		flex-shrink: 0;
		padding: var(--space-16) var(--space-16) 0;
		touch-action: none;
		user-select: none;
	}

	.MobileNavHandle {
		position: absolute;
		top: 0.3125rem;
		left: 50%;
		transform: translateX(-50%);
		width: 3.5rem;
		height: 0.3125rem;
		border-radius: var(--radius-pill);
		background-color: var(--color-border);
	}

	.MobileNavSearchInputRoot {
		position: relative;
	}

	.MobileNavSearchInputRoot :global(.MobileNavSearchIcon) {
		position: absolute;
		top: 50%;
		left: var(--space-12);
		z-index: 1;
		transform: translateY(-50%);
		width: var(--space-16);
		height: var(--space-16);
		color: var(--gray-t1);
		pointer-events: none;
	}

	:global(.MobileNavSearchInput) {
		display: block;
		box-sizing: border-box;
		min-width: 0;
		width: 100%;
		height: var(--space-40);
		border: 0;
		border-radius: var(--radius-pill);
		background-color: var(--gray-c1);
		padding-left: var(--space-36);
		padding-right: var(--space-32);
		font: inherit;
		color: var(--gray-t2);
		outline: 0;
		appearance: none;

		&::placeholder {
			color: var(--gray-t1);
		}

		&::-webkit-search-cancel-button {
			display: none;
		}
	}

	:global(.MobileNavContent),
	:global(.MobileNavScrollAreaRoot),
	:global(.MobileNavScrollAreaViewport) {
		min-width: 0;
		min-height: 0;
	}

	:global(.MobileNavContent),
	:global(.MobileNavScrollAreaRoot) {
		display: flex;
	}

	:global(.MobileNavContent) {
		flex: 1 1 auto;
		touch-action: auto;
	}

	:global(.MobileNavScrollAreaRoot) {
		--mobile-nav-scroll-scrim-size: var(--space-16);
		--mobile-nav-scroll-bottom-inset: calc(
			var(--mobile-nav-bleed) + var(--drawer-keyboard-inset, 0px)
		);
		position: relative;
		flex: 1;
	}

	:global(.MobileNavScrollAreaViewport) {
		--mobile-nav-scroll-scrim-start: min(
			var(--mobile-nav-scroll-scrim-size),
			var(--scroll-area-overflow-y-start, 0px)
		);
		--mobile-nav-scroll-scrim-end: min(
			var(--mobile-nav-scroll-scrim-size),
			var(--scroll-area-overflow-y-end, var(--mobile-nav-scroll-scrim-size))
		);
		--mobile-nav-scroll-scrim-end-stop: calc(100% - var(--mobile-nav-scroll-bottom-inset));
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		padding-bottom: var(--mobile-nav-scroll-bottom-inset);
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			black var(--mobile-nav-scroll-scrim-start),
			black calc(var(--mobile-nav-scroll-scrim-end-stop) - var(--mobile-nav-scroll-scrim-end)),
			transparent var(--mobile-nav-scroll-scrim-end-stop),
			transparent 100%
		);
		mask-repeat: no-repeat;
		scroll-padding-top: var(--mobile-nav-scroll-scrim-size);
		scroll-padding-bottom: calc(
			var(--mobile-nav-scroll-scrim-size) + var(--mobile-nav-scroll-bottom-inset)
		);

		&:focus-visible {
			outline: 2px solid var(--gray-t2);
			outline-offset: -2px;
		}
	}

	:global(.MobileNavScrollbar) {
		display: flex;
		padding-top: var(--space-8);
		padding-bottom: calc(var(--space-8) + var(--mobile-nav-scroll-bottom-inset));
		width: var(--space-24);
		opacity: 0;
		pointer-events: none;
		transition: opacity 250ms;

		&:global([data-hovering]),
		&:global([data-scrolling]),
		&:hover {
			opacity: 1;
			pointer-events: auto;
			transition-duration: 75ms;
			transition-delay: 0ms;
		}
	}

	:global(.MobileNavScrollbarThumb) {
		display: flex;
		justify-content: center;
		width: 100%;

		&::before {
			content: '';
			display: block;
			height: 100%;
			width: var(--space-4);
			border-radius: var(--radius-4);
			background-color: var(--gray-p2);
		}
	}

	.MobileNavPanel,
	.MobileNavSearchResults {
		padding-block: var(--mobile-nav-scroll-scrim-size)
			calc(var(--space-16) + env(safe-area-inset-bottom, 0px));
	}

	:global(.MobileNavSection:not(:last-of-type)) {
		margin-bottom: var(--space-24);
	}

	:global(.MobileNavHeading) {
		display: flex;
		align-items: center;
		margin-inline: var(--mobile-nav-item-padding-x);
		margin-bottom: var(--space-8);
		font-size: var(--font-size-14);
		line-height: 1;
		font-weight: var(--font-weight-400);
		color: var(--gray-t1);
	}

	.MobileNavList,
	:global(.MobileNavSearchList) {
		margin: 0;
		padding: 0;
		list-style: none;
		outline: 0;
	}

	.MobileNavLink,
	:global(.MobileNavSearchOption) {
		display: flex;
		gap: var(--space-8);
		align-items: center;
		height: var(--mobile-nav-item-height);
		padding-inline: var(--mobile-nav-item-padding-x);
		color: var(--gray-t2);
		outline: 0;
		-webkit-tap-highlight-color: var(--gray-c3);

		&:focus-visible {
			outline: 2px solid var(--gray-t2);
			outline-offset: -2px;
		}

		@media (hover: hover) {
			&:not([data-active]):hover .MobileNavLinkText {
				text-decoration: underline;
				text-underline-offset: 3px;
				text-decoration-thickness: 1px;
				text-decoration-color: var(--gray-t2);
			}
		}
	}

	@supports not (-webkit-tap-highlight-color: black) {
		/* Applying the color on :active shows it while touch-scrolling. */
		.MobileNavLink:active,
		:global(.MobileNavSearchOption:active) {
			background-color: var(--gray-c1);
		}
	}

	.MobileNavResourceRow {
		display: flex;
		flex: 1;
		align-items: baseline;
		justify-content: space-between;
	}

	.MobileNavVersion {
		font-size: var(--font-size-15);
		line-height: 1.375rem;
		color: var(--gray-t1);
	}

	:global(.MobileNavEmptyState) {
		padding: var(--space-24) var(--space-12);
		text-align: center;
		font-size: var(--font-size-16);
		line-height: 1;
		color: var(--gray-t1);
	}

	:global(.MobileNavClearSearch) {
		position: absolute;
		top: 50%;
		right: var(--space-8);
		z-index: 1;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--space-24);
		height: var(--space-24);
		border: 0;
		padding: 0;
		background: none;
		border-radius: 100%;
		color: var(--gray-t2);
		outline: 0;

		& > svg {
			pointer-events: none;
			width: var(--space-12);
			height: var(--space-12);
		}

		@media (hover: hover) {
			&:hover {
				background-color: var(--gray-c3);
			}
		}

		@media not (hover: hover) {
			&:active {
				background-color: var(--gray-c2);
			}
		}
	}

	:global(.MobileNavSearchOption) {
		position: relative;
		isolation: isolate;
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		overflow: hidden;
		cursor: default;
		user-select: none;

		&::before {
			content: '';
			position: absolute;
			inset-block: 0;
			inset-inline: var(--space-16);
			z-index: -1;
			border-radius: var(--radius-6);
			pointer-events: none;
		}

		&:global([data-highlighted])::before {
			background-color: var(--gray-c1);
		}
	}

	:global(.MobileNavSearchBreadcrumbText) {
		display: block;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.MobileNavSearchBreadcrumbSeparator) {
		display: inline-flex;
		margin-inline: var(--space-4);
		vertical-align: middle;
		flex-shrink: 0;
		color: var(--gray-t1);
	}
</style>
