<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import DayPickerFixture from './DayPickerFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={DayPickerFixture}
	loadReference={async () => {
		const { mountDayPickerReference } = await import('./react-reference.js');
		return mountDayPickerReference;
	}}
/>
