<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import QuestionnaireFixture from './QuestionnaireFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={QuestionnaireFixture}
	loadReference={async () => {
		const { mountQuestionnaireReference } = await import('./react-reference.js');
		return mountQuestionnaireReference;
	}}
/>
