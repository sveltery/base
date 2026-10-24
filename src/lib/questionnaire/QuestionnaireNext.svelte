<!--
	Validates the active item and moves to the next one. Renders a `<button>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import Action from './QuestionnaireAction.svelte';
	import type { QuestionnaireNextProps } from './types.js';

	let { disabled = false, ...rest }: QuestionnaireNextProps = $props();
</script>

<Action action="next" {disabled} {...rest} />
