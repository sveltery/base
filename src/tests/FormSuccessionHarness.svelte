<script lang="ts">
	import { Form } from '#lib';
	import type { EnhanceInstance } from '../lib/form/source.js';
	import type { FakeSource } from './fake-form-source.svelte.js';

	let {
		source,
		enhance
	}: {
		source: FakeSource;
		enhance?: (instance: EnhanceInstance) => unknown;
	} = $props();

	let first = $state(true);
	let second = $state(false);
</script>

<button type="button" onclick={() => (second = true)}>Mount second</button>
<button type="button" onclick={() => (first = false)}>Unmount first</button>
{#if first}
	<Form form={source} data-testid="first"><button>Submit first</button></Form>
{/if}
{#if second}
	<Form form={source} {enhance} data-testid="second"><button>Submit second</button></Form>
{/if}
