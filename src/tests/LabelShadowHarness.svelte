<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { Field, Slider } from '#lib';

	let {
		control,
		labelContainer,
		controlContainer,
		labelAction = false
	}: {
		control: 'field' | 'slider';
		labelAction?: boolean;
		labelContainer?: Element;
		controlContainer?: Element;
	} = $props();

	function attachShadowTarget(host: HTMLElement) {
		const target = document.createElement('span');
		target.dataset.testid = 'shadow-target';
		host.attachShadow({ mode: 'open' }).appendChild(target);
	}

	// Moves a part into a shadow root, where a portal would render it.
	function moveTo(container: Element | undefined): Attachment<HTMLElement> {
		return (node) => {
			container?.appendChild(node);
		};
	}
</script>

{#snippet action()}
	{#if labelAction}
		<button type="button">Action<span {@attach attachShadowTarget}></span></button>
	{/if}
{/snippet}

<Field.Root>
	{#if control === 'field'}
		<div {@attach moveTo(labelContainer)}>
			<Field.Label nativeLabel={false}>
				{#snippet render(props)}
					<div {...props}>Name{@render action()}</div>
				{/snippet}
			</Field.Label>
		</div>
		<div {@attach moveTo(controlContainer)}><Field.Control /></div>
	{:else}
		<Slider.Root defaultValue={50}>
			<div {@attach moveTo(labelContainer)}>
				<Slider.Label>Volume{@render action()}</Slider.Label>
			</div>
			<div {@attach moveTo(controlContainer)}>
				<Slider.Control><Slider.Thumb /></Slider.Control>
			</div>
		</Slider.Root>
	{/if}
</Field.Root>
