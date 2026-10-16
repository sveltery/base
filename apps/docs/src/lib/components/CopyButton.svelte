<script lang="ts">
	import { checkIcon, copyIcon } from './DocIcons.svelte';

	let { text, class: className }: { text: () => string | undefined; class?: string } = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		const value = text();
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// The clipboard needs a secure origin and permission. Without them, nothing is copied.
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<button
	type="button"
	class={['GhostButton', className]}
	data-layout="icon"
	aria-label="Copy code"
	onclick={copy}
>
	<span class="CodeBlockCopyIcon">{@render (copied ? checkIcon : copyIcon)()}</span>
</button>
