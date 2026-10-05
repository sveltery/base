<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { Meter, type MeterRootState } from '../../../../packages/base/src/lib/meter/index.js';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  let {
    part,
    mode,
    standalone = false,
  }: { part: string; mode: string; standalone?: boolean } = $props();
  let hydrated = $state(false),
    ref = $state<HTMLElement | null>(),
    renderRef = $state<HTMLElement | null>();
  onMount(() => {
    hydrated = true;
  });
  const custom = $derived(!['default', 'style', 'class'].includes(mode));
  const wrapped = $derived(mode.startsWith('wrapper'));
  const classProp = $derived(
    mode === 'resolved-class'
      ? () => 'conditional-component-classname'
      : mode === 'class'
        ? 'test-class'
        : 'component-classname',
  );
  const testedProps = $derived({
    'data-testid': 'conformance',
    lang: 'fr',
    'data-foobar': 'foobar',
    class: classProp,
    style: mode === 'style' ? 'color: green' : undefined,
  });
  const Component = $derived(
    part === 'Label' ? Meter.Label : part === 'Track' ? Meter.Track : Meter.Indicator,
  );
</script>

{#snippet replacement(
  supplied: Record<string | symbol, unknown>,
  _state: MeterRootState,
  children: Snippet | undefined,
)}
  {#if wrapped}<div data-testid="wrapper"
      ><div {...supplied} data-test-value="test-value" bind:this={renderRef}
        >{@render children?.()}</div
      ></div
    >
  {:else if mode === 'function-style'}<div
      {...supplied}
      style="color: green"
      data-test-value="test-value"
      bind:this={renderRef}>{@render children?.()}</div
    >
  {:else}<div
      {...mergeProps(supplied, {
        class:
          mode === 'function' || mode === 'function-style' || mode === 'ref-function'
            ? undefined
            : 'render-prop-classname',
        style: mode.endsWith('-style') ? 'color: green' : undefined,
      })}
      data-test-value="test-value"
      bind:this={renderRef}>{@render children?.()}</div
    >{/if}
{/snippet}
{#snippet tested()}
  {#if part === 'Root'}<Meter.Root
      value={40}
      {...testedProps}
      bind:ref
      render={custom ? replacement : undefined}
    />
  {:else if part === 'Value'}<Meter.Value
      {...testedProps}
      bind:ref
      render={custom ? replacement : undefined}
    />
  {:else}<Component {...testedProps} bind:ref render={custom ? replacement : undefined} />{/if}
{/snippet}
<main data-hydrated={hydrated}>
  {#if part === 'Root' || standalone}{@render tested()}{:else}<Meter.Root value={40}
      >{@render tested()}</Meter.Root
    >{/if}
  <output data-testid="ref-id">{ref?.getAttribute('data-testid')}</output><output
    data-testid="render-ref-id">{renderRef?.getAttribute('data-testid')}</output
  ><output data-testid="ref-identity">{ref === renderRef}</output><output data-testid="ref"
    >{ref?.tagName}</output
  ><output data-testid="render-ref">{renderRef?.tagName}</output>
</main>
