# Navigation Menu

<Subtitle>
  A collection of links and menus for website navigation.
</Subtitle>

<Meta name="description" content="A collection of links and menus for website navigation." />

```svelte demo
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';

	const triggerClassName =
		'flex h-8 items-center justify-center gap-1.5 bg-transparent px-2 text-sm font-normal text-neutral-950 no-underline select-none min-[501px]:px-3 hover:bg-neutral-100 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:bg-neutral-800 dark:data-pressed:bg-neutral-800';

	const contentClassName =
		'h-full w-[calc(100vw-40px)] p-2 min-[500px]:w-max min-[500px]:max-w-[400px] ' +
		'transition-[opacity,transform,translate] duration-[var(--duration)] ease-[var(--easing)] ' +
		'data-starting-style:opacity-0 data-ending-style:opacity-0 ' +
		'data-starting-style:data-[activation-direction=left]:translate-x-[-50%] ' +
		'data-starting-style:data-[activation-direction=right]:translate-x-[50%] ' +
		'data-ending-style:data-[activation-direction=left]:translate-x-[50%] ' +
		'data-ending-style:data-[activation-direction=right]:translate-x-[-50%]';

	const linkCardClassName =
		'relative block h-full w-full border-0 bg-transparent p-2 text-left text-inherit no-underline hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:hover:bg-neutral-800';

	const overviewLinks = [
		{
			href: '/overview/quick-start',
			title: 'Quick Start',
			description: 'Install and assemble your first component.'
		},
		{
			href: '/overview/accessibility',
			title: 'Accessibility',
			description: 'Learn how we build accessible components.'
		},
		{
			href: '/overview/releases',
			title: 'Releases',
			description: 'See what’s new in the latest Sveltery Base versions.'
		},
		{
			href: '/overview/about',
			title: 'About',
			description: 'Learn more about Sveltery Base and its goals.'
		}
	];

	const handbookLinks = [
		{
			href: '/handbook/styling',
			title: 'Styling',
			description:
				'Sveltery Base components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
		},
		{
			href: '/handbook/animation',
			title: 'Animation',
			description:
				'Sveltery Base components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
		},
		{
			href: '/handbook/composition',
			title: 'Composition',
			description:
				'Sveltery Base components can be replaced and composed with your own existing components.'
		}
	];
</script>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<NavigationMenu.Root class="min-w-max text-neutral-950 dark:text-white">
	<NavigationMenu.List class="relative flex gap-px">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={triggerClassName}>
				Overview
				<NavigationMenu.Icon
					class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
				>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class={contentClassName}>
				<ul class="m-0 grid list-none grid-cols-2 p-0 max-[500px]:grid-cols-1">
					{#each overviewLinks as item (item.href)}
						<li>
							<NavigationMenu.Link href={item.href} class={linkCardClassName}>
								<h3 class="m-0 mb-1 text-sm leading-4 font-normal">{item.title}</h3>
								<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
									{item.description}
								</p>
							</NavigationMenu.Link>
						</li>
					{/each}
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={triggerClassName}>
				Handbook
				<NavigationMenu.Icon
					class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
				>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class={contentClassName}>
				<ul class="m-0 flex max-w-[400px] list-none flex-col justify-center p-0">
					{#each handbookLinks as item (item.href)}
						<li>
							<NavigationMenu.Link href={item.href} class={linkCardClassName}>
								<h3 class="m-0 mb-1 text-sm leading-4 font-normal">{item.title}</h3>
								<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
									{item.description}
								</p>
							</NavigationMenu.Link>
						</li>
					{/each}
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link class={triggerClassName} href="https://github.com/sveltery/base">
				GitHub
			</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner
			sideOffset={10}
			collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
			collisionAvoidance={{ side: 'none' }}
			class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
			style="--duration: 0.35s; --easing: cubic-bezier(0.22, 1, 0.36, 1)"
		>
			<NavigationMenu.Popup
				class="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none transition-[opacity,transform,width,height,scale] duration-[var(--duration)] ease-[var(--easing)] data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-[ease] data-starting-style:scale-90 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<NavigationMenu.Arrow
					class="relative block h-1.5 w-3 overflow-clip transition-[left,right] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:bottom-0 before:left-1/2 before:block before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:-translate-x-1/2 before:translate-y-1/2 before:rotate-45 before:border before:border-neutral-950 before:bg-white before:content-[''] data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 dark:before:border-white dark:before:bg-neutral-950"
				/>
				<NavigationMenu.Viewport class="relative h-full w-full overflow-hidden" />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>
				<NavigationMenu.Icon />
			</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link />
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Backdrop />
		<NavigationMenu.Positioner>
			<NavigationMenu.Popup>
				<NavigationMenu.Arrow />
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

## Examples

### Nested submenus

`<NavigationMenu.Root>` component can be nested within a higher-level `<NavigationMenu.Content>` part to create a multi-level navigation menu.

```svelte demo
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';

	const triggerClassName =
		'flex h-8 items-center justify-center gap-1.5 bg-transparent px-2 text-sm font-normal text-neutral-950 no-underline select-none min-[501px]:px-3 hover:bg-neutral-100 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:bg-neutral-800 dark:data-pressed:bg-neutral-800';

	const contentTransitionClassName =
		'transition-[opacity,transform,translate] duration-[var(--duration)] ease-[var(--easing)] ' +
		'data-starting-style:opacity-0 data-ending-style:opacity-0 ' +
		'data-starting-style:data-[activation-direction=left]:translate-x-[-50%] ' +
		'data-starting-style:data-[activation-direction=right]:translate-x-[50%] ' +
		'data-ending-style:data-[activation-direction=left]:translate-x-[50%] ' +
		'data-ending-style:data-[activation-direction=right]:translate-x-[-50%]';

	const contentClassName = `h-full w-[calc(100vw_-_40px)] p-2 min-[500px]:w-max min-[500px]:min-w-[400px] ${contentTransitionClassName}`;

	const linkCardClassName =
		'relative block h-full w-full border-0 bg-transparent p-2 text-left text-inherit no-underline hover:bg-neutral-100 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:hover:bg-neutral-800 dark:data-pressed:bg-neutral-800';

	const overviewLinks = [
		{
			href: '/overview/quick-start',
			title: 'Quick Start',
			description: 'Install and assemble your first component.'
		},
		{
			href: '/overview/accessibility',
			title: 'Accessibility',
			description: 'Learn how we build accessible components.'
		},
		{
			href: '/overview/releases',
			title: 'Releases',
			description: 'See what’s new in the latest Sveltery Base versions.'
		}
	];

	const handbookLinks = [
		{
			href: '/handbook/styling',
			title: 'Styling',
			description:
				'Sveltery Base components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
		},
		{
			href: '/handbook/animation',
			title: 'Animation',
			description:
				'Sveltery Base components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
		},
		{
			href: '/handbook/composition',
			title: 'Composition',
			description:
				'Sveltery Base components can be replaced and composed with your own existing components.'
		}
	];
</script>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

{#snippet caretRightIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M6 12V4l4.5 4z" />
	</svg>
{/snippet}

<NavigationMenu.Root class="min-w-max text-neutral-950 dark:text-white">
	<NavigationMenu.List class="relative flex gap-px">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={triggerClassName}>
				Overview
				<NavigationMenu.Icon
					class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
				>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class={contentClassName}>
				<ul class="m-0 grid list-none grid-cols-2 p-0 min-[640px]:grid-cols-[12rem_12rem]">
					{#each overviewLinks as item (item.href)}
						<li>
							<NavigationMenu.Link href={item.href} class={linkCardClassName}>
								<h3 class="m-0 mb-1 text-sm leading-4 font-normal">{item.title}</h3>
								<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
									{item.description}
								</p>
							</NavigationMenu.Link>
						</li>
					{/each}
					<li>
						<NavigationMenu.Root orientation="vertical">
							<NavigationMenu.List>
								<NavigationMenu.Item>
									<NavigationMenu.Trigger class={linkCardClassName}>
										<span class="m-0 mb-1 text-sm leading-4 font-normal">Handbook</span>
										<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
											How to use Sveltery Base effectively.
										</p>
										<NavigationMenu.Icon
											class="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center justify-center transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
										>
											{@render caretRightIcon()}
										</NavigationMenu.Icon>
									</NavigationMenu.Trigger>
									<NavigationMenu.Content class={contentClassName}>
										<ul class="m-0 flex max-w-[400px] list-none flex-col justify-center p-0">
											{#each handbookLinks as item (item.href)}
												<li>
													<NavigationMenu.Link href={item.href} class={linkCardClassName}>
														<h3 class="m-0 mb-1 text-sm leading-4 font-normal">
															{item.title}
														</h3>
														<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
															{item.description}
														</p>
													</NavigationMenu.Link>
												</li>
											{/each}
										</ul>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							</NavigationMenu.List>

							<NavigationMenu.Portal>
								<NavigationMenu.Positioner
									sideOffset={8}
									alignOffset={-8}
									align="end"
									side="right"
									class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
									style="--duration: 0.35s; --easing: cubic-bezier(0.22, 1, 0.36, 1)"
								>
									<NavigationMenu.Popup
										class="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none transition-[opacity,transform,width,height,scale] duration-[var(--duration)] ease-[var(--easing)] data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-[ease] data-starting-style:scale-90 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
									>
										<NavigationMenu.Viewport class="relative h-full w-full overflow-hidden" />
									</NavigationMenu.Popup>
								</NavigationMenu.Positioner>
							</NavigationMenu.Portal>
						</NavigationMenu.Root>
					</li>
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner
			sideOffset={10}
			collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
			class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
			style="--duration: 0.35s; --easing: cubic-bezier(0.22, 1, 0.36, 1)"
		>
			<NavigationMenu.Popup
				class="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none transition-[opacity,transform,width,height,scale] duration-[var(--duration)] ease-[var(--easing)] data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-[ease] data-starting-style:scale-90 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<NavigationMenu.Arrow
					class="relative block h-1.5 w-3 overflow-clip transition-[left,right] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:bottom-0 before:left-1/2 before:block before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:-translate-x-1/2 before:translate-y-1/2 before:rotate-45 before:border before:border-neutral-950 before:bg-white before:content-[''] data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 dark:before:border-white dark:before:bg-neutral-950"
				/>
				<NavigationMenu.Viewport class="relative h-full w-full overflow-hidden" />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

### Nested inline submenus

For second-level navigation that should stay in the same panel, omit the nested `<NavigationMenu.Portal>` and render only `List` + `Viewport` with an initial `value`.

```svelte demo
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { NavigationMenu } from '@sveltery/base/navigation-menu';

	const isDesktop = new MediaQuery('min-width: 700px', true);

	const audienceMenus = [
		{
			value: 'developers',
			label: 'Developers',
			hint: 'Go from idea to UI faster.',
			title: 'Build product UI without giving up control',
			description:
				'Start with accessible parts and shape them to your app instead of working around a preset design system.',
			links: [
				{
					href: '/overview/quick-start',
					title: 'Quick start',
					description:
						'Install Sveltery Base and get your first interactive primitive on screen fast.'
				},
				{
					href: '/handbook/composition',
					title: 'Composition',
					description: 'Wrap and combine parts to match your product structure without hacks.'
				}
			]
		},
		{
			value: 'systems',
			label: 'Design Systems',
			hint: 'Keep patterns aligned across teams.',
			title: 'Turn shared standards into working components',
			description:
				'Connect tokens, states, and accessibility rules once, then give every product team the same solid starting point.',
			links: [
				{
					href: '/handbook/styling',
					title: 'Styling',
					description: 'Map tokens and component states to your own CSS or utility setup.'
				},
				{
					href: '/overview/accessibility',
					title: 'Accessibility',
					description: 'Review keyboard support and semantic defaults before anything ships.'
				},
				{
					href: '/components/tooltip',
					title: 'Tooltip',
					description: 'Set one clear pattern for lightweight help, hints, and field guidance.'
				},
				{
					href: '/components/popover',
					title: 'Popover',
					description: 'Handle richer anchored panels like menus, inspectors, and onboarding.'
				}
			]
		},
		{
			value: 'managers',
			label: 'Engineering Leads',
			hint: 'Roll out shared UI without drag.',
			title: 'Give squads clear defaults and room to move',
			description:
				'Use the docs to align on quality bars, upgrades, and extension points while still leaving teams space to customize.',
			links: [
				{
					href: '/overview/releases',
					title: 'Releases',
					description: 'Track version changes and migration notes before upgrades surprise teams.'
				},
				{
					href: '/handbook/typescript',
					title: 'TypeScript',
					description: 'See how the primitives type custom wrappers and shared abstractions.'
				},
				{
					href: '/handbook/forms',
					title: 'Forms',
					description: 'Standardize validation and field patterns teams reach for constantly.'
				}
			]
		},
		{
			value: 'startups',
			label: 'Startups',
			hint: 'Ship polished basics while things change.',
			title: 'Get sturdy UI foundations in place early',
			description:
				'Cover the hard interaction details now so your team can spend more time on the product ideas that actually differentiate you.',
			links: [
				{
					href: '/overview/quick-start',
					title: 'Quick start',
					description: 'Get the package installed and your first component working in minutes.'
				},
				{
					href: '/components/menu',
					title: 'Menu',
					description: 'Add action menus with keyboard support and focus handling already done.'
				},
				{
					href: '/components/dialog',
					title: 'Dialog',
					description: 'Launch settings or upgrade flows without rebuilding focus management.'
				}
			]
		}
	];

	const guidesPanel = {
		title: 'Where teams usually start',
		description:
			'These are the docs people reach for first when they are turning a prototype into shared UI.'
	};

	const guideLinks = [
		{
			href: '/overview/accessibility',
			title: 'Accessibility handbook',
			description: 'Take a practical pass over focus order, semantics, and keyboard support.'
		},
		{
			href: '/handbook/composition',
			title: 'Composition handbook',
			description: 'Learn when to wrap parts, share behavior, and expose flexible APIs.'
		},
		{
			href: '/handbook/styling',
			title: 'Styling handbook',
			description: 'Apply tokens and state styles without fighting the underlying markup.'
		}
	];

	const triggerClassName =
		'flex h-8 items-center justify-center gap-1.5 bg-transparent px-2 text-sm font-normal text-neutral-950 no-underline select-none min-[501px]:px-3 hover:bg-neutral-100 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:text-white dark:hover:bg-neutral-800 dark:data-pressed:bg-neutral-800';

	const sharedContentClassName =
		'h-full w-[calc(100vw_-_40px)] ' +
		'transition-[opacity,translate] duration-[calc(var(--duration)*0.5),var(--duration)] ease-[ease,cubic-bezier(0.4,0,0.2,1)] ' +
		'data-starting-style:data-[activation-direction=left]:opacity-0 data-starting-style:data-[activation-direction=right]:opacity-0 data-ending-style:opacity-0 ' +
		'data-ending-style:duration-[calc(var(--duration)*0.5)] data-ending-style:ease-[ease] ' +
		'data-starting-style:data-[activation-direction=left]:translate-x-[-2rem] ' +
		'data-starting-style:data-[activation-direction=right]:translate-x-[2rem] ' +
		'data-ending-style:data-[activation-direction=left]:translate-x-[2rem] ' +
		'data-ending-style:data-[activation-direction=right]:translate-x-[-2rem]';

	const productContentClassName = `${sharedContentClassName} p-0 min-[700px]:[width:min(675px,calc(100vw-40px))]`;

	const guidesContentClassName = `${sharedContentClassName} p-0 min-[700px]:[width:min(500px,calc(100vw-40px))]`;

	const submenuTriggerClassName =
		'm-0 flex w-full min-w-[10rem] flex-col items-start gap-1 border-0 bg-transparent p-2 text-left text-inherit hover:bg-neutral-100 data-pressed:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:hover:bg-neutral-800 dark:data-pressed:bg-neutral-800';

	const submenuContentClassName =
		'flex h-full translate-x-0 flex-col gap-4 p-4 min-[700px]:blur-0 transition-[opacity,translate,filter] duration-[var(--duration)] ease-[var(--easing)] min-[700px]:duration-[calc(var(--duration)*1.35)] min-[700px]:ease-[cubic-bezier(0.16,1,0.3,1)] ' +
		'data-starting-style:data-[activation-direction=left]:opacity-0 data-starting-style:data-[activation-direction=right]:opacity-0 data-starting-style:data-[activation-direction=left]:translate-x-[-50%] data-starting-style:data-[activation-direction=right]:translate-x-[50%] ' +
		'data-ending-style:opacity-0 data-ending-style:data-[activation-direction=left]:translate-x-[50%] data-ending-style:data-[activation-direction=right]:translate-x-[-50%] ' +
		'min-[700px]:data-starting-style:data-[activation-direction=up]:opacity-0 min-[700px]:data-starting-style:data-[activation-direction=down]:opacity-0 min-[700px]:data-starting-style:data-[activation-direction=up]:translate-y-[-72px] min-[700px]:data-starting-style:data-[activation-direction=down]:translate-y-[72px] min-[700px]:data-starting-style:blur-[2px] ' +
		'min-[700px]:data-ending-style:data-[activation-direction=up]:translate-y-[72px] min-[700px]:data-ending-style:data-[activation-direction=down]:translate-y-[-72px] min-[700px]:data-ending-style:blur-[2px]';

	const linkCardClassName =
		'relative block h-full w-full border-0 bg-transparent p-2 text-left text-inherit no-underline hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:hover:bg-neutral-800';
</script>

{#snippet caretDownIcon()}
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: block">
		<path d="M12 6H4l4 4.5z" />
	</svg>
{/snippet}

<NavigationMenu.Root class="min-w-max text-neutral-950 dark:text-white">
	<NavigationMenu.List class="relative flex gap-px">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={triggerClassName}>
				Product
				<NavigationMenu.Icon
					class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
				>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class={productContentClassName}>
				<NavigationMenu.Root
					class="overflow-hidden overflow-clip text-neutral-950 dark:text-white"
					orientation={isDesktop.current ? 'vertical' : 'horizontal'}
					value="developers"
				>
					<div
						class="grid grid-cols-1 overflow-hidden overflow-clip min-[700px]:grid-cols-[13rem_minmax(0,1fr)]"
					>
						<NavigationMenu.List
							class="m-0 flex list-none flex-row gap-1 overflow-x-auto p-2 min-[700px]:h-[var(--popup-height)] min-[700px]:flex-col min-[700px]:gap-px min-[700px]:overflow-x-visible min-[700px]:overflow-y-clip min-[700px]:border-r min-[700px]:border-r-neutral-950 min-[700px]:transition-[height] min-[700px]:duration-[var(--duration)] min-[700px]:ease-[var(--easing)] dark:min-[700px]:border-r-white"
						>
							{#each audienceMenus as menu (menu.value)}
								<NavigationMenu.Item value={menu.value}>
									<NavigationMenu.Trigger class={submenuTriggerClassName}>
										<span class="text-sm leading-4 font-normal text-neutral-950 dark:text-white">
											{menu.label}
										</span>
										<span class="text-sm text-neutral-500 dark:text-neutral-400">
											{menu.hint}
										</span>
									</NavigationMenu.Trigger>
									<NavigationMenu.Content class={submenuContentClassName}>
										<div>
											<h4 class="m-0 text-base leading-5 font-normal">{menu.title}</h4>
											<p class="m-0 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
												{menu.description}
											</p>
										</div>
										<ul class="-mx-2 m-0 flex list-none flex-col gap-0 p-0">
											{#each menu.links as link (link.href)}
												<li>
													<NavigationMenu.Link class={linkCardClassName} href={link.href}>
														<h5 class="m-0 text-sm leading-4 font-normal">{link.title}</h5>
														<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
															{link.description}
														</p>
													</NavigationMenu.Link>
												</li>
											{/each}
										</ul>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							{/each}
						</NavigationMenu.List>
						<NavigationMenu.Viewport
							class="relative min-h-[16.5rem] overflow-hidden border-t border-neutral-950 min-[700px]:border-t-0 dark:border-white"
						/>
					</div>
				</NavigationMenu.Root>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Trigger class={triggerClassName}>
				Learn
				<NavigationMenu.Icon
					class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
				>
					{@render caretDownIcon()}
				</NavigationMenu.Icon>
			</NavigationMenu.Trigger>

			<NavigationMenu.Content class={guidesContentClassName}>
				<div class="flex flex-col gap-4 p-4 text-neutral-950 dark:text-white">
					<div>
						<h4 class="m-0 text-base leading-5 font-normal">{guidesPanel.title}</h4>
						<p class="m-0 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
							{guidesPanel.description}
						</p>
					</div>
					<ul class="-mx-2 m-0 flex list-none flex-col gap-0 p-0">
						{#each guideLinks as link (link.href)}
							<li>
								<NavigationMenu.Link class={linkCardClassName} href={link.href}>
									<h5 class="m-0 text-sm leading-4 font-normal">{link.title}</h5>
									<p class="m-0 text-sm text-neutral-500 dark:text-neutral-400">
										{link.description}
									</p>
								</NavigationMenu.Link>
							</li>
						{/each}
					</ul>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link class={triggerClassName} href="/overview/releases">
				Releases
			</NavigationMenu.Link>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link class={triggerClassName} href="https://github.com/sveltery/base">
				GitHub
			</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>

	<NavigationMenu.Portal>
		<NavigationMenu.Positioner
			sideOffset={10}
			collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
			collisionAvoidance={{ side: 'none' }}
			class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
			style="--duration: 0.35s; --easing: cubic-bezier(0.22, 1, 0.36, 1)"
		>
			<NavigationMenu.Popup
				class="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none transition-[opacity,transform,width,height,scale] duration-[var(--duration)] ease-[var(--easing)] data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-[ease] data-ending-style:transition-[opacity,scale] data-starting-style:scale-90 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<NavigationMenu.Arrow
					class="relative block h-1.5 w-3 overflow-clip transition-[left,right] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:bottom-0 before:left-1/2 before:block before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:-translate-x-1/2 before:translate-y-1/2 before:rotate-45 before:border before:border-neutral-950 before:bg-white before:content-[''] data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 dark:before:border-white dark:before:bg-neutral-950"
				/>
				<NavigationMenu.Viewport class="relative h-full w-full overflow-hidden" />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
</NavigationMenu.Root>
```

### Custom links

The `<NavigationMenu.Link>` part can be customized to render the link from your framework using the `render` prop to enable client-side routing.

```svelte title="Custom link component example"
<script lang="ts">
	import { NavigationMenu } from '@sveltery/base/navigation-menu';
	// @highlight
	import MyLink from './MyLink.svelte';
</script>

<NavigationMenu.Link href="/docs">
	<!-- @highlight-start -->
	{#snippet render(props, state, children)}
		<MyLink {...props}>{@render children?.()}</MyLink>
	{/snippet}
	<!-- @highlight-end -->
</NavigationMenu.Link>
```

### Large menus

When you have large menu content that doesn't fit in the viewport in some cases, you usually have two choices:

1. Compress the navigation menu content

You can change the layout of the navigation menu to render less content or be more compact by reducing the space it takes up.
If your content is flexible, you can use the `max-height` property on `.Popup` to limit the height of the navigation menu to let it compress itself while preventing overflow.

```css title="Compact layout"
.Content,
.Popup {
	max-height: var(--available-height);
}
```

2. Make the navigation menu scrollable

```css title="Scrollable layout"
.Content,
.Popup {
	max-height: var(--available-height);
}

.Content {
	overflow-y: auto;
}
```

Native scrollbars are visible while transitioning content, so we recommend using the [Scroll Area](/components/scroll-area) component instead of native scrollbars to keep them hidden, which also allows the `Arrow` to be centered correctly.

## Closing animations

The popup stays rendered until its closing animation finishes.
See [JavaScript animations](/handbook/animation#javascript-animations) for animating it with Svelte transitions and for manual control.
For Navigation Menu, call `eventDetails.preventUnmountOnClose()` in `onValueChange` when the value becomes `null`, and call `close()` on the root (bound with `bind:this`) instead of setting `value` to `null` directly.

## API reference

### Root

<ApiPart name="navigation-menu" part="Root" />

### List

<ApiPart name="navigation-menu" part="List" />

### Item

<ApiPart name="navigation-menu" part="Item" />

### Trigger

<ApiPart name="navigation-menu" part="Trigger" />

| Attribute         | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `data-popup-open` | Present when the corresponding navigation menu is open. |
| `data-pressed`    | Present when the trigger is pressed.                    |
| `data-disabled`   | Present when the trigger is disabled.                   |

### Icon

<ApiPart name="navigation-menu" part="Icon" />

| Attribute         | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `data-popup-open` | Present when the navigation menu is open and the item is active. |

### Content

<ApiPart name="navigation-menu" part="Content" />

| Attribute                   | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `data-open`                 | Present when the popup is open.                     |
| `data-closed`               | Present when the popup is closed.                   |
| `data-activation-direction` | Which direction another trigger was activated from. |
| `data-starting-style`       | Present when the content begins animating in.       |
| `data-ending-style`         | Present when the content is animating out.          |

### Link

<ApiPart name="navigation-menu" part="Link" />

| Attribute     | Description                                         |
| ------------- | --------------------------------------------------- |
| `data-active` | Present when the link is the currently active page. |

### Backdrop

<ApiPart name="navigation-menu" part="Backdrop" />

| Attribute             | Description                                 |
| --------------------- | ------------------------------------------- |
| `data-open`           | Present when the popup is open.             |
| `data-closed`         | Present when the popup is closed.           |
| `data-starting-style` | Present when the popup begins animating in. |
| `data-ending-style`   | Present when the popup is animating out.    |

### Portal

<ApiPart name="navigation-menu" part="Portal" />

### Positioner

<ApiPart name="navigation-menu" part="Positioner" />

| Attribute            | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `data-open`          | Present when the popup is open.                                       |
| `data-closed`        | Present when the popup is closed.                                     |
| `data-anchor-hidden` | Present when the anchor is hidden.                                    |
| `data-align`         | Indicates how the popup is aligned relative to the specified side.    |
| `data-instant`       | Present if animations should be instant.                              |
| `data-side`          | Indicates which side the popup is positioned relative to the trigger. |

| CSS Variable          | Description                                                                            |
| --------------------- | -------------------------------------------------------------------------------------- |
| `--anchor-height`     | The anchor's height.                                                                   |
| `--anchor-width`      | The anchor's width.                                                                    |
| `--available-height`  | The available height between the trigger and the edge of the viewport.                 |
| `--available-width`   | The available width between the trigger and the edge of the viewport.                  |
| `--positioner-height` | The fixed height of the positioner element.                                            |
| `--positioner-width`  | The fixed width of the positioner element.                                             |
| `--transform-origin`  | The coordinates that this element is anchored to. Used for animations and transitions. |

### Popup

<ApiPart name="navigation-menu" part="Popup" />

| Attribute             | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `data-open`           | Present when the popup is open.                                       |
| `data-closed`         | Present when the popup is closed.                                     |
| `data-anchor-hidden`  | Present when the anchor is hidden.                                    |
| `data-align`          | Indicates how the popup is aligned relative to the specified side.    |
| `data-side`           | Indicates which side the popup is positioned relative to the trigger. |
| `data-starting-style` | Present when the popup begins animating in.                           |
| `data-ending-style`   | Present when the popup is animating out.                              |

| CSS Variable     | Description                            |
| ---------------- | -------------------------------------- |
| `--popup-height` | The fixed height of the popup element. |
| `--popup-width`  | The fixed width of the popup element.  |

### Viewport

<ApiPart name="navigation-menu" part="Viewport" />

### Arrow

<ApiPart name="navigation-menu" part="Arrow" />

| Attribute         | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `data-open`       | Present when the popup is open.                                       |
| `data-closed`     | Present when the popup is closed.                                     |
| `data-uncentered` | Present when the popup arrow is uncentered.                           |
| `data-align`      | Indicates how the popup is aligned relative to specified side.        |
| `data-side`       | Indicates which side the popup is positioned relative to the trigger. |
