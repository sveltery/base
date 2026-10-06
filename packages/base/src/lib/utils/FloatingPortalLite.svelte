<script lang="ts" generics="State extends object = Record<string, never>">
  // Original Base UI 1.8.0 FloatingPortalLite, same canonical node/content helpers.
  // MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import { getAllContexts, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
  import {
    useFloatingPortalNode,
    useFloatingPortalContent,
    type PortalContainer,
  } from '../floating-ui/hooks/useFloatingPortalNode.svelte.js';

  let {
    children,
    container,
    ref = $bindable(),
    ...componentProps
  }: Omit<WithBaseUIEvent<HTMLAttributes<HTMLElement>>, 'children' | 'class' | 'style'> &
    BaseUIComponentProps<State> & {
      children?: Snippet | undefined;
      container?: PortalContainer | undefined;
      ref?: HTMLElement | null | undefined;
    } = $props();

  function attachHost(host: HTMLElement) {
    ref = host;
    return () => {
      if (ref === host) ref = null;
    };
  }
  const generatedId = $props.id();
  const elementProps = $derived.by(() => {
    const { class: _class, style: _style, render: _render, ...rest } = componentProps;
    void _class;
    void _style;
    void _render;
    return rest;
  });
  const portal = useFloatingPortalNode<State>(
    () => ({ container, onHost: attachHost, componentProps, elementProps }),
    generatedId,
  );
  // Lite preserves its inherited child context and installs no PORTAL provider.
  const childrenContext = getAllContexts();
  useFloatingPortalContent(
    () => portal.node,
    () => children,
    childrenContext,
  );
</script>
