<script lang="ts">
  // Native fixture adaptations of immutable Fieldset source bodies; MIT: parity/field-form/UPSTREAM_LICENSE.
  import { Fieldset } from '../../src/lib/fieldset/index.js';
  import { Field } from '../../src/lib/field/index.js';
  let { scenario }: { scenario: string } = $props();
  let outerDisabled = $state(false),
    innerDisabled = $state(true),
    legendId = $state('legend-a'),
    showLegend = $state(true);
</script>

{#if scenario === 'native-disabled'}
  <Fieldset.Root disabled data-testid="fieldset"><input /></Fieldset.Root>
{:else if scenario === 'nested-disabled'}
  <Fieldset.Root disabled
    ><Fieldset.Root><Field.Root><Field.Control data-testid="control" /></Field.Root></Fieldset.Root
    ></Fieldset.Root
  >
{:else if scenario === 'nested-updates'}
  <Fieldset.Root disabled={outerDisabled}
    ><Fieldset.Root disabled={innerDisabled}
      ><Field.Root data-testid="root"><Field.Control data-testid="control" /></Field.Root
      ></Fieldset.Root
    ></Fieldset.Root
  >
  <button type="button" onclick={() => (outerDisabled = true)}>Disable outer</button>
  <button type="button" onclick={() => (innerDisabled = false)}>Enable inner</button>
  <button type="button" onclick={() => (outerDisabled = false)}>Enable outer</button>
{:else if scenario === 'generated-legend'}
  <Fieldset.Root><Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend></Fieldset.Root>
{:else if scenario === 'custom-legend'}
  <Fieldset.Root><Fieldset.Legend id="legend-id" /></Fieldset.Root>
{:else if scenario === 'updated-legend'}
  <Fieldset.Root
    >{#if showLegend}<Fieldset.Legend id={legendId}>Legend</Fieldset.Legend>{/if}</Fieldset.Root
  >
  <button type="button" onclick={() => (legendId = 'legend-b')}>Change id</button>
  <button type="button" onclick={() => (showLegend = false)}>Remove legend</button>
{:else if scenario === 'orphan-legend'}<Fieldset.Legend />{/if}
