<script lang="ts">
  import { Slider } from '../../src/lib/slider/index.js';
  import { CSPProvider } from '../../src/lib/csp-provider/index.js';
  let {
    values = [20, 80],
    alignment = 'center',
    nonce = 'slider-nonce',
    vertical = false,
  }: {
    values?: readonly number[];
    alignment?: 'center' | 'edge' | 'edge-client-only';
    nonce?: string;
    vertical?: boolean;
  } = $props();
</script>

<CSPProvider {nonce}
  ><Slider.Root
    id="ssr-slider"
    defaultValue={values}
    name="volume"
    thumbAlignment={alignment}
    orientation={vertical ? 'vertical' : 'horizontal'}
  >
    <Slider.Label>Volume</Slider.Label><Slider.Control
      ><Slider.Track><Slider.Indicator /></Slider.Track
      >{#each values as _, index (index)}<Slider.Thumb {index} />{/each}</Slider.Control
    ><Slider.Value />
  </Slider.Root></CSPProvider
>
