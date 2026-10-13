<script lang="ts">
	import { Drawer } from '../lib/drawer/index.js';
	import DrawerProviderControls from './DrawerProviderControls.svelte';

	let {
		scenario,
		firstOpen = false,
		secondOpen = false,
		showSecond = true,
		showIndent = true,
		open = false
	}: {
		scenario:
			'multiple' | 'controls' | 'visual' | 'no-provider' | 'indent' | 'background' | 'content';
		firstOpen?: boolean;
		secondOpen?: boolean;
		showSecond?: boolean;
		showIndent?: boolean;
		open?: boolean;
	} = $props();
</script>

{#if scenario === 'multiple'}
	<Drawer.Provider>
		<Drawer.IndentBackground data-testid="background" />
		<Drawer.Root open={firstOpen}>First drawer</Drawer.Root>
		{#if showSecond}
			<Drawer.Root open={secondOpen}>Second drawer</Drawer.Root>
		{/if}
	</Drawer.Provider>
{:else if scenario === 'controls'}
	<Drawer.Provider>
		<Drawer.IndentBackground data-testid="background" />
		<DrawerProviderControls />
	</Drawer.Provider>
{:else if scenario === 'visual'}
	<Drawer.Provider>
		{#if showIndent}
			<Drawer.Indent data-testid="indent" />
		{/if}
		<DrawerProviderControls />
	</Drawer.Provider>
{:else if scenario === 'no-provider'}
	<Drawer.Indent data-testid="indent" />
	<Drawer.IndentBackground data-testid="background" />
{:else if scenario === 'indent'}
	<Drawer.Provider>
		<Drawer.IndentBackground data-testid="bg" />
		<Drawer.Indent data-testid="indent">
			<Drawer.Root {open}>
				<Drawer.Trigger>Open</Drawer.Trigger>
			</Drawer.Root>
		</Drawer.Indent>
	</Drawer.Provider>
{:else if scenario === 'background'}
	<Drawer.Provider>
		<Drawer.IndentBackground data-testid="bg" />
		<Drawer.Root {open}>
			<Drawer.Trigger>Open</Drawer.Trigger>
		</Drawer.Root>
	</Drawer.Provider>
{:else if scenario === 'content'}
	<Drawer.Root open={true}>
		<Drawer.Portal>
			<Drawer.Viewport>
				<Drawer.Popup>
					<Drawer.Content data-testid="content">Content</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{/if}
