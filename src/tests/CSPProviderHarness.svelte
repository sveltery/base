<script lang="ts">
	import { CSPProvider } from '#lib';
	import CSPProbe from './CSPProbe.svelte';

	let {
		scenario = 'outside'
	}: {
		scenario?: 'outside' | 'omitted' | 'nonce' | 'disabled' | 'reactive' | 'nested';
	} = $props();

	let nonce = $state<string | undefined>('test-nonce');
	let disableStyleElements = $state<boolean | undefined>(false);

	function update() {
		if (nonce === 'test-nonce') {
			nonce = 'next-nonce';
			disableStyleElements = true;
			return;
		}
		nonce = 'test-nonce';
		disableStyleElements = false;
	}
</script>

{#if scenario === 'outside'}
	<CSPProbe />
{:else if scenario === 'omitted'}
	<CSPProvider>
		<CSPProbe />
	</CSPProvider>
{:else if scenario === 'nonce'}
	<CSPProvider nonce="test-nonce">
		<CSPProbe />
	</CSPProvider>
{:else if scenario === 'disabled'}
	<CSPProvider disableStyleElements>
		<CSPProbe />
	</CSPProvider>
{:else if scenario === 'reactive'}
	<button type="button" onclick={update}>Update CSP</button>
	<CSPProvider {nonce} {disableStyleElements}>
		<CSPProbe />
	</CSPProvider>
{:else}
	<CSPProvider nonce="outer-nonce" disableStyleElements={false}>
		<CSPProbe id="outer" />
		<CSPProvider disableStyleElements>
			<CSPProbe id="inner" />
		</CSPProvider>
	</CSPProvider>
{/if}
