<script lang="ts">
  import { NavigationMenu } from '../../src/lib/navigation-menu/index.js';
  import Probe from './NavigationMenuMetadataProbe.svelte';
  let {
    observe,
  }: {
    observe(metadata: {
      keyType: string;
      description: string | undefined;
      displayName: unknown;
    }): void;
  } = $props();
</script>

<NavigationMenu.Root><Probe {observe} /></NavigationMenu.Root>
