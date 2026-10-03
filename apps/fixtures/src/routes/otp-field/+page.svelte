<script lang="ts">
  import { onMount } from "svelte";
  import Fixture from "../../lib/OTPFieldBrowserFixture.svelte";
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("../../lib/otp-field-reference.js").then(
      ({ mountOTPFieldReference }) => {
        if (!disposed) cleanup = mountOTPFieldReference(node, data.scenario);
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>
{#if data.reference}<section bind:this={host}></section>{:else}<Fixture scenario={data.scenario} />{/if}
<style>
  :global(input[data-slot]) { width: 30px; height: 36px; margin: 3px; text-align: center; }
</style>
