<!--
	Fixture page for the Autocomplete port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import AutocompleteFixture from './AutocompleteFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={AutocompleteFixture}
	loadReference={async () => {
		const { mountAutocompleteReference } = await import('./react-reference.js');
		return mountAutocompleteReference;
	}}
/>
