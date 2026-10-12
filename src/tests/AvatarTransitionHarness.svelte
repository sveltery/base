<script lang="ts">
	import { untrack } from 'svelte';
	import { Avatar } from '#lib';

	let { src }: { src: string } = $props();

	let current = $state(untrack(() => src));
</script>

<Avatar.Root>
	<Avatar.Image alt="Jane Doe" class="fade" data-testid="image" src={current} />
	<Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
<button type="button" onclick={() => (current = '')}>Clear source</button>

<style>
	:global(.fade[data-ending-style]) {
		animation: sveltery-avatar-fade 300ms linear both;
	}

	@keyframes -global-sveltery-avatar-fade {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>
