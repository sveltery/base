<script lang="ts">
  import { onMount } from 'svelte';
  import { Avatar } from '@sveltery/base';
  import { avatarDataUri } from './avatar-harness.js';
  let { keepMounted = false }: { keepMounted?: boolean } = $props();
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  <Avatar.Root data-testid="root">
    <Avatar.Image
      data-testid="image"
      {keepMounted}
      src={avatarDataUri}
      alt="Jane Doe"
      onLoadingStatusChange={(status) => window.avatarHarness.statuses.push(status)}
    />
    <Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
  </Avatar.Root>
</main>
