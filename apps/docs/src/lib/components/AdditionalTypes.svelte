<script lang="ts">
	import type { ReferenceType } from '../../../markdown/reference.ts';
	import CodeBlock from './CodeBlock.svelte';

	/**
	 * A page's additional types, as Base UI's `AdditionalTypes` renders them. Each is hidden until
	 * `showAdditionalTypes` names its slug or the URL hash targets it.
	 */
	let { types, showAdditionalTypes }: { types: ReferenceType[]; showAdditionalTypes?: string[] } =
		$props();

	let hydrated = $state(false);
	let canGoBack = $state(false);
	$effect(() => {
		hydrated = true;
		const handleHashChange = () => (canGoBack = true);
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	});

	function back(event: MouseEvent) {
		if (!hydrated || !canGoBack) return;
		event.preventDefault();
		history.back();
	}
</script>

{#each types as type (type.name)}
	{@const shown = showAdditionalTypes?.includes(type.slug) ? 'true' : undefined}
	<div id={type.slug} class="AdditionalTypeWrapper" data-shown={shown}>
		<h3 class="ReferenceSectionHeading AdditionalTypeHeading">
			{type.name}
			<a href="#" class="AdditionalTypeBackLink" data-hidden={shown} onclick={back}>
				{hydrated && canGoBack ? 'Back' : 'Hide'}
			</a>
		</h3>
		<CodeBlock html={type.code} class="AdditionalTypeCodeBlock" />
	</div>
{/each}
