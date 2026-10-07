<!--
	An accessible label for the progress bar.
	Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/progress/label/ProgressLabel.tsx
	and packages/react/src/utils/useRegisteredLabelId.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useProgressRootContext } from './ProgressRootContext.svelte.js';
	import { progressStateAttributesMapping } from './stateAttributesMapping.js';
	import type { ProgressLabelProps, ProgressState } from './types.js';

	let { id: idProp, render, children, ...elementProps }: ProgressLabelProps = $props();

	const context = useProgressRootContext();
	const generatedId = $props.id();
	const id = $derived(idProp ?? `base-ui-${generatedId}`);
	const state: ProgressState = $derived({ status: context.computed.status });

	// Register before paint, and clear on destroy only when this id is still the current one
	// so an older label cannot wipe a newer label's association.
	$effect.pre(() => {
		const current = id;
		context.setLabelId(current);
		return () => {
			context.setLabelId((existing) => (existing === current ? undefined : existing));
		};
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, progressStateAttributesMapping),
		id,
		role: 'presentation'
	});
</script>

{#if render}
	{@render render(hostProps, state)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
