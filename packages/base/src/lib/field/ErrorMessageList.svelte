<script lang="ts">
  /* eslint-disable svelte/require-each-key -- Native unkeyed error rows are the explicitly selected Svelte default. */
  // Native Svelte list for the Base UI FieldError message branch.
  // Base UI v1.8.0; MIT: THIRD_PARTY_NOTICES.md.
  let { messages }: { messages: string[] } = $props();
</script>
<ul>{#each messages as message}<li>{message}</li>{/each}</ul>
