<script lang="ts">
  import { onMount, hydrate, flushSync, unmount } from 'svelte';
  import AvatarSsr from '../../lib/avatar-ssr.svelte';
  import { avatarDataUri, avatarSnapshot, installAvatarHarness } from '../../lib/avatar-harness.js';
  let { data } = $props(); let host = $state<HTMLDivElement>();
  onMount(() => {
    const restore = installAvatarHarness('real-ssr'); let stopped = false; let cleanup: (() => void) | undefined;
    void (async () => {
      const image = new Image(); image.src = avatarDataUri; await image.decode();
      if (stopped || !host) return;
      const renderedImage = host.querySelector('img');
      if (renderedImage) await renderedImage.decode();
      if (stopped) return;
      const referenceHydrator = data.reference ? (await import('../../lib/avatar-ssr-reference.js')).hydrateAvatarReference : undefined;
      if (stopped) return;
      window.avatarHydrate = () => {
        if (!host) throw new Error('SSR host was removed');
        if (referenceHydrator) {
          cleanup = referenceHydrator(host, data.keepMounted);
        } else {
          const component = hydrate(AvatarSsr, { target: host, props: { keepMounted: data.keepMounted } }); flushSync();
          cleanup = () => { void unmount(component); };
        }
        const snapshot = avatarSnapshot(host);
        host.dataset.afterHydration = JSON.stringify(snapshot);
        requestAnimationFrame(() => { if (!stopped && host) { window.avatarHarness.firstPaint = avatarSnapshot(host); host.dataset.firstPaint = 'true'; } });
        return snapshot;
      };
      host.dataset.ready = 'true';
    })();
    return () => { stopped = true; delete window.avatarHydrate; cleanup?.(); restore(); };
  });
</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted feature-local renderToString/render output from the server. -->
<div bind:this={host} data-testid="ssr-host">{@html data.html}</div>
