<script lang="ts">
	import { DirectionProvider, type TextDirection } from '#lib';
	import DirectionReadout from '../routes/fixtures/direction-provider/DirectionReadout.svelte';

	let {
		scenario = 'outside'
	}: {
		scenario?: 'outside' | 'rtl' | 'omitted' | 'reactive' | 'nested';
	} = $props();

	let direction = $state<TextDirection>('rtl');
</script>

{#if scenario === 'outside'}
	<DirectionReadout />
{:else if scenario === 'omitted'}
	<DirectionProvider>
		<DirectionReadout />
	</DirectionProvider>
{:else if scenario === 'rtl'}
	<DirectionProvider direction="rtl">
		<DirectionReadout />
	</DirectionProvider>
{:else if scenario === 'reactive'}
	<button type="button" onclick={() => (direction = direction === 'rtl' ? 'ltr' : 'rtl')}>
		Flip direction
	</button>
	<DirectionProvider {direction}>
		<DirectionReadout />
	</DirectionProvider>
{:else}
	<DirectionProvider direction="rtl">
		<DirectionReadout testId="outer" />
		<DirectionProvider direction="ltr">
			<DirectionReadout testId="inner" />
		</DirectionProvider>
	</DirectionProvider>
{/if}
