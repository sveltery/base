<script lang="ts">
  import { Field } from '../../src/lib/field/index.js';
  import { Fieldset } from '../../src/lib/fieldset/index.js';
  let { firstError = false, secondError = true }: { firstError?: boolean; secondError?: boolean } = $props();
  let firstId = $state('first-a');
  let secondId = $state('second-a');
  let messagesVisible = $state(true);
  let firstLegendId = $state('legend-first');
  let firstLegendVisible = $state(true);
  let secondLegendVisible = $state(true);
  export function updateMessages() { firstId = 'first-b'; secondId = 'second-b'; }
  export function hideMessages() { messagesVisible = false; }
  export function showMessages() { messagesVisible = true; }
  export function changeAndRemoveFirstLegend() { firstLegendId = 'legend-second'; firstLegendVisible = false; }
  export function removeSecondLegend() { secondLegendVisible = false; }
</script>
<Field.Root>
  <Field.Control id="control" />
  {#if messagesVisible}
    {#if firstError}<Field.Error id={firstId} match>First</Field.Error>{:else}<Field.Description id={firstId}>First</Field.Description>{/if}
    {#if secondError}<Field.Error id={secondId} match>Second</Field.Error>{:else}<Field.Description id={secondId}>Second</Field.Description>{/if}
  {/if}
</Field.Root>
<Fieldset.Root>
  {#if firstLegendVisible}<Fieldset.Legend id={firstLegendId}>First legend</Fieldset.Legend>{/if}
  {#if secondLegendVisible}<Fieldset.Legend id="legend-second">Second legend</Fieldset.Legend>{/if}
</Fieldset.Root>
