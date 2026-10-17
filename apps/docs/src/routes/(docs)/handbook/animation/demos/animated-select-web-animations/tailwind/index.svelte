<script lang="ts">
	import { Select } from '@sveltery/base/select';
	import type { Attachment } from 'svelte/attachments';

	const fonts = [
		{ label: 'Select font', value: null },
		{ label: 'Sans-serif', value: 'sans' },
		{ label: 'Serif', value: 'serif' },
		{ label: 'Monospace', value: 'mono' },
		{ label: 'Cursive', value: 'cursive' }
	];

	function animateOpen(open: boolean): Attachment<HTMLElement> {
		return (element) => {
			// A popup that mounts open has no earlier animation, so it starts from the closed values.
			const mountedOpen = open && element.getAnimations().length === 0;
			const { opacity, scale } = mountedOpen
				? { opacity: '0', scale: '0.8' }
				: getComputedStyle(element);
			element.animate(
				[
					{ opacity, scale },
					{ opacity: open ? 1 : 0, scale: open ? 1 : 0.8 }
				],
				{ duration: 200, easing: 'ease-out', fill: 'forwards' }
			);
		};
	}
</script>

<Select.Root items={fonts}>
	<Select.Trigger
		class="box-border flex h-8 min-w-36 items-center justify-between gap-3 border border-neutral-950 bg-white pr-1 pl-2 text-sm text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white"
	>
		<Select.Value
			class="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400"
		/>
		<Select.Icon class="flex">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
			</svg>
		</Select.Icon>
	</Select.Trigger>
	<Select.Portal>
		<Select.Positioner class="z-10 outline-none select-none" sideOffset={4}>
			<Select.Popup
				class="box-border min-w-[var(--anchor-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white bg-clip-padding text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				{#snippet render(props, state, children)}
					<div {...props} {@attach animateOpen(state.open)}>
						{@render children?.()}
					</div>
				{/snippet}
				<Select.ScrollUpArrow
					class="z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-xs dark:bg-neutral-950"
				/>
				<Select.List
					class="relative box-border max-h-[var(--available-height)] scroll-py-6 overflow-y-auto py-1"
				>
					{#each fonts as { label, value } (label)}
						<Select.Item
							{value}
							class="box-border grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm outline-none select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
						>
							<Select.ItemIndicator class="col-start-1">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path d="m2.5 8.5 4 4 7-9" />
								</svg>
							</Select.ItemIndicator>
							<Select.ItemText class="col-start-2">{label}</Select.ItemText>
						</Select.Item>
					{/each}
				</Select.List>
				<Select.ScrollDownArrow
					class="z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-xs dark:bg-neutral-950"
				/>
			</Select.Popup>
		</Select.Positioner>
	</Select.Portal>
</Select.Root>
