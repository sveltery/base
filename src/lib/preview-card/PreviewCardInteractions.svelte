<!--
	Dismiss handlers for the trigger and popup of one preview card store.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/root/PreviewCardRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { DismissInteraction } from '@sveltery/floating-ui-svelte';
	import type { PreviewCardStore } from './store.svelte.js';

	let { store }: { store: PreviewCardStore } = $props();

	const owner = untrack(() => store);
	const dismiss = new DismissInteraction(owner);

	owner.dismissReference = dismiss.reference;
	owner.dismissFloating = dismiss.floating;

	$effect(() => () => {
		owner.dismissReference = {};
		owner.dismissFloating = {};
	});
</script>
