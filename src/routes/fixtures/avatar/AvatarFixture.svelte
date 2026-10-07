<script lang="ts">
	import { Avatar, type ImageLoadingStatus } from '#lib';
	import type { AvatarCase } from './cases.js';

	const TRANSPARENT =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

	let { scenario }: { scenario: AvatarCase } = $props();
	let calls = $state<ImageLoadingStatus[]>([]);

	function changed(status: ImageLoadingStatus) {
		calls.push(status);
	}

	function failed(event: Event) {
		if (scenario === 'prevented') event.preventDefault();
	}

	const src = $derived(
		scenario === 'loaded' || scenario === 'keep'
			? TRANSPARENT
			: scenario === 'prevented'
				? '/hung-avatar.png'
				: '/missing-avatar.png'
	);
	const keepMounted = $derived(scenario === 'keep' || scenario === 'prevented');
	const delay = $derived(scenario === 'delay' ? 1000 : 0);
</script>

<Avatar.Root>
	<Avatar.Image
		id="tested-image"
		alt="Jane Doe"
		{src}
		{keepMounted}
		onerror={failed}
		onLoadingStatusChange={changed}
	/>
	<Avatar.Fallback id="tested-fallback" {delay}>JD</Avatar.Fallback>
</Avatar.Root>
<output data-testid="calls">{JSON.stringify(calls)}</output>
