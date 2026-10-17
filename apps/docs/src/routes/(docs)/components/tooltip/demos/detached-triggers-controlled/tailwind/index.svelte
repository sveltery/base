<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const demoTooltip = Tooltip.createHandle();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const iconButtonClass =
		'flex size-8 items-center justify-center border border-neutral-950 bg-white text-neutral-950 select-none data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white focus-visible:relative hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:data-popup-open:bg-neutral-800 dark:hover:bg-neutral-800 dark:active:bg-neutral-700';
	const buttonClass =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700';
	const popupClass =
		'relative flex flex-col border border-neutral-950 bg-white px-2 py-1 text-sm text-neutral-950 origin-[var(--transform-origin)] shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[transform,opacity] duration-100 ease-out data-ending-style:opacity-0 data-ending-style:[transform:scale(0.98)] data-instant:transition-none data-starting-style:opacity-0 data-starting-style:[transform:scale(0.98)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';
	const arrowClass =
		"relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]";
</script>

{#snippet headphonesIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		aria-hidden="true"
		style="display: block"
	>
		<path stroke-linecap="round" d="M1.5 11V7.5c0-2.5 2.5-6 6.5-6s6.5 3.5 6.5 6V11" />
		<path
			d="M12 7.5c1.3807 0 2.5 1.11929 2.5 2.5v2c0 1.3807-1.1193 2.5-2.5 2.5h-1.5v-7zm-8 0h1.5v7H4c-1.38071 0-2.5-1.1193-2.5-2.5v-2c0-1.38071 1.11929-2.5 2.5-2.5Z"
		/>
	</svg>
{/snippet}

{#snippet stopwatchIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		aria-hidden="true"
		style="display: block"
	>
		<circle cx="8" cy="8.5" r="6" />
		<path
			stroke-linecap="square"
			stroke-linejoin="round"
			d="M8 9.5v-5m0-2v-2m-2 0h4M12 4l1.5-1.5"
		/>
	</svg>
{/snippet}

{#snippet trashIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linejoin="round"
		aria-hidden="true"
		style="display: block"
	>
		<path stroke-linecap="square" d="M2.5 4h11" />
		<path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5s1.5.67157 1.5 1.5v1" />
		<path
			stroke-linecap="square"
			d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4"
		/>
	</svg>
{/snippet}

<Tooltip.Provider>
	<div class="flex gap-2 flex-wrap justify-center">
		<div class="flex">
			<Tooltip.Trigger
				class={iconButtonClass}
				handle={demoTooltip}
				id="trigger-1"
				aria-label="Controlled tooltip"
			>
				{@render headphonesIcon()}
			</Tooltip.Trigger>

			<Tooltip.Trigger
				class="{iconButtonClass} border-l-0"
				handle={demoTooltip}
				id="trigger-2"
				aria-label="Controlled tooltip"
			>
				{@render stopwatchIcon()}
			</Tooltip.Trigger>

			<Tooltip.Trigger
				class="{iconButtonClass} border-l-0"
				handle={demoTooltip}
				id="trigger-3"
				aria-label="Controlled tooltip"
			>
				{@render trashIcon()}
			</Tooltip.Trigger>
		</div>

		<button
			type="button"
			class={buttonClass}
			onclick={() => {
				triggerId = 'trigger-2';
				open = true;
			}}
		>
			Open programmatically
		</button>
	</div>

	<Tooltip.Root handle={demoTooltip} bind:open bind:triggerId>
		<Tooltip.Portal>
			<Tooltip.Positioner
				class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]"
				sideOffset={11}
			>
				<Tooltip.Popup class={popupClass}>
					<Tooltip.Arrow class={arrowClass} />
					Controlled tooltip
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
