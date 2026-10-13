<!--
	The toast list the Toast page demos share. A demo is a single component, and
	`getToastManager()` has to run in a component inside `Toast.Provider`, so the list lives here.
	The page's "Render the toasts" section shows this file's markup.
-->
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	let { anchored = false }: { anchored?: boolean } = $props();

	const manager = Toast.getToastManager();

	const button =
		'flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800';

	const stackedRoot =
		"[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] rounded-lg border border-gray-200 bg-gray-50 text-gray-900 shadow-lg select-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-[ending-style]:opacity-0 data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] h-[var(--height)] data-[expanded]:h-[var(--toast-height)] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]";

	const anchoredRoot =
		'relative flex w-max origin-[var(--transform-origin)] flex-col rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-900 shadow-md transition-[scale,opacity] duration-100 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

	const arrow =
		'size-2 rotate-45 border-gray-200 bg-gray-50 data-[side=bottom]:-top-1 data-[side=bottom]:border-t data-[side=bottom]:border-l data-[side=top]:-bottom-1 data-[side=top]:border-r data-[side=top]:border-b dark:border-gray-700 dark:bg-gray-900';
</script>

{#each manager.toasts as toast (toast.id)}
	{#if anchored}
		<Toast.Positioner {toast} class="z-50">
			<Toast.Root {toast} class={anchoredRoot}>
				<Toast.Arrow class={arrow} />
				<Toast.Content>
					<Toast.Description />
				</Toast.Content>
			</Toast.Root>
		</Toast.Positioner>
	{:else}
		<Toast.Root {toast} class={stackedRoot}>
			<Toast.Content
				class="flex items-center gap-4 overflow-hidden p-3 transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[behind]:opacity-0 data-[expanded]:opacity-100"
			>
				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<Toast.Title class="text-sm font-bold" />
					<Toast.Description class="text-sm text-gray-600 dark:text-gray-400" />
				</div>
				<Toast.Action class={button} />
				<Toast.Close class={button}>Dismiss</Toast.Close>
			</Toast.Content>
		</Toast.Root>
	{/if}
{/each}
