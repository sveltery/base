<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
	import { ScrollArea } from '@sveltery/base/scroll-area';

	const ITEMS = [
		{ href: '/overview', label: 'Overview' },
		{ href: '/components', label: 'Components' },
		{ href: '/utils', label: 'Utilities' },
		{ href: '/overview/releases', label: 'Releases' }
	] as const;

	const LONG_LIST = [
		{ href: '/components/accordion', label: 'Accordion' },
		{ href: '/components/alert-dialog', label: 'Alert Dialog' },
		{ href: '/components/autocomplete', label: 'Autocomplete' },
		{ href: '/components/avatar', label: 'Avatar' },
		{ href: '/components/button', label: 'Button' },
		{ href: '/components/checkbox', label: 'Checkbox' },
		{ href: '/components/checkbox-group', label: 'Checkbox Group' },
		{ href: '/components/collapsible', label: 'Collapsible' },
		{ href: '/components/combobox', label: 'Combobox' },
		{ href: '/components/context-menu', label: 'Context Menu' },
		{ href: '/components/dialog', label: 'Dialog' },
		{ href: '/components/drawer', label: 'Drawer' },
		{ href: '/components/field', label: 'Field' },
		{ href: '/components/fieldset', label: 'Fieldset' },
		{ href: '/components/form', label: 'Form' },
		{ href: '/components/input', label: 'Input' },
		{ href: '/components/menu', label: 'Menu' },
		{ href: '/components/menubar', label: 'Menubar' },
		{ href: '/components/meter', label: 'Meter' },
		{ href: '/components/navigation-menu', label: 'Navigation Menu' },
		{ href: '/components/number-field', label: 'Number Field' },
		{ href: '/components/otp-field', label: 'OTP Field' },
		{ href: '/components/popover', label: 'Popover' },
		{ href: '/components/preview-card', label: 'Preview Card' },
		{ href: '/components/progress', label: 'Progress' },
		{ href: '/components/radio-group', label: 'Radio Group' },
		{ href: '/components/scroll-area', label: 'Scroll Area' },
		{ href: '/components/select', label: 'Select' },
		{ href: '/components/separator', label: 'Separator' },
		{ href: '/components/slider', label: 'Slider' },
		{ href: '/components/switch', label: 'Switch' },
		{ href: '/components/tabs', label: 'Tabs' },
		{ href: '/components/toast', label: 'Toast' },
		{ href: '/components/toggle', label: 'Toggle' },
		{ href: '/components/toggle-group', label: 'Toggle Group' },
		{ href: '/components/toolbar', label: 'Toolbar' },
		{ href: '/components/tooltip', label: 'Tooltip' }
	] as const;

	const button =
		'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';

	const link =
		'flex h-12 w-full items-center border border-neutral-950 bg-white px-4 text-sm text-neutral-950 no-underline hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white';
</script>

<Drawer.Root>
	<Drawer.Trigger class={button}>Open mobile menu</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop
			class="[--backdrop-opacity:1] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-[linear-gradient(to_bottom,rgb(0_0_0/5%)_0,rgb(0_0_0/10%)_50%)] opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-600 ease-[var(--ease-out-fast)] supports-[-webkit-touch-callout:none]:absolute data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)]"
		/>
		<Drawer.Viewport class="group fixed inset-0">
			<ScrollArea.Root
				style="position: static"
				class="h-full overscroll-contain transition-transform duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-starting-style:translate-y-[100dvh] group-data-ending-style:pointer-events-none"
			>
				<ScrollArea.Viewport class="h-full overscroll-contain touch-auto">
					<ScrollArea.Content
						class="flex min-h-full items-end justify-center pt-8 min-[42rem]:px-16 min-[42rem]:py-16"
					>
						<Drawer.Popup
							class="group w-full max-w-[42rem] outline-none transition-transform duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] [transform:translateY(var(--drawer-swipe-movement-y))] data-swiping:select-none data-ending-style:[transform:translateY(calc(max(100dvh,100%)+2px))] data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] motion-reduce:transition-none"
						>
							<nav
								aria-label="Navigation"
								class="relative flex flex-col border-t border-neutral-950 bg-white px-6 pt-4 pb-6 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] group-data-ending-style:shadow-[0.25rem_0.25rem_0] group-data-ending-style:shadow-black/0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none min-[42rem]:border"
							>
								<div class="grid grid-cols-[1fr_auto_1fr] items-start">
									<div aria-hidden="true" class="h-9 w-9"></div>
									<div
										class="h-1 w-12 justify-self-center bg-neutral-300 dark:bg-neutral-700"
									></div>
									<Drawer.Close
										aria-label="Close menu"
										class="flex h-8 w-8 items-center justify-center justify-self-end border-0 bg-transparent text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											stroke-linecap="square"
											stroke-linejoin="round"
											style="display: block"
										>
											<path d="m2.5 2.5 11 11m-11 0 11-11" />
										</svg>
									</Drawer.Close>
								</div>

								<Drawer.Content class="w-full">
									<Drawer.Title class="m-0 mb-1 text-base font-bold">Menu</Drawer.Title>
									<Drawer.Description
										class="m-0 mb-5 text-sm text-neutral-600 dark:text-neutral-400"
									>
										Scroll the long list. Flick down from the top to dismiss.
									</Drawer.Description>

									<div class="pb-8">
										<ul class="grid list-none gap-1 p-0 m-0">
											{#each ITEMS as item (item.label)}
												<li class="flex">
													<a class={link} href={item.href}>{item.label}</a>
												</li>
											{/each}
										</ul>

										<ul aria-label="Component links" class="mt-6 grid list-none gap-1 p-0 m-0">
											{#each LONG_LIST as item (item.label)}
												<li class="flex">
													<a class={link} href={item.href}>{item.label}</a>
												</li>
											{/each}
										</ul>
									</div>
								</Drawer.Content>
							</nav>
						</Drawer.Popup>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar
					class="pointer-events-none absolute m-px flex w-4 justify-center bg-black/12 dark:bg-white/12 opacity-0 transition-opacity duration-250 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-75 data-scrolling:delay-[0ms] hover:pointer-events-auto hover:opacity-100 hover:duration-75 hover:delay-[0ms] data-ending-style:opacity-0 data-ending-style:duration-250"
				>
					<ScrollArea.Thumb class="w-full bg-neutral-950 dark:bg-white" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
