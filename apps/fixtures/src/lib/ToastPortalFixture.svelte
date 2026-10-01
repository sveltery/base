<script lang="ts">
  // Pinned Base UI 1.8.0 conformance/portal adapters; MIT: parity/toast/UPSTREAM_LICENSE.
  import { onMount } from 'svelte';
  import { Toast, Dialog, mergeProps } from '@sveltery/base';
  import { createAttachmentKey } from 'svelte/attachments';
  import PortalContents from './ToastPortalContents.svelte';
  let { scenario = 'default' }: { scenario?: string } = $props();
  let hydrated = $state(false);
  let mounted = $state(true);
  let targetA = $state<HTMLElement>();
  let targetB = $state<HTMLElement>();
  let shadow = $state<ShadowRoot>();
  let host = $state<HTMLElement>();
  let mode = $state('initial');
  let ref = $state<HTMLElement | null>(null);
  let renderRef = $state<HTMLElement | null>(null);
  const objectRef = { current: null as HTMLElement | ShadowRoot | null };
  const attachmentKey = createAttachmentKey();
  let attachmentNode = $state<HTMLElement | null>(null);
  const attachmentProps = { [attachmentKey]: (node: HTMLElement) => { attachmentNode = node; return () => { attachmentNode = null; }; } };
  const external = Toast.createToastManager();
  onMount(() => { shadow = host!.attachShadow({ mode: 'open' }); hydrated = true; });
  const container = $derived.by(() => {
    if (mode === 'null' || scenario === 'null' && mode === 'initial') return null;
    if (mode === 'a' || scenario === 'element' && mode === 'initial') return targetA ?? null;
    if (mode === 'b') return targetB ?? null;
    if (scenario === 'shadow') return shadow ?? null;
    if (scenario === 'ref' || scenario === 'ref-null') return mode === 'ref-a' ? { current: targetA ?? null } : objectRef;
    return undefined;
  });
  const customized = scenario.startsWith('props-') && scenario !== 'props-default' && scenario !== 'props-style' || scenario.startsWith('render-');
  const wrapped = scenario.startsWith('render-') && !scenario.includes('class');
  const classes = $derived(scenario === 'class' ? 'test-class' : scenario === 'render-class' ? 'component-classname' : scenario === 'render-class-resolved' ? () => 'conditional-component-classname' : undefined);
  const style = $derived(scenario === 'props-style' ? 'color: green' : undefined);
</script>
{#snippet replacement(props, state, _children)}
  {#if wrapped}
    <div data-testid="base-ui-wrapper">
      <div {...props} data-testid="wrapped" data-test-value="source-value" bind:this={renderRef}></div>
    </div>
  {:else}
    <div {...mergeProps(props, { ...(scenario.includes('class') ? { class: 'render-prop-classname' } : {}), ...(scenario.includes('style') ? { style: 'color: green' } : {}) })}
      data-testid={scenario.includes('class') ? 'test-component' : 'custom-root'} bind:this={renderRef}></div>
  {/if}
{/snippet}
<main data-hydrated={hydrated}>
  <div id="target-a" bind:this={targetA}></div><div id="target-b" bind:this={targetB}></div><div id="shadow-host" bind:this={host}></div>
  <button onclick={() => mode = 'a'}>target a</button><button onclick={() => mode = 'b'}>target b</button>
  <button onclick={() => mode = 'null'}>wait</button><button onclick={() => mode = 'default'}>default</button>
  <button onclick={() => mode = 'ref-a'}>resolve ref</button><button onclick={() => { objectRef.current = targetA!; mode = 'mutated'; }}>mutate same ref</button>
  <button onclick={() => mode = 'update'}>update props</button><button onclick={() => mounted = false}>remove</button>
  <button onclick={() => external.add({ id: 'portal-toast', title: 'Portal toast', timeout: 0 })}>add toast</button>
  <output data-testid="refs">{JSON.stringify({ tag: ref?.tagName, testid: ref?.getAttribute('data-testid'), renderTag: renderRef?.tagName, renderTestid: renderRef?.getAttribute('data-testid'), same: !!ref && ref === renderRef, attached: !!ref && ref === attachmentNode })}</output>
  <Toast.Provider toastManager={external}>
    {#if mounted}
      {#if scenario === 'dialog' || scenario === 'dialog-ref-null'}
        <Dialog.Root defaultOpen>
          <Dialog.Portal data-testid="dialog-portal">
            <Dialog.Popup><Dialog.Title>Dialog title</Dialog.Title><button>Dialog control</button></Dialog.Popup>
            <Toast.Portal container={scenario === 'dialog-ref-null' ? objectRef : undefined} data-testid="root"><PortalContents /></Toast.Portal>
          </Dialog.Portal>
        </Dialog.Root>
      {:else}
        <Toast.Portal {container} bind:ref render={customized ? replacement : undefined} class={classes} {style}
          id={mode === 'update' ? 'updated-portal' : undefined} data-testid={scenario === 'props-style' ? 'custom-root' : 'root'}
          lang={scenario.startsWith('props-') ? 'fr' : undefined} data-foobar={scenario.startsWith('props-') ? 'source-value' : undefined}
          data-mode={mode} {...attachmentProps}>
          {#if scenario === 'nested'}<Toast.Portal data-testid="nested">Nested</Toast.Portal>{/if}
          <PortalContents />
        </Toast.Portal>
      {/if}
    {/if}
  </Toast.Provider>
</main>
