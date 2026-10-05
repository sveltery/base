<!-- Source-derived Base UI mdx-components/Subtitle/HeadingLink/CodeBlock/Demo/Reference composition at47b40521; MIT2019 Material-UI SAS. Authored Sveltery prose and actual extracted local types are reused. -->
<script lang="ts">
  import { asset, resolve } from '$app/paths';
  import type { Doc } from '../../../../fixtures/src/lib/docs/content.js';
  import api from '../../../../fixtures/src/lib/docs/dialog-api.json';
  import accordionApi from '../../../../../parity/accordion/api.json';
  import DialogExample from '../../../../fixtures/src/lib/docs/DialogExample.svelte';
  import exampleSource from '../../../../fixtures/src/lib/docs/DialogExample.svelte?raw';
  import CodeBlock from './CodeBlock.svelte';
  import Demo from './Demo.svelte';
  import ReferenceTable from './ReferenceTable.svelte';
  let { doc }: { doc: Doc } = $props();
  const sourceDirectories: Record<string, string> = { 'use-render': 'use-render', 'csp-provider': 'csp-provider', 'direction-provider': 'direction-provider', avatar: 'avatar', accordion: 'accordion', collapsible: 'collapsible', dialog: 'dialog', button: 'button', toolbar: 'toolbar', 'toggle-group': 'toggle-group', 'scroll-area': 'scroll-area', 'remote-form': 'remote-forms' };
  const sourceDirectory = $derived(doc.slug.startsWith('components/') ? sourceDirectories[doc.slug.slice(11)] : undefined);
  function href(link: string) {
    if (!link.startsWith('/docs')) return link;
    const [path, fragment] = link.split('#');
    return (path === '/docs' ? resolve('/docs') : resolve('/docs/[...slug]', { slug: path.slice(6) })) + (fragment ? '#' + fragment : '');
  }

</script>
<svelte:head><title>{doc.title} · Sveltery Base</title><meta name="description" content={doc.description} /></svelte:head>
<h1 class="MdH1">{doc.title}</h1>
<div class="Subtitle"><p>{doc.description}</p>{#if sourceDirectory}<div class="SubtitleLinks"><a class="SubtitleLink" href={"https://github.com/sveltery/base/tree/main/packages/base/src/lib/" + sourceDirectory}><span class="SubtitleLinkText">View source ↗</span></a></div>{/if}</div>
{#if doc.slug === 'components/dialog'}<Demo code={exampleSource} title="DialogExample.svelte"><DialogExample /></Demo>{/if}
{#each doc.sections as section (section.id)}
  <section><h2 id={section.id} class="MdH2"><a class="HeadingLink" href={'#' + section.id}>{section.title}</a></h2>
    {#each section.paragraphs as value (value)}<p class="MdP">{value}</p>{/each}
    {#if section.code}<CodeBlock code={section.code} title={section.title} />{/if}
    {#if doc.slug === 'components/dialog' && section.id === 'api-reference'}
      <h3 class="MdH3">Root props</h3><ReferenceTable name="Root" props={api.props} />
      <h3 class="MdH3">Part signatures</h3>{#each api.parts as part (part.name)}<h4 class="MdH4">{part.name}</h4><CodeBlock code={part.signature} title={part.name + ' props signature'} />{/each}
      <details class="AccordionItem"><summary class="AccordionTrigger">Shared types: ElementProps, focus, state, and events</summary><CodeBlock code={api.types} title="Shared Dialog types" /></details>
    {/if}
    {#if doc.slug === 'components/accordion' && section.id === 'api-reference'}
      {#each accordionApi.parts as part (part.name)}<h3 class="MdH3">{part.name}</h3><CodeBlock code={part.signature} title={part.name + ' Accordion props signature'} />{/each}
      <details class="AccordionItem"><summary class="AccordionTrigger">Accordion state, value and event types</summary><CodeBlock code={accordionApi.types} title="Accordion declarations" /></details>
    {/if}
    {#if doc.slug === 'about' && section.id === 'licenses'}<p class="MdP"><a href={asset('fonts/OFL.txt')}>Paper Mono OFL notice</a></p>{/if}
    {#if section.links}<div>{#each section.links as link (link.href)}<p class="MdP"><!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href resolves internal docs URLs and preserves external URLs. --><a class="Link" href={href(link.href)}>{link.label}</a></p>{/each}</div>{/if}
  </section>
{/each}
