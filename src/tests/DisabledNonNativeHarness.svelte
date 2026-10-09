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
</script>

<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="clicks">{clicks}</pre>
<pre data-testid="pointerdowns">{pointerdowns}</pre>
<pre data-testid="mousedowns">{mousedowns}</pre>
<pre data-testid="keydowns">{keydowns}</pre>
<pre data-testid="keyups">{keyups}</pre>

{#if part === 'popover'}
	<Popover.Root
		{defaultOpen}
		onOpenChange={(open, details) => {
			calls.push({ open, reason: details.reason });
		}}
	>
		<Popover.Trigger
			disabled={disabledTrigger}
			nativeButton={false}
			onclick={() => {
				clicks += 1;
			}}
			onpointerdown={() => {
				pointerdowns += 1;
			}}
			onmousedown={() => {
				mousedowns += 1;
			}}
			onkeydown={() => {
				keydowns += 1;
			}}
			onkeyup={() => {
				keyups += 1;
			}}
		>
			{#snippet render(props)}
				<span {...host(props)}>Open</span>
			{/snippet}
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Positioner>
				<Popover.Popup>
					<Popover.Close
						disabled={disabledClose}
						nativeButton={false}
						onpointerdown={() => {
							pointerdowns += 1;
						}}
						onmousedown={() => {
							mousedowns += 1;
						}}
						onkeydown={() => {
							keydowns += 1;
						}}
						onkeyup={() => {
							keyups += 1;
						}}
					>
						{#snippet render(props)}
							<span {...host(props)}>Close</span>
						{/snippet}
					</Popover.Close>
				</Popover.Popup>
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{:else}
	<Dialog.Root
		{defaultOpen}
		onOpenChange={(open, details) => {
			calls.push({ open, reason: details.reason });
		}}
	>
		<Dialog.Trigger
			disabled={disabledTrigger}
			nativeButton={false}
			onclick={() => {
				clicks += 1;
			}}
			onpointerdown={() => {
				pointerdowns += 1;
			}}
			onmousedown={() => {
				mousedowns += 1;
			}}
			onkeydown={() => {
				keydowns += 1;
			}}
			onkeyup={() => {
				keyups += 1;
			}}
		>
			{#snippet render(props)}
				<span {...host(props)}>Open</span>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Popup>
				<Dialog.Close
					disabled={disabledClose}
					nativeButton={false}
					onpointerdown={() => {
						pointerdowns += 1;
					}}
					onmousedown={() => {
						mousedowns += 1;
					}}
					onkeydown={() => {
						keydowns += 1;
					}}
					onkeyup={() => {
						keyups += 1;
					}}
				>
					{#snippet render(props)}
						<span {...host(props)}>Close</span>
					{/snippet}
				</Dialog.Close>
			</Dialog.Popup>
		</Dialog.Portal>
	</Dialog.Root>
{/if}
