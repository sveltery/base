<!--
	Contains the meter indicator and represents the entire range of the meter.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/meter/track/MeterTrack.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { MeterTrackProps, MeterTrackState } from './types.js';

	let { render, children, ...elementProps }: MeterTrackProps = $props();

	const partState: MeterTrackState = {};
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({ ...elementProps });
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
