<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Dialog, Popover } from '#lib';

	let {
		part,
		defaultOpen = false,
		disabledTrigger = false,
		disabledClose = false
	}: {
		part: 'popover' | 'dialog';
		defaultOpen?: boolean;
		disabledTrigger?: boolean;
		disabledClose?: boolean;
	} = $props();

	let calls = $state<{ open: boolean; reason: string | undefined }[]>([]);
	let clicks = $state(0);
	let pointerdowns = $state(0);
	let mousedowns = $state(0);
	let keydowns = $state(0);
	let keyups = $state(0);

	function host(props: object): HTMLAttributes<HTMLElement> {
		return props as HTMLAttributes<HTMLElement>;
	}

	function changed(open: boolean, details: { reason: string }) {
		calls.push({ open, reason: details.reason });
	}

	const notes = {
		onclick: () => {
			clicks += 1;
		},
		onpointerdown: () => {
			pointerdowns += 1;
		},
		onmousedown: () => {
			mousedowns += 1;
		},
		onkeydown: () => {
			keydowns += 1;
		},
		onkeyup: () => {
			keyups += 1;
		}
	};
</script>

<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="clicks">{clicks}</pre>
<pre data-testid="pointerdowns">{pointerdowns}</pre>
<pre data-testid="mousedowns">{mousedowns}</pre>
<pre data-testid="keydowns">{keydowns}</pre>
<pre data-testid="keyups">{keyups}</pre>

{#snippet openHost(props: object)}
	<span {...host(props)}>Open</span>
{/snippet}

{#snippet closeHost(props: object)}
	<span {...host(props)}>Close</span>
{/snippet}

{#if part === 'popover'}
	<Popover.Root {defaultOpen} onOpenChange={changed}>
		<Popover.Trigger disabled={disabledTrigger} nativeButton={false} {...notes}>
			{#snippet render(props)}
				{@render openHost(props)}
			{/snippet}
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup>
					<Popover.Close disabled={disabledClose} nativeButton={false} {...notes}>
						{#snippet render(props)}
							{@render closeHost(props)}
						{/snippet}
					</Popover.Close>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else}
	<Dialog.Root {defaultOpen} onOpenChange={changed}>
		<Dialog.Trigger disabled={disabledTrigger} nativeButton={false} {...notes}>
			{#snippet render(props)}
				{@render openHost(props)}
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup>
				<Dialog.Close disabled={disabledClose} nativeButton={false} {...notes}>
					{#snippet render(props)}
						{@render closeHost(props)}
					{/snippet}
				</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{/if}
