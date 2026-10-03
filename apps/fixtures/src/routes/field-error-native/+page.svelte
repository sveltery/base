<script lang="ts">
  import { onMount } from 'svelte';
  import Messages from '../../../../../packages/base/tests/dom/NativeErrorMessagesFixture.svelte';
  let messages = $state<ReturnType<typeof Messages>>();
  let hydrated = $state(false);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <section id="native-error"><Messages bind:this={messages} /></section>
  <button onclick={() => messages?.update(['same', 'same'])}>Client messages</button>
  <button onclick={() => messages?.update(['duplicate', 'duplicate'])}>Server messages</button>
</main>
