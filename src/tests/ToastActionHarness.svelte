<!-- Toast.Action inside a fixed Toast.Root, rendered through a `render` snippet. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Toast, type ToastObject } from '#lib';

	let {
		toast,
		children: text = undefined
	}: {
		toast: ToastObject;
		/** Text children for the action. */
		children?: string;
	} = $props();
</script>

{#snippet textChildren()}{text}{/snippet}
{#snippet renderButton(props: object, _state: unknown, children: Snippet | undefined)}
	<button {...props} data-testid="action-render">{@render children?.()}</button>
{/snippet}

<Toast.Provider>
	<Toast.Viewport>
		<Toast.Root {toast} data-testid="root">
			<Toast.Action
				render={renderButton}
				children={text === undefined ? undefined : textChildren}
			/>
		</Toast.Root>
	</Toast.Viewport>
</Toast.Provider>
