<script lang="ts">
  import { Popover, PreviewCard, Tooltip } from '@sveltery/base';
  const popover = Popover.createHandle<number>();
  const previewCard = PreviewCard.createHandle<number>();
  const tooltip = Tooltip.createHandle<number>();
</script>
<Popover.Trigger handle={popover} payload="wrong" />
<PreviewCard.Trigger handle={previewCard} payload="wrong" />
<Tooltip.Trigger handle={tooltip} payload="wrong" />
<Popover.Positioner keepMounted />
<PreviewCard.Positioner keepMounted />
<Tooltip.Positioner keepMounted />
<Popover.Root modal="wrong" />
<PreviewCard.Positioner side="diagonal" />
<Tooltip.Provider timeout="soon" />
