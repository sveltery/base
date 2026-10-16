<!--
	A portal element that moves the popup to a different part of the DOM.
	By default, the portal element is appended to `<body>`.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/portal/ComboboxPortal.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	It also renders while closed once the trigger has had focus, so the items exist for
	typeahead on the closed trigger.
-->
<script lang="ts">
	import { FloatingPortal } from '@sveltery/floating-ui-svelte';
	import { useComboboxRoot } from './context.svelte.js';
	import type { ComboboxPortalProps } from './types.js';

	let {
		keepMounted = false,
		container = undefined,
		children,
		...rest
	}: ComboboxPortalProps = $props();

	const store = useComboboxRoot();
</script>

{#if store.mounted || keepMounted || store.forceMounted}
	<FloatingPortal {...rest} {store} {container}>
		{@render children?.()}
	</FloatingPortal>
{/if}
