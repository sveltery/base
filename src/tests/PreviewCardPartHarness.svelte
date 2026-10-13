<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PreviewCard } from '#lib';

	type Part = 'arrow' | 'backdrop' | 'popup' | 'portal' | 'positioner' | 'trigger' | 'viewport';

	let { part, variant = 'host' }: { part: Part; variant?: 'host' | 'render' } = $props();

	function mark(node: HTMLElement) {
		node.dataset.attached = 'yes';
	}

	const replacement = $derived(variant === 'render' ? swap : undefined);
</script>

{#snippet swap(props: object, _state: unknown, children: Snippet | undefined)}
	<div {...props} data-replacement="">
		{@render children?.()}
	</div>
{/snippet}

{#if part === 'trigger'}
	<PreviewCard.Root open>
		<PreviewCard.Trigger
			href="#"
			data-testid="part"
			class="probe"
			data-probe="probe"
			render={replacement}
			{@attach mark}
		>
			Link
		</PreviewCard.Trigger>
	</PreviewCard.Root>
{:else if part === 'backdrop'}
	<PreviewCard.Root open>
		<PreviewCard.Backdrop
			data-testid="part"
			class="probe"
			data-probe="probe"
			render={replacement}
			{@attach mark}
		/>
	</PreviewCard.Root>
{:else if part === 'portal'}
	<PreviewCard.Root open>
		<PreviewCard.Portal
			keepMounted
			data-testid="part"
			class="probe"
			data-probe="probe"
			render={replacement}
			{@attach mark}
		>
			<PreviewCard.Positioner>
				<PreviewCard.Popup>Content</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else if part === 'positioner'}
	<PreviewCard.Root open>
		<PreviewCard.Portal>
			<PreviewCard.Positioner
				data-testid="part"
				class="probe"
				data-probe="probe"
				render={replacement}
				{@attach mark}
			>
				<PreviewCard.Popup>Content</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else if part === 'popup'}
	<PreviewCard.Root open>
		<PreviewCard.Portal>
			<PreviewCard.Positioner>
				<PreviewCard.Popup
					data-testid="part"
					class="probe"
					data-probe="probe"
					render={replacement}
					{@attach mark}
				>
					Content
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else if part === 'arrow'}
	<PreviewCard.Root open>
		<PreviewCard.Portal>
			<PreviewCard.Positioner>
				<PreviewCard.Popup>
					<PreviewCard.Arrow
						data-testid="part"
						class="probe"
						data-probe="probe"
						render={replacement}
						{@attach mark}
					/>
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{:else}
	<PreviewCard.Root open>
		<PreviewCard.Trigger href="#">Trigger</PreviewCard.Trigger>
		<PreviewCard.Portal>
			<PreviewCard.Positioner>
				<PreviewCard.Popup>
					<PreviewCard.Viewport
						data-testid="part"
						class="probe"
						data-probe="probe"
						render={replacement}
						{@attach mark}
					>
						Content
					</PreviewCard.Viewport>
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
{/if}
