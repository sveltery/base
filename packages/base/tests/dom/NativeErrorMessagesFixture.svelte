<script lang="ts">
  /* eslint-disable svelte/require-each-key -- Native unkeyed rows characterize the explicitly selected Svelte default. */
  let messages = $state<string[]>([]);
  export function update(next: string[]) { messages = next; }
</script>
{#if messages.length > 1}
  <ul>{#each messages as message}<li>{message}</li>{/each}</ul>
{:else}
  <div>{messages[0] ?? ''}</div>
{/if}
