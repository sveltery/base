<script lang="ts">
	let { value }: { value: string } = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		await navigator.clipboard.writeText(value);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<button
	type="button"
	class="absolute top-2 right-2 rounded-md px-2 py-1 text-xs text-muted hover:bg-subtle hover:text-fg"
	onclick={copy}
>
	{copied ? 'Copied' : 'Copy'}
</button>
