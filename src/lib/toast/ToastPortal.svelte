<!--
	A portal element that moves the viewport to a different part of the DOM.
	By default, the portal element is appended to `<body>`. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/portal/ToastPortal.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Upstream uses `FloatingPortalLite`, a portal without focus guards. The shared
	`FloatingPortal` renders guards only for a focus manager, and no toast part registers one.
-->
<script lang="ts">
	import { FloatingPortal } from '@sveltery/floating-ui-svelte';
	import type { ToastPortalProps } from './types.js';

	let { container = undefined, children, ...rest }: ToastPortalProps = $props();
</script>

<FloatingPortal {...rest} {container}>
	{@render children?.()}
</FloatingPortal>
