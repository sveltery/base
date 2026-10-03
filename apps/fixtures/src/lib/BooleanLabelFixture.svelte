<script lang="ts">
  import { untrack } from 'svelte';
  import { Checkbox } from '@sveltery/base/checkbox';
  import { Switch } from '@sveltery/base/switch';
  import type { BooleanLabelState } from './boolean-label-reference.js';

  let {
    family,
    initial,
  }: {
    family: 'checkbox' | 'switch';
    initial: BooleanLabelState;
  } = $props();
  let label = $state(untrack(() => initial));
  export function setLabel(next: BooleanLabelState) {
    label = next;
  }
</script>

<main data-hydrated="true">
  {#if family === 'checkbox'}
    <Checkbox.Root id="label-control" data-control />
  {:else}
    <Switch.Root id="label-control" data-control />
  {/if}
  <span data-gap></span>
  {#if label.present}
    <label id={label.id} for={label.htmlFor}>Native label</label>
  {/if}
</main>
