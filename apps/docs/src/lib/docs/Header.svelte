<!-- Adapted Base UI docs/src/components/Header.tsx at47b40521; MIT2019 Material-UI SAS. Base UI branded logo replaced by independent Sveltery identity. -->
<script lang="ts">
  import { resolve } from '$app/paths';
  import NativeSearch from './NativeSearch.svelte';
  import { MAIN_CONTENT_ID } from './source.js';
</script>

<header class="Header">
  <div class="HeaderInner">
    <a class="SkipNav" href={'#' + MAIN_CONTENT_ID}>Skip to contents</a><a
      href={resolve('/docs')}
      class="HeaderLogoLink"
      aria-label="Sveltery Base documentation"
      ><strong class="DocsWordmark">sveltery / base</strong></a
    >
    <div class="HeaderSearch"><NativeSearch /></div>
  </div>
</header>
