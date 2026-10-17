<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, Slider } from '#lib';
	import FixturePage from '../../form/shared/FixturePage.svelte';
	import { errorsFor } from '../shared/issues.js';
	import { sliderForm as f } from '../shared/mapping.remote.js';

	const v = page.url.searchParams.get('v') ?? 'name';
	const volume = f.fields.volume.as('range');
</script>

{#snippet parts()}
	<Slider.Control>
		<Slider.Track>
			<Slider.Indicator />
			<Slider.Thumb data-testid="control" />
		</Slider.Track>
	</Slider.Control>
{/snippet}

<FixturePage debug={{ result: f.result ?? null, kit: f.fields.value() }}>
	<Form {...f} errors={errorsFor(volume.name, f.fields.volume.issues())}>
		<Field.Root data-field="volume" name={v === 'root-name' ? volume.name : undefined}>
			<Field.Label>Volume</Field.Label>
			{#if v === 'root-name'}
				<Slider.Root defaultValue={50}>{@render parts()}</Slider.Root>
			{:else if v === 'name'}
				<Slider.Root name={volume.name} defaultValue={50}>{@render parts()}</Slider.Root>
			{:else if v === 'spread'}
				<!-- `.as()` types `value` as a string, so the spread needs a cast. -->
				<Slider.Root {...volume as Record<string, unknown>}>{@render parts()}</Slider.Root>
			{:else if v === 'controlled'}
				<Slider.Root
					name={volume.name}
					value={f.fields.volume.value() ?? 50}
					onValueChange={(value) => f.fields.volume.set(value as number)}
					>{@render parts()}</Slider.Root
				>
			{/if}
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
</FixturePage>
