<!--
	A separator element accessible to screen readers.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toolbar/separator/ToolbarSeparator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import Separator from '../separator/Separator.svelte';
	import { useToolbarRootContext } from './context.svelte.js';
	import type { ToolbarSeparatorProps } from './types.js';

	const toolbar = useToolbarRootContext();

	let { ...props }: ToolbarSeparatorProps = $props();
</script>

<Separator
	orientation={toolbar.orientation === 'vertical' ? 'horizontal' : 'vertical'}
	{...props}
/>
