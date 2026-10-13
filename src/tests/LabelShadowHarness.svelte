<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { Field, Slider } from '#lib';

	let {
		control,
		labelContainer,
		controlContainer
	}: {
		control: 'field' | 'slider';
		labelContainer?: Element;
		controlContainer?: Element;
	} = $props();

	// Moves a part into a shadow root, where a portal would render it.
	function moveTo(container: Element | undefined): Attachment<HTMLElement> {
		return (node) => {
			container?.appendChild(node);
		};
	}
</script>

<Field.Root>
	{#if control === 'field'}
		<div {@attach moveTo(labelContainer)}>
			<Field.Label nativeLabel={false}>
				{#snippet render(props)}<div {...props}>Name</div>{/snippet}
			</Field.Label>
		</div>
		<div {@attach moveTo(controlContainer)}><Field.Control /></div>
	{:else}
		<Slider.Root defaultValue={50}>
			<div {@attach moveTo(labelContainer)}><Slider.Label>Volume</Slider.Label></div>
			<div {@attach moveTo(controlContainer)}>
				<Slider.Control><Slider.Thumb /></Slider.Control>
			</div>
		</Slider.Root>
	{/if}
</Field.Root>
