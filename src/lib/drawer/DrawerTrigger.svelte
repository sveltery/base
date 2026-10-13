<!--
	A button that opens the drawer. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/trigger/DrawerTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	It is `Dialog.Trigger`. Its own generic props make a `Dialog.Handle` fail to type-check here.
-->
<script lang="ts" generics="Payload = unknown">
	import DialogTrigger from '../dialog/DialogTrigger.svelte';
	import type { DrawerTriggerProps } from './types.js';

	let { ...props }: DrawerTriggerProps<Payload> = $props();
</script>

<DialogTrigger {...props} />
