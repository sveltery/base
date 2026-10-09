<!--
	An accessible label for the progress bar.
	Renders a `<span>` element.
	Derived from Base UI v1.8.0 packages/react/src/progress/label/ProgressLabel.tsx
	and packages/react/src/utils/useRegisteredLabelId.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useProgressRootContext } from './ProgressRootContext.svelte.js';
	import { progressStateAttributesMapping } from './stateAttributesMapping.js';
	import type { ProgressLabelProps, ProgressState } from './types.js';

	let { id: idProp, render, children, ...elementProps }: ProgressLabelProps = $props();

	const context = useProgressRootContext();
	const generatedId = $props.id();
	const id = $derived(idProp ?? `base-ui-${generatedId}`);
	const state: ProgressState = $derived({ status: context.computed.status });

	registerLabelId(() => id, (next) => context.setLabelId(next), {
		readCurrent: () => context.labelId
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, progressStateAttributesMapping),
		id,
		role: 'presentation'
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
