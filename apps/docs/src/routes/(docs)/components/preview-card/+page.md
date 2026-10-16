# Preview Card

<Subtitle>
  A link that shows a destination preview without interrupting keyboard or screen reader navigation.
</Subtitle>

<Meta name="description" content="A link that shows a destination preview without interrupting keyboard or screen reader navigation." />

```svelte demo
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';
</script>

<PreviewCard.Root>
	<p class="text-base text-neutral-950 text-balance dark:text-white">
		The principles of good
		<PreviewCard.Trigger
			class="text-neutral-950 underline decoration-neutral-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-neutral-950 data-popup-open:decoration-neutral-950 focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:text-white dark:decoration-white/60 dark:hover:decoration-white dark:data-popup-open:decoration-white dark:focus-visible:outline-white"
			href="https://en.wikipedia.org/wiki/Typography"
		>
			typography
		</PreviewCard.Trigger>
		remain in the digital age.
	</p>

	<PreviewCard.Portal>
		<PreviewCard.Positioner sideOffset={8}>
			<PreviewCard.Popup
				class="relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[transform,opacity] duration-100 ease-out data-ending-style:[transform:scale(0.98)] data-ending-style:opacity-0 data-starting-style:[transform:scale(0.98)] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<PreviewCard.Arrow
					class="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-neutral-950 before:bg-white before:content-[''] before:[transform:translate(-50%,50%)_rotate(45deg)] dark:before:border-white dark:before:bg-neutral-950"
				/>
				<div class="flex w-min flex-col gap-2 p-2">
					<img
						width="224"
						height="150"
						class="block max-w-none"
						src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
						alt="Station Hofplein signage in Rotterdam, Netherlands"
					/>
					<p class="text-sm">
						<strong>Typography</strong> is the art and science of arranging type to make written language
						clear, visually appealing, and effective in communication.
					</p>
				</div>
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
</PreviewCard.Root>
```

## Usage guidelines

- **Protect screen reader users' current context**: Exposing each preview to screen readers would force users through its contents before they could continue through the page, repeatedly disrupting their current context. Keep the link as the only accessible interface and include all previewed information at its destination.
- **Keep popup content supplementary**: Avoid placing unique or essential information in the popup unless it is also available on the linked page. For the reason above, preview card content is not touch, keyboard or screen reader navigable. It acts as a visual [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) for sighted mouse and keyboard users only.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';
</script>

<PreviewCard.Root>
	<PreviewCard.Trigger />
	<PreviewCard.Portal>
		<PreviewCard.Backdrop />
		<PreviewCard.Positioner>
			<PreviewCard.Popup>
				<PreviewCard.Arrow />
				<PreviewCard.Viewport />
			</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
</PreviewCard.Root>
```

## Examples

### Detached triggers

A preview card can be controlled by a trigger located either inside or outside the `<PreviewCard.Root>` component.
For simple, one-off interactions, place the `<PreviewCard.Trigger>` inside `<PreviewCard.Root>`, as shown in the example at the top of this page.

However, if defining the preview card's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<PreviewCard.Trigger>` outside of `<PreviewCard.Root>` and linking them with a `handle` created by the `PreviewCard.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<PreviewCard.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle();
</script>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPreviewCard}" -->
<PreviewCard.Trigger handle={demoPreviewCard} href="#">Link</PreviewCard.Trigger>

<!-- @highlight -->
<!-- @highlight-text "handle={demoPreviewCard}" -->
<PreviewCard.Root handle={demoPreviewCard}>...</PreviewCard.Root>
```

```svelte demo
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle();
</script>

<div>
	<p class="text-base text-neutral-950 text-balance dark:text-white">
		The principles of good
		<PreviewCard.Trigger
			class="text-neutral-950 underline decoration-neutral-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-neutral-950 data-popup-open:decoration-neutral-950 focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:text-white dark:decoration-white/60 dark:hover:decoration-white dark:data-popup-open:decoration-white dark:focus-visible:outline-white"
			handle={demoPreviewCard}
			href="https://en.wikipedia.org/wiki/Typography"
		>
			typography
		</PreviewCard.Trigger>
		remain in the digital age.
	</p>

	<PreviewCard.Root handle={demoPreviewCard}>
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup
					class="relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[transform,opacity] duration-100 ease-out data-ending-style:[transform:scale(0.98)] data-ending-style:opacity-0 data-starting-style:[transform:scale(0.98)] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
				>
					<PreviewCard.Arrow
						class="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-neutral-950 before:bg-white before:content-[''] before:[transform:translate(-50%,50%)_rotate(45deg)] dark:before:border-white dark:before:bg-neutral-950"
					/>
					<div class="flex w-min flex-col gap-2 p-2">
						<img
							width="224"
							height="150"
							class="block max-w-none"
							src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
							alt="Station Hofplein signage in Rotterdam, Netherlands"
						/>
						<p class="text-sm">
							<strong>Typography</strong> is the art and science of arranging type to make written language
							clear, visually appealing, and effective in communication.
						</p>
					</div>
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	</PreviewCard.Root>
</div>
```

### Multiple triggers

A single preview card can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<PreviewCard.Trigger>` components inside a single `<PreviewCard.Root>`.

```svelte title="Multiple triggers within the Root part"
<PreviewCard.Root>
	<PreviewCard.Trigger href="#">Trigger 1</PreviewCard.Trigger>
	<PreviewCard.Trigger href="#">Trigger 2</PreviewCard.Trigger>
	...
</PreviewCard.Root>
```

```svelte title="Multiple detached triggers"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle();
</script>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">Trigger 1</PreviewCard.Trigger>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">Trigger 2</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>...</PreviewCard.Root>
```

The preview card can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<PreviewCard.Trigger>` and using the `children` snippet of `<PreviewCard.Root>`, which receives the `payload`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```svelte title="Detached triggers with payload"
<script lang="ts">
	import { PreviewCard } from '@sveltery/base/preview-card';

	// @highlight
	const demoPreviewCard = PreviewCard.createHandle<{ title: string }>();
</script>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 1' }} href="#">
	Trigger 1
</PreviewCard.Trigger>

<!-- @highlight -->
<!-- @highlight-text "payload" -->
<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 2' }} href="#">
	Trigger 2
</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>
	{#snippet children({ payload })}
		<!-- @highlight-text "payload" -->
		<PreviewCard.Portal>
			<PreviewCard.Positioner sideOffset={8}>
				<PreviewCard.Popup>
					{#if payload !== undefined}
						<!-- @highlight-text "payload" -->
						<span>Preview card opened by {payload.title}</span>
						<!-- @highlight-text "payload" -->
					{/if}
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	{/snippet}
</PreviewCard.Root>
```

### Controlled mode with multiple triggers

You can control the preview card's open state externally by binding the `open` prop on `<PreviewCard.Root>`.
This allows you to manage the preview card's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active by binding the `triggerId` prop on `<PreviewCard.Root>` and setting the `id` prop on each `<PreviewCard.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop. `bind:triggerId` follows the trigger that opens or closes the preview card.
The `onOpenChange` callback also receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

```svelte demo
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle<Snippet>();

	let open = $state(false);
	let triggerId = $state<string | null>(null);

	const linkClass =
		'text-neutral-950 underline decoration-neutral-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-neutral-950 data-popup-open:decoration-neutral-950 focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:text-white dark:decoration-white/60 dark:hover:decoration-white dark:data-popup-open:decoration-white dark:focus-visible:outline-white';
</script>

{#snippet typography()}
	<div class="flex w-min flex-col gap-2 p-2">
		<img
			width="224"
			height="150"
			class="block max-w-none"
			src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
			alt="Station Hofplein signage in Rotterdam, Netherlands"
		/>
		<p class="text-sm">
			<strong>Typography</strong> is the art and science of arranging type.
		</p>
	</div>
{/snippet}

{#snippet design()}
	<div class="flex w-min flex-col gap-2 p-2">
		<img
			width="241"
			height="240"
			class="block max-w-none"
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Braun_ABW30_%28schwarz%29.jpg/250px-Braun_ABW30_%28schwarz%29.jpg"
			alt="Braun ABW30"
		/>
		<p class="text-sm">
			A <strong>design</strong> is the concept or proposal for an object, process, or system.
		</p>
	</div>
{/snippet}

{#snippet art()}
	<div class="flex w-min flex-col gap-2 p-2">
		<img
			width="206"
			height="240"
			class="block max-w-none"
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/MonaLisa_sfumato.jpeg/250px-MonaLisa_sfumato.jpeg"
			alt="Mona Lisa"
		/>
		<p class="text-sm">
			<strong>Art</strong> is a diverse range of cultural activity centered around works utilizing creative
			or imaginative talents, which are expected to evoke a worthwhile experience, generally through an
			expression of emotional power, conceptual ideas, technical proficiency, or beauty.
		</p>
	</div>
{/snippet}

<div>
	<div class="flex flex-wrap items-baseline justify-center gap-2">
		<p class="text-base text-neutral-950 text-balance dark:text-white">
			Discover
			<PreviewCard.Trigger
				class={linkClass}
				handle={demoPreviewCard}
				href="https://en.wikipedia.org/wiki/Typography"
				id="trigger-1"
				payload={typography}
			>
				typography
			</PreviewCard.Trigger>,
			<PreviewCard.Trigger
				class={linkClass}
				handle={demoPreviewCard}
				href="https://en.wikipedia.org/wiki/Industrial_design"
				id="trigger-2"
				payload={design}
			>
				design
			</PreviewCard.Trigger>, or
			<PreviewCard.Trigger
				class={linkClass}
				handle={demoPreviewCard}
				href="https://en.wikipedia.org/wiki/Art"
				id="trigger-3"
				payload={art}
			>
				art
			</PreviewCard.Trigger>.
		</p>
		<button
			type="button"
			class="flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			onclick={() => {
				triggerId = 'trigger-2';
				open = true;
			}}
		>
			Open programmatically
		</button>
	</div>

	<PreviewCard.Root handle={demoPreviewCard} bind:open bind:triggerId>
		{#snippet children({ payload })}
			<PreviewCard.Portal>
				<PreviewCard.Positioner
					sideOffset={8}
					class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]"
				>
					<PreviewCard.Popup
						class="relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[transform,opacity] duration-100 ease-out data-ending-style:[transform:scale(0.98)] data-ending-style:opacity-0 data-starting-style:[transform:scale(0.98)] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
					>
						<PreviewCard.Arrow
							class="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-neutral-950 before:bg-white before:content-[''] before:[transform:translate(-50%,50%)_rotate(45deg)] dark:before:border-white dark:before:bg-neutral-950"
						/>
						{@render (payload as Snippet | undefined)?.()}
					</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		{/snippet}
	</PreviewCard.Root>
</div>
```

### Animating the Preview Card

You can animate a preview card as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the preview card's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The preview card also supports content transitions.
This is useful when different triggers display different content within the same preview card.

To enable content animations, wrap the content in the `<PreviewCard.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<PreviewCard.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

```svelte demo
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PreviewCard } from '@sveltery/base/preview-card';

	const demoPreviewCard = PreviewCard.createHandle<Snippet>();

	const linkClass =
		'text-neutral-950 underline decoration-neutral-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-neutral-950 data-popup-open:decoration-neutral-950 focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:text-white dark:decoration-white/60 dark:hover:decoration-white dark:data-popup-open:decoration-white dark:focus-visible:outline-white';
</script>

{#snippet typography()}
	<div class="flex w-min flex-col gap-2 p-2">
		<img
			width="224"
			height="150"
			class="block max-w-none"
			src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
			alt="Station Hofplein signage in Rotterdam, Netherlands"
		/>
		<p class="text-sm">
			<strong>Typography</strong> is the art and science of arranging type.
		</p>
	</div>
{/snippet}

{#snippet design()}
	<div class="flex w-min flex-col gap-2 p-2">
		<img
			width="250"
			height="249"
			class="block max-w-none"
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Braun_ABW30_%28schwarz%29.jpg/250px-Braun_ABW30_%28schwarz%29.jpg"
			alt="Braun ABW30"
		/>
		<p class="text-sm">
			A <strong>design</strong> is the concept or proposal for an object, process, or system.
		</p>
	</div>
{/snippet}

{#snippet art()}
	<div class="flex w-min flex-col gap-2 p-2">
		<img
			width="250"
			height="290"
			class="block max-w-none"
			src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/MonaLisa_sfumato.jpeg/250px-MonaLisa_sfumato.jpeg"
			alt="Mona Lisa"
		/>
		<p class="text-sm">
			<strong>Art</strong> is a diverse range of cultural activity centered around works utilizing creative
			or imaginative talents, which are expected to evoke a worthwhile experience, generally through an
			expression of emotional power, conceptual ideas, technical proficiency, or beauty.
		</p>
	</div>
{/snippet}

<div>
	<p class="text-base text-neutral-950 text-balance dark:text-white">
		Discover
		<PreviewCard.Trigger
			class={linkClass}
			handle={demoPreviewCard}
			href="https://en.wikipedia.org/wiki/Typography"
			payload={typography}
		>
			typography
		</PreviewCard.Trigger>,
		<PreviewCard.Trigger
			class={linkClass}
			handle={demoPreviewCard}
			href="https://en.wikipedia.org/wiki/Design"
			payload={design}
		>
			design
		</PreviewCard.Trigger>, or
		<PreviewCard.Trigger
			class={linkClass}
			handle={demoPreviewCard}
			href="https://en.wikipedia.org/wiki/Art"
			payload={art}
		>
			art
		</PreviewCard.Trigger>.
	</p>

	<PreviewCard.Root handle={demoPreviewCard}>
		{#snippet children({ payload })}
			<PreviewCard.Portal>
				<PreviewCard.Positioner
					sideOffset={8}
					class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]"
				>
					<PreviewCard.Popup
						class="relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[width,height,opacity,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:[transform:scale(0.98)] data-ending-style:opacity-0 data-starting-style:[transform:scale(0.98)] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
					>
						<PreviewCard.Arrow
							class="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-neutral-950 before:bg-white before:content-[''] before:[transform:translate(-50%,50%)_rotate(45deg)] dark:before:border-white dark:before:bg-neutral-950"
						/>

						<PreviewCard.Viewport
							class="relative overflow-clip w-full h-full [&_[data-previous]]:w-[var(--popup-width)] [&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100 [&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[350ms,175ms] [&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)] [&_[data-current]]:w-[var(--popup-width)] [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100 [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-[30%] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-[30%] data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-[30%] data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-[30%] data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0"
						>
							{@render (payload as Snippet | undefined)?.()}
						</PreviewCard.Viewport>
					</PreviewCard.Popup>
				</PreviewCard.Positioner>
			</PreviewCard.Portal>
		{/snippet}
	</PreviewCard.Root>
</div>
```

## API reference

<script>
	import { TypesPreviewCard } from './types';
</script>

### Root

<TypesPreviewCard.Root />

### Trigger

<TypesPreviewCard.Trigger />

### Portal

<TypesPreviewCard.Portal />

### Backdrop

<TypesPreviewCard.Backdrop />

### Positioner

<TypesPreviewCard.Positioner />

### Popup

<TypesPreviewCard.Popup />

### Viewport

<TypesPreviewCard.Viewport />

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

### Arrow

<TypesPreviewCard.Arrow />

## createHandle

Creates a new handle to connect a `PreviewCard.Root` with detached `PreviewCard.Trigger` components.

**Return value**

`PreviewCard.Handle<Payload>`

<!-- @exclude-table-of-contents -->

### Handle

Controls a PreviewCard imperatively and associates detached `PreviewCard.Trigger` components with a `PreviewCard.Root`. Create one with `PreviewCard.createHandle()` and pass it to the `handle` prop of the root and of any triggers rendered outside of it.

The imperative methods take effect only while a root using this handle is mounted; calls made before a root attaches (or after it unmounts) are ignored.

**Properties**

| Property  | Type                   | Modifiers | Description                                                                                          |
| --------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`              | readonly  | Whether the preview card is currently open. Returns `false` while no root is attached to the handle. |
| `payload` | `Payload \| undefined` | readonly  | The payload of the trigger that opened the preview card.                                             |

**Methods**

| Method    | Parameters                  | Returns | Description                                                                                                                                                                                                                                                                          |
| --------- | --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`    | `triggerId: string \| null` | `void`  | Opens the preview card and associates it with the trigger with the given id. It throws when no trigger with that id is registered, because the preview card needs a trigger to anchor to. This method should only be called in an event handler or an effect (not during rendering). |
| `close`   |                             | `void`  | Closes the preview card. This method should only be called in an event handler or an effect (not during rendering).                                                                                                                                                                  |
| `unmount` |                             | `void`  | Ends the closing phase of the preview card immediately.                                                                                                                                                                                                                              |
