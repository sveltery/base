<script lang="ts">
	import { Toggle } from '#lib';

	let ref = $state<HTMLElement | null>(null);
</script>

<Toggle bind:ref>
	{#snippet render(props, state)}
		<button {...props} class="custom-host" data-state={state.pressed ? 'on' : 'off'}>Custom</button>
	{/snippet}
</Toggle>
<output data-testid="ref">{ref?.className ?? 'none'}</output>
