<script lang="ts">
	import { DirectionProvider, type TextDirection } from '#lib';
	import DirectionProbe from './DirectionProbe.svelte';

	let {
		scenario = 'outside'
	}: {
		scenario?: 'outside' | 'rtl' | 'omitted' | 'reactive' | 'nested';
	} = $props();

	let direction = $state<TextDirection>('rtl');
</script>

{#if scenario === 'outside'}
	<DirectionProbe />
{:else if scenario === 'omitted'}
	<DirectionProvider>
		<DirectionProbe />
	</DirectionProvider>
{:else if scenario === 'rtl'}
	<DirectionProvider direction="rtl">
		<DirectionProbe />
	</DirectionProvider>
{:else if scenario === 'reactive'}
	<button type="button" onclick={() => (direction = direction === 'rtl' ? 'ltr' : 'rtl')}>
		Flip direction
	</button>
	<DirectionProvider {direction}>
		<DirectionProbe />
	</DirectionProvider>
{:else}
	<DirectionProvider direction="rtl">
		<DirectionProbe testId="outer" />
		<DirectionProvider direction="ltr">
			<DirectionProbe testId="inner" />
		</DirectionProvider>
	</DirectionProvider>
{/if}
