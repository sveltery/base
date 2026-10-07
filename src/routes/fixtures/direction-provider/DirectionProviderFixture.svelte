<script lang="ts">
	import { DirectionProvider, type TextDirection } from '#lib';
	import DirectionReadout from './DirectionReadout.svelte';
	import type { DirectionProviderCase } from './cases.js';

	let { scenario }: { scenario: DirectionProviderCase } = $props();

	let direction = $state<TextDirection>('rtl');

	function flip() {
		direction = direction === 'rtl' ? 'ltr' : 'rtl';
	}
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
	<button type="button" onclick={flip}>Flip direction</button>
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
