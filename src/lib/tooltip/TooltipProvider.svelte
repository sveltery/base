<!--
	Shares a delay between tooltips. Once one tooltip is visible, its neighbours open instantly.
	Does not render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/provider/TooltipProvider.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { FloatingDelayGroup } from '@sveltery/floating-ui-svelte';
	import { PROVIDER_TIMEOUT } from './constants.js';
	import { setTooltipProviderDelay } from './context.svelte.js';
	import type { TooltipProviderProps } from './types.js';

	let { delay, closeDelay, timeout = PROVIDER_TIMEOUT, children }: TooltipProviderProps = $props();

	setTooltipProviderDelay(() => delay);
</script>

<FloatingDelayGroup delay={{ open: delay, close: closeDelay }} timeoutMs={timeout}>
	{@render children?.()}
</FloatingDelayGroup>
