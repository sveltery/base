<!--
	An accessible label for the meter.
	Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/meter/label/MeterLabel.tsx
	and packages/react/src/utils/useRegisteredLabelId.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMeterRootContext } from './context.js';
	import type { MeterLabelProps, MeterLabelState } from './types.js';

	const uid = $props.id();

	let { render, children, id, ...elementProps }: MeterLabelProps = $props();

	const meter = useMeterRootContext();
	// useBaseUiId prefixes generated ids with `base-ui-`. An author id is used as given.
	const resolvedId = $derived(id ?? `base-ui-${uid}`);
	const partState: MeterLabelState = {};

	// useRegisteredLabelId publishes this id and, on cleanup, clears it only when it is still
	// the registered one. An older label must not wipe a newer label's id.
	$effect(() => {
		const current = resolvedId;
		meter.labelId = current;
		return () => {
			if (meter.labelId === current) {
				meter.labelId = undefined;
			}
		};
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		id: resolvedId,
		role: 'presentation',
		...elementProps
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<span {...hostProps}>{@render content()}</span>
{/if}
