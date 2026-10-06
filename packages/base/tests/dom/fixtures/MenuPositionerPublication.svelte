<script lang="ts">
  // Supplemental public native publication/parent-subscription lifetime; zero Original credit.
  import { Menu } from '../../../src/lib/menu/index.js';
  import NativeControl from './MenuPositionerPublicationNativeControl.svelte';
  let {
    publications,
    control = false,
  }: {
    publications: { node: HTMLElement | null; open: boolean }[];
    control?: boolean;
  } = $props();
  const handle = Menu.createHandle();
  let open = $state(true);
  let revision = $state(0);
  let sideOffset = $state(0);
  let positioner = $state<HTMLElement | null>(null);
  const getPositioner = () => positioner;
  function publishPositioner(node: HTMLElement | null) {
    // A real imperative receiver reads the public reactive handle synchronously.
    // SubmenuRoot below also installs the genuine parent Store subscription.
    publications.push({ node, open: handle.isOpen });
    positioner = node;
  }
  export function setOpen(value: boolean) {
    open = value;
  }
  export function updateOptions() {
    sideOffset = 10;
  }
  export function replaceHost() {
    revision += 1;
  }
  export function snapshot() {
    return { positioner, open: handle.isOpen };
  }
</script>

{#snippet renderPositioner(
  props: Record<string | symbol, unknown>,
  _state: object,
  children: import('svelte').Snippet | undefined,
)}
  {#key revision}
    <section {...props} id={`publication-positioner-${revision}`}>
      {@render children?.()}
    </section>
  {/key}
{/snippet}

<Menu.Root {handle} {open} modal={false} onOpenChange={(value) => (open = value)}>
  <Menu.Trigger id="publication-trigger">Open menu</Menu.Trigger>
  {#if control}
    <NativeControl {revision} bind:ref={getPositioner, publishPositioner} />
  {:else}
    <Menu.Portal keepMounted>
      <Menu.Positioner
        {sideOffset}
        render={renderPositioner}
        bind:ref={getPositioner, publishPositioner}
      >
        <Menu.Popup>
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger>Submenu</Menu.SubmenuTrigger>
            <Menu.Portal keepMounted>
              <Menu.Positioner
                ><Menu.Popup><Menu.Item>Nested item</Menu.Item></Menu.Popup></Menu.Positioner
              >
            </Menu.Portal>
          </Menu.SubmenuRoot>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  {/if}
</Menu.Root>
