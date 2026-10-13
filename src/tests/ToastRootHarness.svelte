<!--
	Toast.Root scenarios that ToastHarness's list does not cover.
	- `labels`: a fixed toast whose title and description parts mount, unmount, and get children.
	- `remount`: a managed list that can be hidden and shown again with a longer title.
	- `portal`: each toast holds a button moved to `<body>`.
	- `static`: a fixed toast that swipes up, with an optional swipe-ignore child.
-->
<script lang="ts">
	import { Toast, type ToastObject } from '#lib';
	import ToastRootHarnessManaged from './ToastRootHarnessManaged.svelte';

	let {
		scenario,
		mode = 'fallback',
		showToasts = true,
		longTitle = false,
		ignore = 'none'
	}: {
		scenario: 'labels' | 'remount' | 'portal' | 'static';
		mode?: 'fallback' | 'explicit' | 'none';
		showToasts?: boolean;
		longTitle?: boolean;
		ignore?: 'none' | 'base' | 'legacy';
	} = $props();

	const fixedToast: ToastObject = {
		id: 'test',
		title: 'Toast title',
		description: 'Toast description'
	};
</script>

<Toast.Provider>
	{#if scenario === 'labels'}
		<Toast.Viewport>
			<Toast.Root toast={fixedToast} data-testid="root">
				{#if mode === 'explicit'}
					<Toast.Title data-testid="title">Explicit title</Toast.Title>
					<Toast.Description data-testid="description">Explicit description</Toast.Description>
				{:else if mode === 'fallback'}
					<Toast.Title data-testid="title" />
					<Toast.Description data-testid="description" />
				{/if}
			</Toast.Root>
		</Toast.Viewport>
	{:else if scenario === 'static'}
		<Toast.Viewport>
			<Toast.Root
				toast={{ id: 'test', title: 'Toast title' }}
				data-testid="root"
				swipeDirection="up"
			>
				<Toast.Title />
				{#if ignore === 'base'}
					<div data-base-ui-swipe-ignore data-testid="ignore-target">Ignore swipe</div>
				{:else if ignore === 'legacy'}
					<div data-swipe-ignore data-testid="ignore-target">Ignore swipe</div>
				{/if}
			</Toast.Root>
		</Toast.Viewport>
	{:else}
		<ToastRootHarnessManaged {scenario} {showToasts} {longTitle} />
	{/if}
</Toast.Provider>
