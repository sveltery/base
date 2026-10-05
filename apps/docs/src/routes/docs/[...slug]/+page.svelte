<script lang="ts">
  import DocsPage from '../../../../../fixtures/src/lib/docs/DocsPage.svelte';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>
<DocsPage doc={data.doc} />
