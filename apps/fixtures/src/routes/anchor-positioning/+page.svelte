<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import Fixture from '../../lib/AnchorPositioningFixture.svelte';
  import '../../lib/anchor-positioning.css';
  import fixtureCss from '../../lib/anchor-positioning.css?raw';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  let frame = $state<HTMLIFrameElement>();
  onMount(() => {
    let node = host;
    if (data.ownerWindow && frame?.contentWindow) {
      const win = frame.contentWindow;
      // Deliberately differs from the top-level DPR; this is fixture instrumentation.
      Object.defineProperty(win, 'devicePixelRatio', { value: 2, configurable: true });
      const style = win.document.createElement('style');
      style.textContent = fixtureCss + '.anchor-positioning .anchor { left: 240.25px; top: 180.25px; width: 80.25px !important; height: 30.25px; } .anchor-positioning .floating { width: 140.25px; height: 70.25px; }';
      win.document.head.append(style);
      node = win.document.createElement('div'); win.document.body.append(node);
    }
    if (data.shadow && node) {
      const shadow = node.attachShadow({ mode: 'open' });
      const style = document.createElement('style'); style.textContent = fixtureCss; shadow.append(style);
      node = document.createElement('div'); shadow.append(node);
    }
    if (!node || (!data.reference && !data.ownerWindow && !data.shadow)) return;
    const target = node; let stopped = false; let cleanup: (() => void) | undefined;
    if (!data.reference) {
      const component = mount(Fixture, { target, props: { scenario: data.scenario } });
      return () => { void unmount(component); };
    }
    void import('../../lib/anchor-positioning-reference.js').then(({ mountAnchorPositioningReference }) => {
      if (!stopped) cleanup = mountAnchorPositioningReference(target, data.scenario);
    });
    return () => { stopped = true; cleanup?.(); };
  });
</script>
{#if data.ownerWindow}<iframe title="Anchor owner window" style="width: 760px; height: 540px" bind:this={frame}></iframe>{:else if data.reference || data.shadow}<div bind:this={host}></div>{:else}<Fixture scenario={data.scenario} />{/if}
