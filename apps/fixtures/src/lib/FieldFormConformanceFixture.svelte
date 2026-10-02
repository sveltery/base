<script lang="ts">
  // Nine pinned describeConformance invocations; helper assertions are separately uncredited. MIT.
  import { onMount, type Component, type Snippet } from 'svelte';
  import { Field } from '../../../../packages/base/src/lib/field/index.js';
  import { Fieldset } from '../../../../packages/base/src/lib/fieldset/index.js';
  import { Form } from '../../../../packages/base/src/lib/form/index.js';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  let { part, scenario }: { part: string; scenario: string } = $props();
  type Props = Record<string | symbol, unknown> & { ref?: HTMLElement | null; render?: Snippet<[Record<string | symbol, unknown>]> };
  const parts = { 'Field.Root': Field.Root, 'Field.Control': Field.Control, 'Field.Label': Field.Label, 'Field.Description': Field.Description,
    'Field.Error': Field.Error, 'Field.Item': Field.Item, 'Fieldset.Root': Fieldset.Root, 'Fieldset.Legend': Fieldset.Legend, Form } as unknown as Record<string, Component<Props, Record<string, never>, 'ref'>>;
  const Part = $derived(parts[part]);
  const customized = $derived(scenario.startsWith('props-') && !['props-default', 'props-style'].includes(scenario) || scenario.startsWith('render-'));
  const wrapped = $derived(scenario.startsWith('render-') && !scenario.includes('class'));
  const renderTag = $derived(part === 'Field.Label' ? 'label' : 'div');
  const extra = $derived(part === 'Field.Error' ? { match: true } : {});
  const classValue = $derived(scenario === 'class' ? 'test-class' : scenario === 'render-class' ? 'component-classname' : scenario === 'render-class-resolved' ? () => 'conditional-component-classname' : undefined);
  const nativeConstructor = $derived(part === 'Field.Control' ? 'HTMLInputElement' : part === 'Field.Description' ? 'HTMLParagraphElement' : part === 'Field.Label' ? 'HTMLLabelElement' : part === 'Fieldset.Root' ? 'HTMLFieldSetElement' : part === 'Form' ? 'HTMLFormElement' : 'HTMLDivElement');
  let hydrated = $state(false), ref = $state<HTMLElement | null>(), renderRef = $state<HTMLElement>();
  onMount(() => { hydrated = true; });
</script>
{#snippet replacement(props: Record<string | symbol, unknown>)}
  {#if wrapped}
    <div data-testid="base-ui-wrapper"><svelte:element this={renderTag} {...props} data-testid="wrapped" data-test-value={['render-function', 'render-element'].includes(scenario) ? 'source-value' : undefined} bind:this={renderRef} /></div>
  {:else}
    {const merged = $derived(mergeProps(props, { ...(scenario.includes('class') ? { class: 'render-prop-classname' } : {}), ...(scenario.includes('style') ? { style: 'color: green' } : {}) }))}
    <svelte:element this={renderTag} {...merged} data-testid={scenario.includes('class') ? 'test-component' : 'custom-root'} bind:this={renderRef} />
  {/if}
{/snippet}
{#snippet tested()}
  <Part {...extra} bind:ref render={customized ? replacement : undefined} class={classValue} style={scenario === 'props-style' ? 'color: green' : undefined}
    data-testid={scenario === 'props-style' ? 'custom-root' : 'root'} lang={scenario.startsWith('props-') ? 'fr' : undefined} data-foobar={scenario.startsWith('props-') ? 'source-value' : undefined} />
{/snippet}
<main data-hydrated={hydrated}>
  {#if part === 'Fieldset.Legend'}<Fieldset.Root>{@render tested()}</Fieldset.Root>
  {:else if ['Field.Control', 'Field.Label', 'Field.Description', 'Field.Error', 'Field.Item'].includes(part)}<Field.Root invalid={part === 'Field.Error'}>{@render tested()}</Field.Root>
  {:else}{@render tested()}{/if}
  <output data-testid="refs">{JSON.stringify({ native: hydrated && ref instanceof (window as unknown as Record<string, typeof HTMLElement>)[nativeConstructor], present: !!ref, renderPresent: !!renderRef,
    tag: ref?.tagName, testid: ref?.getAttribute('data-testid'), renderTag: renderRef?.tagName, renderTestid: renderRef?.getAttribute('data-testid') })}</output>
</main>
