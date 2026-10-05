<script lang="ts">
  import DocsLayout from '../../../../fixtures/src/routes/docs/+layout.svelte';
  let { children } = $props();
</script>
<DocsLayout>{@render children?.()}</DocsLayout>
