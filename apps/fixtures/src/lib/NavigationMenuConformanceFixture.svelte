<script lang="ts">
  import { onMount } from 'svelte';
  import type { Component, Snippet } from 'svelte';
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  let { part, probe }: { part: keyof typeof NavigationMenu; probe: string } = $props();
  const Part = $derived(
    NavigationMenu[part] as unknown as Component<
      Record<string, unknown>,
      Record<string, never>,
      'ref'
    >,
  );
  let refA = $state<HTMLElement | null>(null);
  let refB = $state<HTMLElement | null>(null);
  const customized = $derived(probe.includes('custom') || probe.startsWith('render-'));
  const wrapping = $derived(probe.startsWith('render-') && !probe.includes('class'));
  const extraClass = $derived(
    probe.includes('class') && probe !== 'class' ? 'render-prop-classname' : '',
  );
  const componentClass = $derived(
    probe === 'class'
      ? 'test-class'
      : probe === 'render-class'
        ? 'component-classname'
        : probe === 'render-class-function'
          ? () => 'conditional-component-classname'
          : undefined,
  );
  const componentProps = $derived({
    lang: 'fr',
    'data-foobar': 'conformance-token',
    'data-testid': customized ? 'wrapped' : 'root',
    style: probe === 'style-component' ? 'color: green' : undefined,
    ...(part === 'Trigger' && customized ? { nativeButton: false } : {}),
  });
  onMount(() => {
    const api = {
      snapshot: (instance = 'HTMLElement') => ({
        refAInstance:
          refA instanceof (window as unknown as Record<string, typeof HTMLElement>)[instance],
        refATag: refA?.tagName ?? null,
        refBTag: refB?.tagName ?? null,
        sameRef: refA === refB,
        refATestId: refA?.dataset.testid ?? null,
        refBTestId: refB?.dataset.testid ?? null,
      }),
    };
    Object.assign(window, { navigationMenuConformance: api });
    return () => {
      delete (window as unknown as { navigationMenuConformance?: unknown })
        .navigationMenuConformance;
    };
  });
</script>

{#snippet customElement(props: Record<string, unknown>, children: Snippet | undefined)}
  <div
    {...props}
    bind:this={refB}
    data-testid={probe.startsWith('props') || probe.startsWith('style') ? 'custom-root' : 'wrapped'}
    data-test-value={['render-function', 'render-element'].includes(probe)
      ? 'conformance-token'
      : undefined}
    class={[props.class, extraClass]}
    style={probe.startsWith('style-custom') ? 'color: green' : (props.style as string | undefined)}
    >{@render children?.()}</div
  >
{/snippet}
{#snippet render(props: Record<string, unknown>, _state: unknown, children: Snippet | undefined)}
  {#if wrapping}<div data-testid="base-ui-wrapper">{@render customElement(props, children)}</div
    >{:else}{@render customElement(props, children)}{/if}
{/snippet}
{#snippet node()}
  <Part
    {...componentProps}
    bind:ref={refA}
    class={componentClass}
    render={customized ? render : undefined}
  />
{/snippet}
{#if part === 'Root'}
  {@render node()}
{:else if part === 'Portal'}
  <NavigationMenu.Root value="item">{@render node()}</NavigationMenu.Root>
{:else if part === 'Arrow' || part === 'Popup'}
  <NavigationMenu.Root value="test"
    ><NavigationMenu.Portal
      ><NavigationMenu.Positioner>{@render node()}</NavigationMenu.Positioner
      ></NavigationMenu.Portal
    ></NavigationMenu.Root
  >
{:else if part === 'Positioner'}
  <NavigationMenu.Root value="test"
    ><NavigationMenu.Portal>{@render node()}</NavigationMenu.Portal></NavigationMenu.Root
  >
{:else if part === 'Icon'}
  <NavigationMenu.Root
    ><NavigationMenu.Item>{@render node()}</NavigationMenu.Item></NavigationMenu.Root
  >
{:else if part === 'Trigger'}
  <NavigationMenu.Root
    ><NavigationMenu.List
      ><NavigationMenu.Item>{@render node()}</NavigationMenu.Item></NavigationMenu.List
    ></NavigationMenu.Root
  >
{:else if part === 'Link'}
  <NavigationMenu.Root
    ><NavigationMenu.List>{@render node()}</NavigationMenu.List></NavigationMenu.Root
  >
{:else}
  <NavigationMenu.Root>{@render node()}</NavigationMenu.Root>
{/if}
