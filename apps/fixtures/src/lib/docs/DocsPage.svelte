<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Doc } from './content.js';
  import api from './dialog-api.json';
  import DialogExample from './DialogExample.svelte';
  import exampleSource from './DialogExample.svelte?raw';
  let { doc }: { doc: Doc } = $props();
  function linkHref(href: string) {
    if (!href.startsWith('/docs')) return href;
    const [path, fragment] = href.split('#');
    return (path === '/docs' ? resolve('/docs') : resolve('/docs/[...slug]', { slug: path.slice(6) })) + (fragment ? '#' + fragment : '');
  }
</script>
<svelte:head>
  <title>{doc.title} · Sveltery Base</title>
  <meta name="description" content={doc.description} />
</svelte:head>
<div class="docs-heading">
  <p class="docs-eyebrow">{doc.group} <span aria-hidden="true">/</span> Sveltery Base</p>
  <h1>{doc.title}</h1>
  <p class="docs-lead">{doc.description}</p>
  <span class="docs-badge">Experimental · unpublished</span>
</div>
{#if doc.slug === ''}
  <div class="docs-feature" aria-hidden="true">
    <div class="docs-feature-lines"><span>01 / compose</span><span>02 / make it yours</span><span>03 / test the details</span></div>
    <div class="docs-feature-mark">S<span>↗</span></div>
    <p>Familiar foundations.<br />Your own point of view.</p>
  </div>
{/if}
{#each doc.sections as section (section.id)}
  <section id={section.id} class="docs-section">
    <h2><a href={'#' + section.id}>{section.title}<span class="docs-anchor" aria-hidden="true"> #</span></a></h2>
    {#each section.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
    {#if section.code}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontally scrollable code) -->
      <pre tabindex="0" aria-label={section.title + ' code'}><code>{section.code}</code></pre>
    {/if}
    {#if doc.slug === 'components/dialog' && section.id === 'examples'}
      <div class="docs-demo"><span class="docs-demo-label">PREVIEW / SVELTE 5</span><DialogExample /></div>
      <details class="docs-code"><summary>View example source</summary>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontally scrollable code) -->
        <pre tabindex="0" aria-label="Live Dialog example source"><code>{exampleSource}</code></pre></details>
    {/if}
    {#if doc.slug === 'components/dialog' && section.id === 'api-reference'}
      <h3>Root props</h3>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to the horizontally scrollable table) -->
      <div class="docs-table-scroll" tabindex="0" role="region" aria-label="Root props table">
        <table><caption>Extracted RootProps · optional props marked ?</caption><thead><tr><th scope="col">Prop</th><th scope="col">Type</th></tr></thead><tbody>
          {#each api.props as prop (prop.name)}<tr><th scope="row"><code>{prop.name}{prop.optional ? '?' : ''}</code></th><td><code>{prop.type}</code></td></tr>{/each}
        </tbody></table>
      </div>
      <h3>Part signatures</h3>
      {#each api.parts as part (part.name)}<h4>{part.name}</h4>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontally scrollable code) -->
        <pre tabindex="0" aria-label={part.name + ' props signature'}><code>{part.signature}</code></pre>{/each}
      <details class="docs-code"><summary>Shared types: ElementProps, focus, state, and events</summary>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontally scrollable code) -->
        <pre tabindex="0" aria-label="Shared Dialog type declarations"><code>{api.types}</code></pre></details>
    {/if}
    {#if section.links}<div class="docs-links">{#each section.links as link (link.href)}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- linkHref resolves local docs links and preserves external URLs. -->
      <a href={linkHref(link.href)}>{link.label}</a>
    {/each}</div>{/if}
  </section>
{/each}
