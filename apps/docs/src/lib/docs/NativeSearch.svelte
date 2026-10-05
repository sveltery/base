<!-- Source-derived bounded native surface for Base UI SearchControls/SearchDialog/MobileNavContent at47b40521; MIT2019 Material-UI SAS. Autocomplete selection and Drawer gestures are incomplete, recorded in correspondence. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { docs, groups } from '../../../../fixtures/src/lib/docs/content.js';
  import { createSearchEngine } from './search/engine.js';
  import { loadSearchSitemap } from './search/loader.js';
  import Icons from './Icons.svelte';
  let dialog: HTMLDialogElement;
  let desktopTrigger: HTMLButtonElement;
  let mobileTrigger: HTMLButtonElement;
  let query = $state('');
  let mobile = $state(false);
  let results = $state<{ group: string; items: { title: string; path: string; slug: string; prefix?: string; type?: string }[] }[]>([]);
  let pending = $state(false);
  let error = $state(false);
  let searchId = 0;
  let emptyTimeout: ReturnType<typeof setTimeout>;
  let engine = $state.raw<ReturnType<typeof createSearchEngine> | undefined>();
  async function warmup() {
    engine ??= createSearchEngine({ sitemap: loadSearchSitemap, tolerance: 0, limit: 20, enableStemming: true, includeCategoryInGroup: true, excludeSections: true });
    const current = engine;
    try { await current.ready; return current; }
    catch (failure) { if (engine === current) engine = undefined; throw failure; }
  }
  async function search(value: string) {
    query = value; const id = ++searchId; pending = true; error = false;
    clearTimeout(emptyTimeout);
    try {
      const api = await warmup();
      await api.search(value, { groupBy: { properties: ['group'], maxResult: 5 } });
      if (id !== searchId) return;
      const next = api.results.results;
      if (!next.length && value.trim()) emptyTimeout = setTimeout(() => { results = next; pending = false; }, 400);
      else { results = next; pending = false; }
    } catch { if (id === searchId) { error = true; pending = false; } }
  }
  function open(isMobile: boolean) { mobile = isMobile; if (!dialog.open) dialog.showModal(); void search(''); }
  function close() { dialog.close(); ++searchId; query = ''; clearTimeout(emptyTimeout); }
  onMount(() => {
    const timeout = setTimeout(() => { void warmup().catch(() => { error = true; }); }, 250);
    function shortcut(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); event.stopPropagation();
        const visible = desktopTrigger.getClientRects().length ? desktopTrigger : mobileTrigger;
        open(visible !== desktopTrigger);
      }
    }
    window.addEventListener('keydown', shortcut, { capture: true });
    return () => { clearTimeout(timeout); clearTimeout(emptyTimeout); ++searchId; window.removeEventListener('keydown', shortcut, { capture: true }); };
  });
  function keydown(event: KeyboardEvent) {
    if (event.isComposing || event.keyCode === 229) return;
    if (mobile && event.key === 'Escape' && query.trim()) { event.preventDefault(); event.stopPropagation(); void search(''); }
  }
</script>
<button type="button" class="SearchTrigger HeaderSearchDesktopTrigger" bind:this={desktopTrigger} onclick={() => open(false)}>Search<span class="SearchTriggerShortcut">(<kbd>⌘ / Ctrl</kbd><kbd>k</kbd>)</span></button>
<button type="button" class="SearchTrigger HeaderSearchMobileTrigger" bind:this={mobileTrigger} onclick={() => open(true)}><Icons name="search" />Navigation</button>
<dialog bind:this={dialog} class={['DocsNativeDialog', mobile ? 'DocsNativeMobile' : 'SearchPopup']} aria-label={mobile ? 'Docs navigation' : 'Search documentation'} onclose={() => { query = ''; ++searchId; clearTimeout(emptyTimeout); }} onkeydown={keydown}>
  <form method="dialog" class="DocsNativeDialogClose"><button type="submit" class="GhostButton">Close</button></form>
  <div class="SearchInputRoot"><span class="SearchInputIcon"><Icons name="search" /></span><input class="SearchInput" aria-label="Search" placeholder="Search" value={query} oninput={event => void search(event.currentTarget.value)} /></div>
  <div class="DocsNativeResults">
    {#if mobile && !query.trim()}
      <nav aria-label="Docs navigation">{#each groups as group (group)}<section class="MobileNavSection"><h2 class="MobileNavHeading">{group}</h2><ul class="MobileNavList">{#each docs.filter(doc => doc.group === group) as doc (doc.slug)}<li class="MobileNavItem"><a class="MobileNavLink" href={doc.slug ? resolve('/docs/[...slug]', { slug: doc.slug }) : resolve('/docs')} onclick={close}>{doc.slug ? doc.title : 'Introduction'}</a></li>{/each}</ul></section>{/each}</nav>
    {:else if error}<p role="status" class="SearchEmptyState">Search could not load. Browse the page navigation.</p>
    {:else if !pending && !results.length}<p role="status" class="SearchEmptyState">No results found.</p>
    {:else}
      <div aria-busy={pending}>{#if !pending}{#each results as group (group.group)}<section class="SearchGroup"><h2 class="SearchGroupLabel">{group.group.replace(/\s+Pages$/, '')}</h2><ul>{#each group.items as result (result.slug + result.path)}<li><!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Original engine emits authored sitemap routes. --><a class="SearchOptionItem" href={engine?.buildResultUrl(result)} onclick={close}>{result.title}</a></li>{/each}</ul></section>{/each}{/if}</div>
    {/if}
  </div>
</dialog>
