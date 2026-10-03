<script lang="ts">
  import { page } from '$app/state';
  import Fixture from '$lib/DialogHandlesFixture.svelte';
  import Reference from '$lib/DialogHandlesReference.svelte';
  const line = $derived(Number(page.url.searchParams.get('line') ?? 99));
  const reference = $derived(page.url.searchParams.has('reference'));
</script>
{#if reference}<Reference {line}/>{:else}<Fixture {line}/>{/if}
