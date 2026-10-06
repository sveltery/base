<script lang="ts">
  // Native adaptations of immutable Field Description/Label source bodies; MIT: parity/field-form/UPSTREAM_LICENSE.
  import { Field } from '../../src/lib/field/index.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  let { scenario }: { scenario: string } = $props();
  let first = $state(true),
    second = $state(true);
  export function rerenderControls(options: { first?: boolean; second?: boolean }) {
    first = options.first ?? true;
    second = options.second ?? true;
  }
</script>

{#snippet divLabel(
  nativeProps: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}<div {...nativeProps as HTMLAttributes<HTMLDivElement>}>{@render children?.()}</div>{/snippet}
{#snippet emptyLabel()}{/snippet}
{#if scenario === 'description-auto'}<Field.Root
    ><Field.Control /><Field.Description>Message</Field.Description></Field.Root
  >
{:else if scenario === 'description-external'}<Field.Root
    ><Field.Control aria-describedby="external-description" /><Field.Description
      >Message</Field.Description
    ></Field.Root
  >
{:else if scenario === 'description-empty'}<Field.Root
    ><Field.Control aria-describedby="external-description" /><Field.Description id=""
      >Message</Field.Description
    ></Field.Root
  >
{:else if scenario === 'description-item'}<Field.Root
    ><Field.Item disabled
      ><Field.Description data-testid="description">Message</Field.Description></Field.Item
    ></Field.Root
  >
{:else if scenario === 'label-auto'}<Field.Root data-testid="field"
    ><Field.Control /><Field.Label data-testid="label">Label</Field.Label></Field.Root
  >
{:else if scenario === 'label-focus'}<Field.Root
    ><Field.Control data-testid="control" /><Field.Label
      nativeLabel={false}
      render={divLabel}
      data-testid="label">Label</Field.Label
    ></Field.Root
  >
{:else if scenario === 'label-controls'}<Field.Root
    >{#if first}<Field.Control id="a" />{/if}{#if second}<Field.Control id="b" />{/if}<Field.Label
      data-testid="label">Label</Field.Label
    ></Field.Root
  >
{:else if scenario === 'label-item'}<Field.Root
    ><Field.Item disabled><Field.Label data-testid="label">Label</Field.Label></Field.Item
    ></Field.Root
  >
{:else if scenario === 'label-default-warning'}<Field.Root
    ><Field.Control /><Field.Label>Label</Field.Label></Field.Root
  >
{:else if scenario === 'label-empty'}<Field.Root
    ><Field.Label render={emptyLabel}>Label</Field.Label></Field.Root
  >
{:else if scenario === 'label-wrong-native'}<Field.Root
    ><Field.Control /><Field.Label nativeLabel render={divLabel}>Label</Field.Label></Field.Root
  >
{:else if scenario === 'label-wrong-nonnative'}<Field.Root
    ><Field.Control /><Field.Label nativeLabel={false}>Label</Field.Label></Field.Root
  >{/if}
