<script lang="ts">
  // Native callback publication regressions; no unchanged upstream assertion credit.
  import { Avatar } from '../../src/lib/avatar/index.js';
  import { Tooltip } from '../../src/lib/tooltip/index.js';
  import type { ImageLoadingStatus } from '../../src/lib/avatar/types.js';
  import CompositeRoot from '../../src/lib/internals/composite/root/CompositeRoot.svelte';
  import CompositeItem from '../../src/lib/internals/composite/item/CompositeItem.svelte';
  import { RadioGroup } from '../../src/lib/radio-group/index.js';
  import { Radio } from '../../src/lib/radio/index.js';

  let disabled = $state(true);
  let source = $state<string | undefined>(undefined);
  let avatarRequests = $state.raw<ImageLoadingStatus[]>([]);
  let tooltipRequests = $state.raw<boolean[]>([]);
  let disabledIndices = $state.raw<number[]>([]);
  let highlightedRequests = $state.raw<number[]>([]);
  let representativeInputs = $state.raw<(HTMLInputElement | null)[]>([]);

  export function setDisabled(next: boolean) { disabled = next; }
  export function setSource(next: string | undefined) { source = next; }
  export function setDisabledIndices(next: number[]) { disabledIndices = next; }
  export function snapshot() { return { avatarRequests, tooltipRequests, highlightedRequests, representativeInputs }; }
</script>

<Avatar.Root>
  <Avatar.Image src={source} onLoadingStatusChange={status => {
    avatarRequests = [...avatarRequests, status];
  }} />
</Avatar.Root>
<Tooltip.Root open={true} {disabled} onOpenChange={(next, details) => {
  tooltipRequests = [...tooltipRequests, next];
  details.cancel();
}} />
<output data-avatar-requests>{avatarRequests.length}</output>
<output data-tooltip-requests>{tooltipRequests.length}</output>
<CompositeRoot {disabledIndices} onHighlightedIndexChange={index => {
  highlightedRequests = [...highlightedRequests, index];
}}>
  <CompositeItem tag="button">First item</CompositeItem>
  <CompositeItem tag="button">Second item</CompositeItem>
</CompositeRoot>
<output data-highlighted-requests>{highlightedRequests.length}</output>
<RadioGroup defaultValue="selected" inputRef={input => {
  representativeInputs = [...representativeInputs, input];
}}>
  <Radio.Root value="selected" />
</RadioGroup>
<output data-representative-inputs>{representativeInputs.length}</output>
