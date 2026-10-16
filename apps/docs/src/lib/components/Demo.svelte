<script lang="ts">
	import { flushSync, type Component } from 'svelte';
	import { Menu } from '@sveltery/base/menu';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import { page as currentPage } from '$app/state';
	import { openStackBlitz } from '#lib/docs/stackblitz.ts';
	import { REPOSITORY } from '#lib/docs/links.ts';
	import CopyButton from './CopyButton.svelte';
	import { checkIcon, copyIcon, externalLinkIcon, moreVertIcon } from './DocIcons.svelte';
	import { githubIcon } from './Icons.svelte';

	// `component` is the fence's code compiled as its own file. The markdown pipeline passes it.
	let {
		id,
		page,
		component: Example,
		html,
		raw
	}: { id: string; page: string; component: Component; html: string; raw: string } = $props();

	/** Code this short is shown whole, as in Base UI. */
	const collapsible = $derived(raw.trimEnd().split('\n').length >= 8);
	let expanded = $state(false);
	const closed = $derived(collapsible && !expanded);
	let trigger = $state<HTMLElement>();
	let linkCopied = $state(false);

	const sourceUrl = $derived(`${REPOSITORY}/blob/main/apps/docs/content/${page}`);

	function toggle() {
		if (!expanded || !trigger) {
			expanded = !expanded;
			return;
		}
		// Collapsing a long block would leave the page far below the demo, so keep the button where it was.
		const before = trigger.getBoundingClientRect().top;
		flushSync(() => (expanded = false));
		const after = trigger.getBoundingClientRect().top;
		if (after < 0) window.scrollBy({ top: after - before, behavior: 'instant' });
	}

	async function copySourceLink() {
		await navigator.clipboard.writeText(sourceUrl);
		linkCopied = true;
		setTimeout(() => (linkCopied = false), 2000);
	}

	const title = $derived(currentPage.data.metadata?.title ?? 'Demo');
</script>

<div class="DemoRoot" data-demo={id}>
	<div class="DemoPlayground">
		<figure aria-label="Component demo" class="DemoPlaygroundInner">
			<Example />
		</figure>
	</div>
	<figure aria-label="Component demo code">
		<div class="DemoToolbar">
			<div class="DemoToolbarActions">
				<button
					type="button"
					class="GhostButton"
					data-layout="text"
					aria-label="Open in StackBlitz"
					onclick={() => openStackBlitz(title, raw)}
				>
					StackBlitz{@render externalLinkIcon()}
				</button>
				<Menu.Root>
					<Menu.Trigger class="GhostButton" data-layout="icon" aria-label="More actions">
						{@render moreVertIcon()}
					</Menu.Trigger>
					<Menu.Portal>
						<Menu.Positioner class="MenuPositioner" sideOffset={8} align="end" alignOffset={-5}>
							<Menu.Popup class="MenuPopup">
								<Menu.LinkItem class="MenuItem" href={sourceUrl} target="_blank" rel="noopener">
									{@render githubIcon()}
									View source on GitHub
									{@render externalLinkIcon()}
								</Menu.LinkItem>
								<Menu.Item class="MenuItem" closeOnClick={false} onclick={copySourceLink}>
									{@render (linkCopied ? checkIcon : copyIcon)()}
									Copy link to source
									<span class="sr-only" aria-live="polite">{linkCopied ? 'Link copied!' : ''}</span>
								</Menu.Item>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</div>
		</div>
		<div class="DemoCodeBlockCollapsible">
			<ScrollArea.Root class="DemoCodeBlockRoot" data-closed={closed ? '' : undefined}>
				<ScrollArea.Viewport
					class="ScrollAreaViewport DemoCodeBlockViewport"
					data-closed={closed ? '' : undefined}
					aria-hidden={closed || undefined}
					inert={closed}
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from repository files. -->
					<div class="DemoSourceBrowser">{@html html}</div>
				</ScrollArea.Viewport>
				{#if !closed}
					<ScrollArea.Corner class="ScrollAreaCorner" />
					{#each ['vertical', 'horizontal'] as const as orientation (orientation)}
						<ScrollArea.Scrollbar class="ScrollAreaScrollbar" {orientation}>
							<ScrollArea.Thumb class="ScrollAreaThumb" />
						</ScrollArea.Scrollbar>
					{/each}
				{/if}
				<CopyButton text={() => raw} class="DemoCodeBlockCopyButton" />
				{#if collapsible}
					<button
						type="button"
						class="DemoCollapseButton"
						data-sticky={expanded ? '' : undefined}
						aria-expanded={expanded}
						onclick={toggle}
					>
						<span bind:this={trigger} class="DemoCollapseButtonVisual">
							{expanded ? 'Hide code' : 'Show code'}
						</span>
					</button>
				{/if}
			</ScrollArea.Root>
		</div>
	</figure>
</div>
