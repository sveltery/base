<!-- A typed handle types the payload that the root's children snippet receives. -->
<script lang="ts">
	import { PreviewCard, Popover, Tooltip } from '#lib';

	const tooltip = Tooltip.createHandle<{ label: string }>();
	const card = PreviewCard.createHandle<{ href: string }>();
	const popover = Popover.createHandle<{ title: string }>();
</script>

<Tooltip.Root handle={tooltip}>
	{#snippet children({ payload })}
		{payload?.label.toUpperCase()}
	{/snippet}
</Tooltip.Root>
<Tooltip.Trigger handle={tooltip} payload={{ label: 'Save' }} />

<PreviewCard.Root handle={card}>
	{#snippet children({ payload })}
		{payload?.href.toUpperCase()}
	{/snippet}
</PreviewCard.Root>
<PreviewCard.Trigger handle={card} payload={{ href: '/docs' }} />

<Popover.Root handle={popover}>
	{#snippet children({ payload })}
		{payload?.title.toUpperCase()}
	{/snippet}
</Popover.Root>
<Popover.Trigger handle={popover} payload={{ title: 'Edit' }} />
