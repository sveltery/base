<script lang="ts">
  import { LabelableProviderOwner } from '../../src/lib/internals/labelable-provider/createLabelableProvider.svelte.js';
  import RegisteredLabel from './NativeRegisteredLabel.svelte';

  let id = $state('label-a');
  const labelable = new LabelableProviderOwner('control');
  let present = $state(true);
  let replacement = $state(false);

  export function setId(next: string) {
    id = next;
  }
  export function removeLabel() {
    present = false;
  }
  export function replaceRegistration() {
    labelable.setLabelId('other-owner');
    replacement = true;
  }
</script>

<input id="control" aria-labelledby={labelable.labelId} />
{#if present}<RegisteredLabel {id} />{/if}
{#if replacement}<label id="other-owner" for="control">Replacement label</label>{/if}
