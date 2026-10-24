<script lang="ts">
	import { useDefaultLayout, type ResizableLayoutStorage } from '#lib';

	let { storage }: { storage: ResizableLayoutStorage } = $props();

	// svelte-ignore state_referenced_locally
	const saved = useDefaultLayout({ id: 'editor', storage });

	export function layout() {
		return saved;
	}
</script>
