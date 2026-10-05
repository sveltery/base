<script lang="ts">
  import * as Popover from '../src/lib/popover/index.js';
  import * as PreviewCard from '../src/lib/preview-card/index.js';
  import * as Tooltip from '../src/lib/tooltip/index.js';
  import { expectType } from './expect-type.js';
  const popover = Popover.createHandle<number>();
  const previewCard = PreviewCard.createHandle<number>();
  const tooltip = Tooltip.createHandle<number>();
</script>
<Popover.Root handle={popover}>
  {#snippet children({ payload })}
    {expectType<number | undefined, typeof payload>(payload)}
    <Popover.Trigger handle={popover} payload={42}>Numeric</Popover.Trigger>
    <Popover.Trigger handle={popover}>Optional payload</Popover.Trigger>
  {/snippet}
</Popover.Root>
<PreviewCard.Root handle={previewCard}>
  {#snippet children({ payload })}
    {expectType<number | undefined, typeof payload>(payload)}
    <PreviewCard.Trigger handle={previewCard} payload={42}>Numeric</PreviewCard.Trigger>
    <PreviewCard.Trigger handle={previewCard}>Optional payload</PreviewCard.Trigger>
  {/snippet}
</PreviewCard.Root>
<PreviewCard.Trigger href="#target">
  {#snippet render(props, _state, children)}
    <!-- The pinned React href contract is string | undefined; the actual native HTMLAnchorAttributes union includes null. Native credit zero. -->
    {expectType<string | null | undefined, typeof props.href>(props.href)}
    <a {...props}>{@render children?.()}</a>
  {/snippet}
</PreviewCard.Trigger>
<Tooltip.Trigger handle={tooltip} payload={42}>
  {#snippet render(props, _state, children)}<button {...props} type="button">{@render children?.()}</button>{/snippet}
</Tooltip.Trigger>
<Tooltip.Trigger>
  {#snippet render(props)}<input {...props} />{/snippet}
</Tooltip.Trigger>
