<!-- Adapted Base UI docs/src/components/SideNav.tsx Item at47b40521; MIT2019 Material-UI SAS. See THIRD_PARTY_NOTICES.md. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import scrollIntoView from 'scroll-into-view-if-needed';
  import { HEADER_HEIGHT_DESKTOP } from './source.js';
  import type { Snippet } from 'svelte';
  let { href, children, external = false }: { href: string; children?: Snippet; external?: boolean } = $props();
  let ref: HTMLLIElement;
  let rem = 16;
  const SCROLL_MARGIN = 48;
  const active = $derived(!external && page.url.pathname.replace(/\/$/, '') === new URL(href, page.url.href).pathname.replace(/\/$/, ''));
  onMount(() => { rem = parseFloat(getComputedStyle(document.documentElement).fontSize); });
  $effect(() => {
    if (ref && active) {
      const scrollMargin = SCROLL_MARGIN * rem / 16;
      const headerHeight = HEADER_HEIGHT_DESKTOP * rem / 16;
      const viewport = document.querySelector<HTMLElement>('[data-side-nav-viewport]');
      if (!viewport) return;
      scrollIntoView(ref, {
        block: 'nearest', scrollMode: 'if-needed', boundary: parent => viewport.contains(parent),
        behavior: actions => actions.forEach(({ top }) => {
          const dir = viewport.scrollTop > top ? -1 : 1;
          const offset = Math.max(0, headerHeight - Math.max(0, window.scrollY));
          viewport.scrollTop = top + offset + scrollMargin * dir;
        }),
      });
    }
  });
</script>
<li bind:this={ref} class="SideNavItem">
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Callers provide resolved Kit routes or external URLs. -->
  <a class="SideNavLink" {href} aria-current={active ? 'page' : undefined} data-active={active || undefined} onclick={active ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}>{@render children?.()}</a>
</li>
