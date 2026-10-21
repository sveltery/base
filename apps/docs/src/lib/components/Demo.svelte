<script module lang="ts">
	/** Base UI's names for the styling variants in the "Styling method" select. */
	const VARIANT_LABELS: Record<string, string> = {
		CssModules: 'CSS Modules',
		Tailwind: 'Tailwind v4'
	};

	const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
</script>

<script lang="ts">
	import { flushSync } from 'svelte';
	import { Menu } from '@sveltery/base/menu';
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import { Select } from '@sveltery/base/select';
	import { Tabs } from '@sveltery/base/tabs';
	import type { DemoVariantData } from '#lib/docs/create-demo.ts';
	import { openStackBlitz } from '#lib/docs/stackblitz.ts';
	import { REPOSITORY } from '#lib/docs/links.ts';
	import CopyButton from './CopyButton.svelte';
	import {
		caretSortIcon,
		checkIcon,
		copyIcon,
		externalLinkIcon,
		moreVertIcon
	} from './DocIcons.svelte';
	import { githubIcon } from './Icons.svelte';

	let { slug, variants }: { slug: string; variants: DemoVariantData[] } = $props();

	// Base UI keeps the reader's styling method for every demo with the same set of variants.
	const preferenceKey = $derived(
		`_docs_variant_pref:${variants
			.map((variant) => variant.name)
			.sort()
			.join(':')}`
	);
	let variantName = $state<string>();
	let fileName = $state<string>();
	const variant = $derived(
		variants.find((candidate) => candidate.name === variantName) ?? variants[0]
	);
	const file = $derived(
		variant.files.find((candidate) => candidate.name === fileName) ?? variant.files[0]
	);
	// Base UI names a demo after its folder: `hero` is "Hero".
	const title = $derived(
		slug.replace(/(^|-)(\w)/g, (_, dash, letter) => `${dash && ' '}${letter.toUpperCase()}`)
	);
	const fileSlug = (variantName: string, name: string) => `${slug}:${kebab(variantName)}:${name}`;

	/** The variant and file a `#<slug>:<variant>:<file>` link names, as Base UI reads it. */
	function fromHash() {
		const [hashSlug, hashVariant, hashFile] = decodeURIComponent(location.hash.slice(1)).split(':');
		if (hashSlug !== slug) return;
		return {
			variant: variants.find((candidate) => kebab(candidate.name) === hashVariant?.toLowerCase()),
			file: hashFile
		};
	}

	// A link's variant comes before the stored one, and neither is stored until the reader picks one.
	$effect(() => {
		const linked = fromHash();
		if (linked?.variant) {
			variantName = linked.variant.name;
			fileName = linked.file;
			return;
		}
		if (variants.length < 2) return;
		try {
			const stored = localStorage.getItem(preferenceKey);
			if (stored && variants.some((candidate) => candidate.name === stored)) variantName = stored;
		} catch {
			// Storage can be unavailable, and the first variant is a fine default.
		}
	});

	function selectVariant(name: string) {
		variantName = name;
		expanded = true;
		if (fromHash()) history.replaceState(history.state, '', location.pathname + location.search);
		try {
			localStorage.setItem(preferenceKey, name);
		} catch {
			// The choice still holds on this page.
		}
	}

	/** Code this short is shown whole, as in Base UI. */
	const collapsible = $derived(file.code.trimEnd().split('\n').length >= 8);
	let expanded = $state(false);
	const closed = $derived(collapsible && !expanded);
	let trigger = $state<HTMLElement>();
	let linkCopied = $state(false);
	// A tab clicked with a modifier key opens its link in a new tab, and keeps this one selected.
	const withModifier = (event: Event) =>
		event instanceof MouseEvent && (event.ctrlKey || event.metaKey);

	const sourceUrl = $derived(`${REPOSITORY}/tree/main/${variant.path}`);

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
</script>

<div class="DemoRoot">
	{#each variants as { name, files } (name)}
		{#each files as { name: file } (file)}
			<span id={fileSlug(name, file)} class="DemoFileAnchor"></span>
		{/each}
	{/each}
	<div class="DemoPlayground">
		<figure aria-label="Component demo" class="DemoPlaygroundInner" data-demo={kebab(variant.name)}>
			<variant.component />
		</figure>
	</div>
	<figure aria-label="Component demo code">
		<div class="DemoToolbar">
			{#if variant.files.length > 1}
				{#key variant.name}
					<Tabs.Root
						class="DemoTabsRoot"
						value={file.name}
						onValueChange={(value, details) => {
							if (withModifier(details.event)) return details.cancel();
							fileName = String(value);
							expanded = true;
						}}
					>
						<Tabs.List class="DemoTabsList" aria-label="Files">
							{#each variant.files as { name } (name)}
								<Tabs.Tab class="DemoTab" value={name} nativeButton={false}>
									{#snippet render(props, _state, children)}
										<a
											{...props}
											href="#{fileSlug(variant.name, name)}"
											onclick={(event) => {
												props.onclick?.(event);
												// A plain click selects the tab, so the link must not jump to its anchor.
												if (!withModifier(event)) event.preventDefault();
											}}>{@render children?.()}</a
										>
									{/snippet}
									<span>{name}</span>
								</Tabs.Tab>
							{/each}
						</Tabs.List>
					</Tabs.Root>
				{/key}
			{/if}
			<div class="DemoToolbarActions">
				{#if variants.length > 1}
					<Select.Root
						items={Object.fromEntries(
							variants.map(({ name }) => [name, VARIANT_LABELS[name] ?? name])
						)}
						bind:value={() => variant.name, (value) => selectVariant(String(value))}
					>
						<Select.Trigger class="GhostButton" data-layout="text" aria-label="Styling method">
							<Select.Value />
							<Select.Icon class="SelectIcon">{@render caretSortIcon()}</Select.Icon>
						</Select.Trigger>
						<Select.Portal>
							<Select.Positioner class="SelectPositioner" align="center" sideOffset={7}>
								<Select.Popup class="SelectPopup">
									{#each variants as { name } (name)}
										<Select.Item class="SelectItem" value={name}>
											<Select.ItemIndicator class="SelectItemIndicator">
												{@render checkIcon()}
											</Select.ItemIndicator>
											<Select.ItemText class="SelectItemText">
												{VARIANT_LABELS[name] ?? name}
											</Select.ItemText>
										</Select.Item>
									{/each}
								</Select.Popup>
							</Select.Positioner>
						</Select.Portal>
					</Select.Root>
				{/if}
				<button
					type="button"
					class="GhostButton"
					data-layout="text"
					aria-label="Open in StackBlitz"
					onclick={() => openStackBlitz(title, variant)}
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
					<div class="DemoSourceBrowser">{@html file.html}</div>
				</ScrollArea.Viewport>
				{#if !closed}
					<ScrollArea.Corner class="ScrollAreaCorner" />
					{#each ['vertical', 'horizontal'] as const as orientation (orientation)}
						<ScrollArea.Scrollbar class="ScrollAreaScrollbar" {orientation}>
							<ScrollArea.Thumb class="ScrollAreaThumb" />
						</ScrollArea.Scrollbar>
					{/each}
				{/if}
				<CopyButton text={() => file.code} class="DemoCodeBlockCopyButton" />
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
