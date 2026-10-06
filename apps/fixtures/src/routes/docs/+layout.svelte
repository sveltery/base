<script lang="ts">
  import { base, resolve } from '$app/paths';
  import { onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { docs, groups } from '../../lib/docs/content.js';
  import '../../lib/docs/docs.css';
  let { children } = $props();
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
  let query = $state('');
  let menuOpen = $state(false);
  let searchInput: HTMLInputElement;
  let menuButton: HTMLButtonElement;
  const current = $derived(
    docs.find(
      (doc) =>
        '/docs' + (doc.slug ? '/' + doc.slug : '') ===
        page.url.pathname.slice(base.length).replace(/\/$/, ''),
    ),
  );
  const matches = $derived(
    docs.filter((doc) =>
      (doc.title + ' ' + doc.description + ' ' + doc.group)
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ),
  );
  async function shortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      menuOpen = true;
      await tick();
      searchInput?.focus();
    }
    if (event.key === 'Escape') {
      const returnToMenu =
        menuOpen &&
        menuButton?.offsetParent !== null &&
        document.activeElement &&
        searchInput?.closest('aside')?.contains(document.activeElement);
      query = '';
      menuOpen = false;
      if (returnToMenu) {
        await tick();
        menuButton?.focus();
      }
    }
  }
</script>

<svelte:window onkeydown={shortcut} />
<div class="sveltery-docs" data-hydrated={hydrated}>
  <a class="docs-skip" href="#docs-content">Skip to content</a>
  <header class="docs-header">
    <a class="docs-brand" href={resolve('/docs')} aria-label="Sveltery Base overview"
      ><span class="docs-logo" aria-hidden="true">s↗</span><strong
        >sveltery<span> / base</span></strong
      ></a
    >
    <div class="docs-header-links"
      ><span class="docs-version">Svelte 5 · early preview</span><a
        href="https://github.com/sveltery/base">GitHub ↗</a
      ><button
        bind:this={menuButton}
        class="docs-menu"
        aria-expanded={menuOpen}
        aria-controls="docs-navigation"
        onclick={() => (menuOpen = !menuOpen)}>Browse docs</button
      ></div
    >
  </header>
  <div class="docs-grid">
    <aside id="docs-navigation" class:docs-menu-open={menuOpen} class="docs-sidebar">
      <form role="search" onsubmit={(event) => event.preventDefault()}>
        <label for="docs-search">Find a page <kbd>⌘ / Ctrl K</kbd></label>
        <input
          id="docs-search"
          type="search"
          placeholder="Search documentation…"
          bind:value={query}
          bind:this={searchInput}
        />
      </form>
      {#if query.trim()}
        <p class="docs-results" role="status"
          >{matches.length} {matches.length === 1 ? 'page' : 'pages'} found</p
        >
        <nav aria-label="Search results"
          >{#each matches as doc (doc.slug)}<a
              class="docs-nav-link"
              href={doc.slug ? resolve('/docs/[...slug]', { slug: doc.slug }) : resolve('/docs')}
              onclick={() => {
                menuOpen = false;
                query = '';
              }}>{doc.title}</a
            >{/each}</nav
        >
      {:else}
        <nav aria-label="Documentation">
          {#each groups as group (group)}<div class="docs-nav-group"
              ><h2>{group}</h2>{#each docs.filter((doc) => doc.group === group) as doc (doc.slug)}<a
                  class="docs-nav-link"
                  aria-current={current?.slug === doc.slug ? 'page' : undefined}
                  href={doc.slug
                    ? resolve('/docs/[...slug]', { slug: doc.slug })
                    : resolve('/docs')}
                  onclick={() => (menuOpen = false)}
                  >{doc.slug === ''
                    ? 'Introduction'
                    : doc.title}{#if doc.slug === 'components/dialog'}<span
                      class="docs-nav-dot"
                      title="Partial implementation"
                    ></span>{/if}</a
                >{/each}</div
            >{/each}
        </nav>
        <p class="docs-sidebar-note">Drawer & Toast pending.<br />Other components unsupported.</p>
      {/if}
    </aside>
    <main id="docs-content" tabindex="-1" class="docs-main"
      >{@render children?.()}
      <footer class="docs-footer"
        ><p
          >Independent & unofficial. Inspired by <a href="https://base-ui.com/">Base UI</a> and
          <a href="https://ui.shadcn.com/docs">shadcn/ui</a>.</p
        ><a href={resolve('/docs/[...slug]', { slug: 'about' })}
          >Credits, licenses & project status ↗</a
        ></footer
      >
    </main>
    <aside class="docs-toc"
      ><nav aria-label="On this page"
        ><h2>On this page</h2>{#each current?.sections ?? [] as section (section.id)}<a
            href={'#' + section.id}>{section.title}</a
          >{/each}</nav
      ><div class="docs-toc-note"
        ><span aria-hidden="true">↗</span><p>Small parts.<br />Thoughtful interfaces.</p></div
      ></aside
    >
  </div>
</div>
