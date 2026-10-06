<script lang="ts">
  import { CSPProvider } from '../../src/lib/csp-provider/index.js';
  import Probe from './CSPProbe.svelte';
</script>

<main
  ><Probe name="outside" /><CSPProvider nonce="outer" disableStyleElements
    ><Probe name="outer" /><CSPProvider><Probe name="inner-omitted" /></CSPProvider><CSPProvider
      nonce="inner"
      disableStyleElements={false}><Probe name="inner-explicit" /></CSPProvider
    ><Probe name="outer-sibling" /></CSPProvider
  ><Probe name="after" /></main
>
