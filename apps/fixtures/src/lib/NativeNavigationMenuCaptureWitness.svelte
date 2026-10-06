<script lang="ts">
  // Bare context and DOM relocation control. No Base/runtime portal/event engine.
  import { onDestroy, onMount, setContext } from 'svelte';
  import {
    nativeCaptureContext,
    type NativeCaptureOwner,
  } from './native-navigation-menu-capture-context.js';
  import Child from './NativeNavigationMenuCaptureChild.svelte';
  let childHost = $state<HTMLDivElement | null>(null);
  let movedHost: HTMLDivElement | null = null;
  let ownerValue = $state('initial');
  let hydrated = $state(false);
  let moved = $state(false);
  let events = $state<string[]>([]);
  const owner: NativeCaptureOwner = {
    get value() {
      return ownerValue;
    },
  };
  setContext(nativeCaptureContext, owner);
  onMount(() => {
    hydrated = true;
  });
  onDestroy(() => {
    movedHost?.remove();
  });
  function record(value: string) {
    events.push(value);
  }
  function move() {
    const host = childHost;
    if (!host) throw new Error('Actual bare child host is missing');
    // Test-only native DOM operation, moving this actual same bound element.
    host.ownerDocument.body.append(host);
    movedHost = host;
    moved = true;
  }
</script>

<section data-testid="bare-capture-witness" data-hydrated={hydrated} data-moved={moved}>
  <div data-testid="bare-capture-parent" onclickcapture={() => record(`capture:${ownerValue}`)}>
    <Child bind:host={childHost} {record} />
  </div>
  <button type="button" data-testid="bare-capture-move" onclick={move}>Move child host</button>
  <button
    type="button"
    data-testid="bare-capture-context"
    onclick={() => {
      ownerValue = 'updated';
    }}>Update owner context</button
  >
  <ol data-testid="bare-capture-events"
    >{#each events as event, index (index)}<li>{event}</li>{/each}</ol
  >
</section>
