<!--
	Fixture page for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ComboboxFixture from './ComboboxFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ComboboxFixture}
	loadReference={async () => {
		const { mountComboboxReference } = await import('./react-reference.js');
		return mountComboboxReference;
	}}
/>
