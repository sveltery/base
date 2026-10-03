<script lang="ts">
  let messages = $state<string[]>([]);
  export function update(next: string[]) { messages = next; }
</script>
{#if messages.length > 1}
  <ul>{#each messages as message}<li>{message}</li>{/each}</ul>
{:else}
  <div>{messages[0] ?? ''}</div>
{/if}
