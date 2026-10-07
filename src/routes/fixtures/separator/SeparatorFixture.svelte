<script lang="ts">
	import { Separator, type SeparatorState } from '#lib';
	import type { SeparatorCase } from './cases.js';

	let { scenario }: { scenario: SeparatorCase } = $props();

	let orientation = $state<SeparatorState['orientation']>(
		scenario === 'vertical' ? 'vertical' : 'horizontal'
	);

	function flip() {
		orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
	}
</script>

{#if scenario === 'reactive'}
	<button type="button" onclick={flip}>Flip orientation</button>
{/if}
<Separator
	id="tested-separator"
	{orientation}
	style={orientation === 'vertical' ? 'width: 1px; height: 16px' : 'height: 1px'}
/>
