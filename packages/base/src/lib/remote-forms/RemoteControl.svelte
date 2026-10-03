<script lang="ts">
  import RemoteTextControl from './RemoteTextControl.svelte';
  import RemoteBooleanControl from './RemoteBooleanControl.svelte';
  import RemoteNativeControl from './RemoteNativeControl.svelte';
  import { useRemoteFieldContext } from './RemoteFieldContext.js';
  import type { RemoteControlProps } from './control.types.js';
  let { ref = $bindable(), ...props }: RemoteControlProps = $props();
  const remote = useRemoteFieldContext();
  const kind = $derived(props.type ?? remote?.kind);
  const scalarCheckbox = $derived(kind === 'checkbox' && remote?.descriptor?.value === undefined && !Array.isArray(remote?.accessor?.value()));
</script>
{#if scalarCheckbox}
  <RemoteBooleanControl {...props} bind:ref />
{:else if props.render && kind && ['radio', 'checkbox'].includes(kind)}
  <!-- Authored families own their actual registration/state/hidden host. -->
  <RemoteBooleanControl {...props} bind:ref />
{:else if kind && ['radio', 'checkbox', 'select', 'select multiple', 'file', 'file multiple'].includes(kind)}
  <RemoteNativeControl {...props} {kind} bind:ref />
{:else}
  <RemoteTextControl {...props} bind:ref />
{/if}
