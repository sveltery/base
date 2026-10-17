<script lang="ts">
	import { Tooltip } from '@sveltery/base/tooltip';

	const demoTooltip = Tooltip.createHandle<string>();

	const triggerClass =
		'flex size-8 items-center justify-center border border-neutral-950 bg-white text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white focus-visible:relative hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:data-popup-open:bg-neutral-800 dark:hover:bg-neutral-800 dark:active:bg-neutral-700';
	const arrowClass =
		"relative block w-3 h-1.5 overflow-clip transition-[left] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]";
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
	<div class="flex">
		<Tooltip.Trigger
			class={triggerClass}
			handle={demoTooltip}
			payload="Listen to audio preview"
			aria-label="Listen to audio preview"
		>
			{@render headphonesIcon()}
		</Tooltip.Trigger>

		<Tooltip.Trigger
			class="{triggerClass} border-l-0"
			handle={demoTooltip}
			payload="Set a timer"
			aria-label="Set a timer"
		>
			{@render stopwatchIcon()}
		</Tooltip.Trigger>

		<Tooltip.Trigger
			class="{triggerClass} border-l-0"
			handle={demoTooltip}
			payload="Delete: This action cannot be undone"
			aria-label="Delete: This action cannot be undone"
		>
			{@render trashIcon()}
		</Tooltip.Trigger>
	</div>

	<Tooltip.Root handle={demoTooltip}>
		{#snippet children({ payload })}
			<Tooltip.Portal>
				<Tooltip.Positioner
					sideOffset={11}
					class="
						h-[var(--positioner-height)] w-[var(--positioner-width)]
						max-w-[var(--available-width)]
						transition-[top,left,right,bottom,transform]
						duration-[0.35s]
						ease-[cubic-bezier(0.22,1,0.36,1)]
						data-instant:transition-none"
				>
					<Tooltip.Popup
						class="
							relative
							h-[var(--popup-height,auto)] w-[var(--popup-width,auto)]
							max-w-[500px]
							border border-neutral-950 dark:border-white
							bg-white dark:bg-neutral-950
							text-sm text-neutral-950 dark:text-white
							origin-[var(--transform-origin)]
							shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none
							transition-[width,height,opacity,transform]
							duration-[0.35s]
							ease-[cubic-bezier(0.22,1,0.36,1)]
							data-ending-style:opacity-0 data-ending-style:[transform:scale(0.9)]
							data-instant:transition-none
							data-starting-style:opacity-0 data-starting-style:[transform:scale(0.9)]"
					>
						<Tooltip.Arrow class={arrowClass} />

						<Tooltip.Viewport
							class="
								[--viewport-inline-padding:0.5rem]
								relative
								h-full w-full
								overflow-clip
								px-[var(--viewport-inline-padding)] py-1
								[&_[data-previous]]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))]
								[&_[data-previous]]:translate-x-0
								[&_[data-previous]]:opacity-100
								[&_[data-previous]]:transition-[translate,opacity]
								[&_[data-previous]]:duration-[350ms,175ms]
								[&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)]
								[&_[data-current]]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))]
								[&_[data-current]]:translate-x-0
								[&_[data-current]]:opacity-100
								[&_[data-current]]:transition-[translate,opacity]
								[&_[data-current]]:duration-[350ms,175ms]
								[&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)]
								data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2
								data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0
								data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2
								data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0
								[[data-instant]_&_[data-previous]]:transition-none
								[[data-instant]_&_[data-current]]:transition-none
								data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2
								data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0
								data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2
								data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0"
						>
							{payload}
						</Tooltip.Viewport>
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		{/snippet}
	</Tooltip.Root>
</Tooltip.Provider>
