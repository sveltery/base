<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
	import { Dialog } from '@sveltery/base/dialog';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import { searchIcon } from '../Icons.svelte';
	import { DocsSearch, openInNewTab, type SearchDocument } from './search.svelte.ts';
	import SearchResultsList from './SearchResultsList.svelte';

	let {
		search,
		open = $bindable(false),
		triggerClass,
		isMac
	}: { search: DocsSearch; open?: boolean; triggerClass: string; isMac: boolean } = $props();

	let highlighted: SearchDocument | undefined;

	function close() {
		open = false;
	}
</script>

<Dialog.Root
	bind:open={
		() => open,
		(next) => {
			open = next;
			if (next) search.activate();
			// The dialog stays mounted, so clear the query once it is hidden.
			else search.reset(200);
		}
	}
>
	<Dialog.Trigger class={triggerClass} onpointerdown={() => search.activate()}>
		Search
		<span class="SearchTriggerShortcut"
			>({#if isMac}<kbd>⌘</kbd>{:else}<kbd>Ctrl+</kbd>{/if}<kbd>k</kbd>)</span
		>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Backdrop class="SearchBackdrop" />
		<Dialog.Viewport class="SearchViewport">
			<Dialog.Popup
				class="SearchPopup"
				initialFocus={() => document.getElementById('search-input')}
			>
				<Dialog.Title class="sr-only">Search documentation</Dialog.Title>
				<Autocomplete.Root
					items={search.pending ? [] : search.results}
					value={search.value}
					onValueChange={(value) => search.search(value)}
					onOpenChange={(next, details) => {
						if (!next && details.reason === 'escape-key') close();
					}}
					onItemHighlighted={(item) => (highlighted = item as SearchDocument | undefined)}
					open
					inline
					itemToStringValue={(item) => (item as SearchDocument).title}
					filter={null}
					autoHighlight="always"
					keepHighlight
				>
					<div class="SearchHead">
						<div class="SearchInputRoot">
							{@render searchIcon('SearchInputIcon')}
							<Autocomplete.Input
								id="search-input"
								aria-label="Search"
								placeholder="Search"
								class="SearchInput"
								onkeydowncapture={(event) => openInNewTab(event, highlighted)}
							/>
						</div>
					</div>
					<div class="SearchBody">
						<ScrollArea.Root class="SearchScrollAreaRoot">
							<ScrollArea.Viewport class="SearchScrollAreaViewport">
								<ScrollArea.Content style="min-width: 100%">
									{#if search.empty}
										<Autocomplete.Status class="SearchEmptyState">No results found.</Autocomplete.Status>
									{:else if search.results.length && !search.pending}
										<SearchResultsList
											results={search.results}
											classes={{
												list: 'SearchList',
												group: 'SearchGroup',
												groupLabel: 'SearchGroupLabel',
												item: 'SearchOptionItem',
												breadcrumbPart: 'SearchBreadcrumbPart',
												breadcrumbPartLast: 'last',
												separator: 'SearchBreadcrumbSeparator'
											}}
											separator="filled"
											onNavigate={close}
										/>
									{/if}
								</ScrollArea.Content>
							</ScrollArea.Viewport>
							<ScrollArea.Scrollbar class="SearchScrollbar">
								<ScrollArea.Thumb class="SearchScrollbarThumb" />
							</ScrollArea.Scrollbar>
						</ScrollArea.Root>
					</div>
					<div class="SearchFooter">
						<div class="SearchFooterHint">
							<kbd aria-label="Enter" class="SearchFooterEnter">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M20 4v7a4 4 0 0 1-4 4H4" />
									<path d="m9 10-5 5 5 5" />
								</svg>
							</kbd>
							<span>Go to page</span>
						</div>
					</div>
				</Autocomplete.Root>
				<Dialog.Close class="SearchClose">Close</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Viewport>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.SearchTriggerShortcut {
		color: var(--gray-t1);
	}

	:global(.SearchScrollbar) {
		display: flex;
		padding-top: var(--space-8);
		padding-bottom: var(--space-8);
		/* Click target width */
		width: 1.5rem;
		margin-right: -0.25rem;
	}

	:global(.SearchScrollbarThumb) {
		display: flex;
		justify-content: center;
		width: 100%;

		&::before {
			content: '';
			display: block;
			height: 100%;
			/* Visible thumb width */
			width: 0.25rem;
			border-radius: var(--radius-4);
			background-color: var(--gray-p2);
		}
	}

	:global(.SearchBreadcrumbPart) {
		display: flex;
		height: 100%;
		align-items: center;
		white-space: nowrap;

		&:global(.last) {
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	:global(.SearchBreadcrumbSeparator) {
		color: var(--gray-c3);
	}

	:global(.SearchEmptyState) {
		padding: 1.5rem 0.75rem;
		text-align: center;
		font-size: 0.9375rem;
		font-weight: var(--font-weight-400);
		color: var(--gray-t1);
	}

	.SearchInputRoot {
		position: relative;
		display: block;
		height: 2.875rem;
		border-radius: var(--radius-6);
	}

	.SearchInputRoot :global(.SearchInputIcon) {
		position: absolute;
		top: 50%;
		left: var(--space-16);
		transform: translateY(-50%);
		width: 1rem;
		height: 1rem;
		color: var(--gray-p1);
		pointer-events: none;
	}

	:global(.SearchInput) {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		border: 0;
		padding-left: var(--space-40);
		padding-right: var(--space-16);
		background: transparent;
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-400);
		color: var(--gray-t2);
		outline: 0;

		&::placeholder {
			color: var(--gray-p1);
		}
	}

	:global(.SearchGroup) {
		display: block;
	}

	:global(.SearchGroupLabel) {
		margin: 0;
		display: flex;
		align-items: center;
		height: 2rem;
		padding-left: var(--space-8);
		font-size: 0.9375rem;
		font-weight: var(--font-weight-400);
		line-height: 1;
		color: var(--gray-t1);
		user-select: none;
	}

	:global(.SearchOptionItem) {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		height: 2rem;
		padding-left: var(--space-24);
		padding-right: 0.5rem;
		border-radius: var(--radius-6);
		font-size: 0.9375rem;
		font-weight: var(--font-weight-400);
		line-height: 1;
		color: var(--gray-t2);
		cursor: default;
		user-select: none;
		outline: none;

		&:global([data-highlighted]) {
			background: var(--gray-c1);
		}
	}

	:global(.SearchBackdrop) {
		position: fixed;
		inset: 0;
		min-height: 100dvh;
		background: black;
		opacity: 0.2;
		transition: opacity 150ms ease;

		&:global([data-starting-style]) {
			opacity: 0;
		}

		@media (prefers-color-scheme: dark) {
			opacity: 0.7;
		}

		@supports (-webkit-touch-callout: none) {
			position: absolute;
		}
	}

	:global(.SearchViewport) {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		overflow: hidden;
		padding-top: 4.5rem;
	}

	:global(.SearchPopup) {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 0;
		max-height: min(29.5rem, calc(100vh - 6rem));
		width: min(34rem, calc(100vw - 2rem));
		border-radius: 1rem;
		background: var(--gray-s1);
		color: var(--gray-t2);
		outline: 1px solid var(--color-border);
		box-shadow:
			0 0.5px 1px hsl(0deg 0% 0% / 12%),
			0 1px 3px -1px hsl(0deg 0% 0% / 4%),
			0 2px 4px -1px hsl(0deg 0% 0% / 4%),
			0 4px 8px -2px hsl(0deg 0% 0% / 4%),
			0 12px 14px -4px hsl(0deg 0% 0% / 4%),
			0 24px 64px -8px hsl(0deg 0% 0% / 4%),
			0 40px 48px -32px hsl(0deg 0% 0% / 4%);
		transition:
			transform 150ms ease,
			opacity 150ms ease;

		&:global([data-starting-style]) {
			transform: translateY(-1rem) scale(0.9);
			opacity: 0;
		}

		@media (prefers-color-scheme: dark) {
			background: oklch(20% 0.5% 264deg);
			outline-color: hsl(0deg 0% 100% / 25%);
		}
	}

	.SearchHead {
		flex-shrink: 0;
		border-bottom: 1px solid var(--gray-c1);
		border-radius: 1rem 1rem 0 0;
	}

	.SearchBody {
		display: flex;
		min-height: 4.5rem;
		flex: 1;
	}

	:global(.SearchScrollAreaRoot) {
		position: relative;
		display: flex;
		min-height: 0;
		flex: 1;
		overflow: hidden;

		&:has(:global(.SearchScrollAreaViewport:focus-visible)) {
			outline: 2px solid var(--gray-t2);
			outline-offset: -1px;
		}
	}

	:global(.SearchScrollAreaViewport) {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		scroll-padding-top: 2.25rem;
		scroll-padding-bottom: 0.5rem;
		outline: none;
	}

	:global(.SearchList) {
		outline: 0;
		padding: 0.5rem;
	}

	.SearchFooter {
		border-top: 1px solid var(--gray-c1);
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		display: flex;
		font-size: var(--font-size-13);
		line-height: 1;
		color: var(--gray-p1);
	}

	.SearchFooterHint {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.SearchFooterEnter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: var(--radius-4);
		border: 1px solid var(--gray-c3);
		background: var(--gray-s2);
		font-size: 0.625rem;
		color: var(--gray-t1);
	}

	:global(.SearchClose) {
		display: none;

		&:focus {
			display: flex;
		}
	}
</style>
