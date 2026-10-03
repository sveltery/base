<script lang="ts">
  import { page } from '$app/state';
  import Fixture from '$lib/DialogRootHandlesFixture.svelte';
  import Reference from '$lib/DialogRootHandlesReference.svelte';
  import type { RootVariant } from '$lib/dialog-root-cases.js';
  const line = $derived(Number(page.url.searchParams.get('line')));
  const variant = $derived((page.url.searchParams.get('variant') ?? 'contained') as RootVariant);
</script>
{#if page.url.searchParams.has('reference')}<Reference {line} {variant}/>{:else}<Fixture {line} {variant}/>{/if}
