<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { ClassValue, HTMLAttributes } from 'svelte/elements';
  import Toggle from '../../../../packages/base/src/lib/toggle/Toggle.svelte';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  import type { HTMLProps } from '../../../../packages/base/src/lib/internals/types.js';
  import type { NativeStyle } from '../../../../packages/base/src/lib/internals/nativeProps.js';
  import type { ToggleState } from '../../../../packages/base/src/lib/toggle/types.js';

  // Actual public Toggle business host; no test-only renderer or React ref transport.
  type Mode = 'default' | 'span' | 'same-span' | 'section';
  let {
    mode = 'default',
    classValue = 'before',
    styleValue = 'color:red;padding:10px',
    ownedClass = 'owned',
    ownedStyle = 'color:blue;font-size:16px',
    disabled = false,
    cancel = false,
    prevention = 'none',
  }: {
    mode?: Mode;
    classValue?: ClassValue;
    styleValue?: NativeStyle;
    ownedClass?: ClassValue;
    ownedStyle?: NativeStyle;
    disabled?: boolean;
    cancel?: boolean;
    prevention?: 'none' | 'default' | 'base';
  } = $props();
  let pressed = $state(false);
  let present = $state(true);
  let hydrated = $state(false);
  let ref = $state<HTMLElement | null | undefined>();
  let revision = $state(0);
  const calls: string[] = [];
  const received: {
    props: HTMLProps;
    state: ToggleState;
    children: Snippet | undefined;
  }[] = [];
  const key = createAttachmentKey();
  function authored(host: HTMLElement) {
    const current = revision;
    calls.push(
      `attach:${current}:${host.tagName}:${host.isConnected}:${host.getAttribute('class')}`,
    );
    return () =>
      calls.push(
        `cleanup:${current}:${host.tagName}:${host.isConnected}:${host.getAttribute('class')}`,
      );
  }
  function record(props: HTMLProps, state: ToggleState, children: Snippet | undefined) {
    received.push({ props, state, children });
    return mergeProps(props, { class: ownedClass, style: ownedStyle });
  }
  function consumer(event: MouseEvent & { preventBaseUIHandler(): void }) {
    calls.push(`consumer:${String(ref?.getAttribute('aria-pressed'))}`);
    if (prevention === 'default') event.preventDefault();
    if (prevention === 'base') event.preventBaseUIHandler();
  }
  export function setMode(value: Mode) {
    mode = value;
  }
  export function setClass(value: ClassValue) {
    classValue = value;
  }
  export function setStyle(value: Exclude<NativeStyle, undefined>) {
    styleValue = value;
  }
  export function setPressed(value: boolean) {
    pressed = value;
  }
  export function setDisabled(value: boolean) {
    disabled = value;
  }
  export function setCanceled(value: boolean) {
    cancel = value;
  }
  export function setPrevention(value: 'none' | 'default' | 'base') {
    prevention = value;
  }
  export function updateAttachment() {
    revision += 1;
  }
  export function hide() {
    present = false;
  }
  export function snapshot() {
    return { ref, calls: [...calls], received: [...received], pressed };
  }
  onMount(() => {
    hydrated = true;
  });
  function probe(host: HTMLElement) {
    Object.assign(host, {
      nativeSnippet: {
        snapshot,
        setMode,
        setClass,
        setStyle,
        setPressed,
        setDisabled,
        setCanceled,
        setPrevention,
        updateAttachment,
        hide,
      },
    });
  }
</script>

{#snippet span(props: HTMLProps, state: ToggleState, children: Snippet | undefined)}
  {const merged = $derived(record(props, state, children))}
  <span {...merged as HTMLAttributes<HTMLSpanElement>} data-snippet-pressed={String(state.pressed)}
    >{@render children?.()}</span
  >
{/snippet}
{#snippet sameSpan(props: HTMLProps, state: ToggleState, children: Snippet | undefined)}
  {const merged = $derived(record(props, state, children))}
  <span {...merged as HTMLAttributes<HTMLSpanElement>} data-snippet-pressed={String(state.pressed)}
    >{@render children?.()}</span
  >
{/snippet}
{#snippet section(props: HTMLProps, state: ToggleState, children: Snippet | undefined)}
  {const merged = $derived(record(props, state, children))}
  <section {...merged as HTMLAttributes<HTMLElement>} data-snippet-pressed={String(state.pressed)}>
    {@render children?.()}
  </section>
{/snippet}
<main data-hydrated={hydrated} {@attach probe}>
  {#if present}
    <Toggle
      id="native-toggle"
      {pressed}
      {disabled}
      nativeButton={mode === 'default'}
      bind:ref
      class={classValue}
      style={styleValue}
      {...{ [key]: authored }}
      onclick={consumer}
      onPressedChange={(value, details) => {
        calls.push(
          `change:${value}:${String(ref?.getAttribute('aria-pressed'))}:${details.event.type}`,
        );
        if (cancel) details.cancel();
        if (!details.isCanceled) pressed = value;
      }}
      render={mode === 'span'
        ? span
        : mode === 'same-span'
          ? sameSpan
          : mode === 'section'
            ? section
            : undefined}
    >
      Native children {pressed ? 'pressed' : 'idle'}
    </Toggle>
  {/if}
</main>
