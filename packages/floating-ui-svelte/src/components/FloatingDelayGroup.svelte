<script lang="ts">
	// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingDelayGroup.tsx
	// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

	import type { Snippet } from 'svelte';
	import { DelayGroup, setDelayGroup, type Delay } from './delay-group.svelte.js';

	let {
		delay,
		timeoutMs = 0,
		children
	}: { delay: Delay; timeoutMs?: number; children?: Snippet } = $props();

	setDelayGroup(new DelayGroup(() => ({ delay, timeoutMs })));
</script>

{@render children?.()}
