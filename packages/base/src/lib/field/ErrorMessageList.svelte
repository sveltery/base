<script lang="ts">
  // Native message-list lifetime; Base UI and React MIT notices: parity/field-form/.
  import { ErrorMessageOwnership } from './messageOwnership.js';
  let { messages }: { messages: string[] } = $props();
  const ownership = new ErrorMessageOwnership();
  const rows = $derived(ownership.update(messages));
</script>
<ul>{#each rows as row (row.id)}<li>{row.key}</li>{/each}</ul>
