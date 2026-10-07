<script lang="ts">
	import { useDirection } from '#lib';

	let { testId = 'direction' }: { testId?: string } = $props();

	const direction = useDirection();
</script>

<span data-testid={testId}>{direction.direction}</span>
