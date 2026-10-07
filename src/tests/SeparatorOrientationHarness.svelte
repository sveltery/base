<script lang="ts">
	import { Separator, type SeparatorState } from '#lib';

	let orientation = $state<SeparatorState['orientation']>('horizontal');
</script>

<button
	type="button"
	onclick={() => (orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal')}
	>Flip orientation</button
>
<Separator {orientation}>Section</Separator>
