<script lang="ts">
	import { page } from '$app/state';
	import { Slider } from '#lib';
	import Shell from '../Shell.svelte';
	import { sliderForm as f } from '../../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'spread';
	// `.as('range')` types `value` as a string, and Slider takes a number.
	const volume = () => f.fields.volume.as('range') as Record<string, unknown>;
</script>

{#snippet parts()}
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<Slider.Thumb data-testid="control" />
		</Slider.Track>
	</Slider.Control>
{/snippet}

<Shell form={f} field="volume" name={f.fields.volume.as('range').name} label="Volume">
	{#if v === 'spread'}
		<Slider.Root {...volume()}>{@render parts()}</Slider.Root>
	{:else if v === 'value'}
		<Slider.Root {...volume()} value={f.fields.volume.value() ?? 50}>{@render parts()}</Slider.Root>
	{:else if v === 'copy-value'}
		<!-- The spread copied into a plain object, so the server can override its `value`. After a
		rejected post without JS, Kit's `value()` is the submitted string. -->
		<Slider.Root {...{ ...volume() }} value={Number(f.fields.volume.value() ?? 50)}
			>{@render parts()}</Slider.Root
		>
	{/if}
</Shell>
