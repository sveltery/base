<script lang="ts">
	import { CSPProvider } from '#lib';
	import CSPReadout from './CSPReadout.svelte';
	import type { CSPProviderCase } from './cases.js';

	let { scenario }: { scenario: CSPProviderCase } = $props();

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
	<CSPReadout />
{:else if scenario === 'omitted'}
	<CSPProvider>
		<CSPReadout />
	</CSPProvider>
{:else if scenario === 'nonce'}
	<CSPProvider nonce="test-nonce">
		<CSPReadout />
	</CSPProvider>
{:else if scenario === 'disabled'}
	<CSPProvider disableStyleElements>
		<CSPReadout />
	</CSPProvider>
{:else if scenario === 'reactive'}
	<button type="button" onclick={update}>Update CSP</button>
	<CSPProvider {nonce} {disableStyleElements}>
		<CSPReadout />
	</CSPProvider>
{:else}
	<CSPProvider nonce="outer-nonce" disableStyleElements={false}>
		<CSPReadout id="outer" />
		<CSPProvider disableStyleElements>
			<CSPReadout id="inner" />
		</CSPProvider>
	</CSPProvider>
{/if}
