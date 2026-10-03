<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import NativeFixture from './BooleanLabelFixture.svelte';
  import type { BooleanLabelState } from './boolean-label-reference.js';

  let {
    family,
    reference,
  }: {
    family: 'checkbox' | 'switch';
    reference: boolean;
  } = $props();
  let host: HTMLElement;
  let setLabel: ((label: BooleanLabelState) => void) | undefined;
  let state: BooleanLabelState = {
    present: false,
    id: 'native-label-a',
    htmlFor: 'label-control',
  };
  function update(next: Partial<BooleanLabelState>) {
    state = { ...state, ...next };
    setLabel?.(state);
  }
  onMount(() => {
    const shadow = host.attachShadow({ mode: 'open' });
    if (!reference) {
      const component = mount(NativeFixture, {
        target: shadow,
        props: { family, initial: state },
      });
      setLabel = component.setLabel;
      return () => {
        setLabel = undefined;
        void unmount(component);
      };
    }
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('./boolean-label-reference.js').then(({ mountBooleanLabelReference }) => {
      if (disposed) return;
      const view = mountBooleanLabelReference(shadow, family, state);
      setLabel = view.setLabel;
      cleanup = view.dispose;
    });
    return () => {
      disposed = true;
      setLabel = undefined;
      cleanup?.();
    };
  });
</script>

<section bind:this={host} data-shadow-host></section>
<button type="button" onclick={() => update({ present: true })}>Mount label</button>
<button type="button" onclick={() => update({ id: 'native-label-b' })}>Change label id</button>
<button type="button" onclick={() => update({ htmlFor: 'other-control' })}>Unlink label</button>
<button type="button" onclick={() => update({ htmlFor: 'label-control' })}>Link label</button>
<button type="button" onclick={() => update({ id: '' })}>Clear label id</button>
<button type="button" onclick={() => update({ present: false })}>Remove label</button>
