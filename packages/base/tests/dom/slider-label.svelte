<script lang="ts">
  import { Slider } from '../../src/lib/slider/index.js';
  import Context from './slider-label-context.svelte';
  let original = $state(true);
  let context: { installNewerLabel(): void; removeNewerLabel(): void };
  let rootId = $state('label-slider');
  export function showNewer() {
    context.installNewerLabel();
  }
  export function hideOriginal() {
    original = false;
  }
  export function hideNewer() {
    context.removeNewerLabel();
  }
  export function replaceId() {
    rootId = 'replacement-slider';
  }
</script>

<Slider.Root id={rootId} defaultValue={40}>
  {#if original}<Slider.Label>Original</Slider.Label>{/if}
  <Context bind:this={context} />
  <Slider.Control><Slider.Thumb /></Slider.Control>
</Slider.Root>
