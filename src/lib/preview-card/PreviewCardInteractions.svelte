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

	const reference = dismiss.reference;
	const floating = dismiss.floating;

	$effect(() => {
		owner.dismissReference = reference;
		owner.dismissFloating = floating;
		return () => {
			if (owner.dismissReference === reference) owner.dismissReference = {};
			if (owner.dismissFloating === floating) owner.dismissFloating = {};
		};
	});
</script>
