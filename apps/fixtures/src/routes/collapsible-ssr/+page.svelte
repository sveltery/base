<script lang="ts">
  import CollapsibleFixture from '../../lib/CollapsibleFixture.svelte';
  let { data } = $props();
</script>
<!-- eslint-disable svelte/no-at-html-tags -- Rendered exact-pin React fixture markup contains no external content. -->
{#if data.reference}<main data-hydrated="true">{@html data.html}</main>{:else}<CollapsibleFixture scenario={data.scenario} />{/if}
