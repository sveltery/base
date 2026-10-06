<script lang="ts">
  // Native context primitive witness for Source's framework metadata assertions.
  import { getAllContexts, untrack } from 'svelte';
  let {
    observe,
  }: {
    observe(metadata: {
      keyType: string;
      description: string | undefined;
      displayName: unknown;
    }): void;
  } = $props();
  const key = [...getAllContexts().keys()].find(
    (key) => typeof key === 'symbol' && key.description === 'NavigationMenuRootContext',
  );
  untrack(() =>
    observe({
      keyType: typeof key,
      description: typeof key === 'symbol' ? key.description : undefined,
      displayName:
        key === undefined ? undefined : (Object(key) as { displayName?: unknown }).displayName,
    }),
  );
</script>
