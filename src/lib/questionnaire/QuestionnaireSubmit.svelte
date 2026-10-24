<!--
	Submits the form from the last item. Renders a `<button>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import Action from './QuestionnaireAction.svelte';
	import type { QuestionnaireSubmitProps } from './types.js';

	let { disabled = false, ...rest }: QuestionnaireSubmitProps = $props();
</script>

<Action action="submit" {disabled} {...rest} />
