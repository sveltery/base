<!--
	The upstream `List` and `Button` test helpers for Toast specs. Renders an "add" button,
	the viewport, and one Toast.Root per toast with a title, description, close, and action.
-->
<script lang="ts" module>
	import type {
		GetToastManagerReturnValue,
		ToastManagerAddOptions,
		ToastSwipeDirection
	} from '#lib';

	export interface ToastHarnessListProps {
		onManager?: (manager: GetToastManagerReturnValue) => void;
		/** Renders the viewport and the toasts. */
		viewport?: boolean;
		/** Renders the "add" button. */
		addButton?: boolean;
		/** What the "add" button passes to `add`. */
		addOptions?: ToastManagerAddOptions;
		swipeDirection?: ToastSwipeDirection | ToastSwipeDirection[];
		/** Key the list by index instead of id, so roots are reused across toasts. */
		keyByIndex?: boolean;
		/** Spread each toast into a new object before rendering it. */
		copy?: boolean;
		/** Wrap the parts in Toast.Content. */
		content?: boolean;
		/** The root's `data-testid`: `root`, `toast-<id>`, `toast-<title>`, or `root-<index>`. */
		rootTestId?: 'root' | 'id' | 'title' | 'index';
		rootStyle?: string;
		css?: string;
		/** Portals the viewport into this element. */
		portalContainer?: HTMLElement;
	}
</script>

<script lang="ts">
	import { Toast, type ToastObject } from '#lib';

	let {
		onManager,
		viewport = true,
		addButton = true,
		addOptions = {
			title: 'title',
			description: 'description',
			actionProps: { id: 'action', children: 'action' }
		},
		swipeDirection,
		keyByIndex = false,
		copy = false,
		content = false,
		rootTestId = 'root',
		rootStyle,
		css = '',
		portalContainer
	}: ToastHarnessListProps = $props();

	const manager = Toast.getToastManager();
	// svelte-ignore state_referenced_locally
	onManager?.(manager);

	const toasts = $derived(copy ? manager.toasts.map((toast) => ({ ...toast })) : manager.toasts);

	function testId(toast: ToastObject, index: number) {
		if (rootTestId === 'index') return `root-${index}`;
		if (rootTestId === 'id') return `toast-${toast.id}`;
		if (rootTestId === 'title') return `toast-${toast.title}`;
		return 'root';
	}
</script>

{#if css}
	<svelte:element this={"style"}>{css}</svelte:element>
{/if}
{#if addButton}
	<button type="button" onclick={() => manager.add(addOptions)}>add</button>
{/if}
{#snippet parts()}
	<Toast.Title data-testid="title" />
	<Toast.Description data-testid="description" />
	<Toast.Close aria-label="close-press" />
	<Toast.Action data-testid="action" />
{/snippet}
{#snippet root(toast: ToastObject, index: number)}
	<Toast.Root {toast} {swipeDirection} data-testid={testId(toast, index)} style={rootStyle}>
		{#if content}
			<Toast.Content data-testid="content-{toast.id}">{@render parts()}</Toast.Content>
		{:else}
			{@render parts()}
		{/if}
	</Toast.Root>
{/snippet}
{#snippet viewportElement()}
	<Toast.Viewport data-testid="viewport">
		{#if keyByIndex}
			<!-- eslint-disable-next-line svelte/require-each-key -- index keys reuse roots on purpose -->
			{#each toasts as toast, index (index)}
				{@render root(toast, index)}
			{/each}
		{:else}
			{#each toasts as toast, index (toast.id)}
				{@render root(toast, index)}
			{/each}
		{/if}
	</Toast.Viewport>
{/snippet}
{#if viewport && portalContainer}
	<Toast.Portal container={portalContainer}>{@render viewportElement()}</Toast.Portal>
{:else if viewport}
	{@render viewportElement()}
{/if}
