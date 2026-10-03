// Native Svelte replacement of the @floating-ui/react-dom renderer boundary.
// Source: Base UI 1.8.0 useFloating.ts, MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
// Floating UI 2.1.9 useFloating/getDPR/roundByDPR, MIT: parity/anchor-positioning/FLOATING_UI_LICENSE.
import { computePosition, type ComputePositionConfig, type VirtualElement } from '@floating-ui/dom';
import { isElement } from '@floating-ui/utils/dom';
import { untrack } from 'svelte';
import type { PositioningResult, Reference } from './types.js';

interface NativeFloatingOptions {
  open: boolean;
  mounted: boolean;
  transform?: boolean;
  /** Middleware writes must obey the same lifetime/request ownership as coordinates. */
  getConfig: (isCurrent: (node: HTMLElement) => boolean) => ComputePositionConfig;
  whileElementsMounted: (reference: Reference, floating: HTMLElement, update: () => void) => () => void;
}

/** Geometry and attached-host lifetime only. FloatingRootStore/tree interactions remain missing. */
export function useFloating(readOptions: () => NativeFloatingOptions) {
  const initialConfig = untrack(() => readOptions().getConfig(() => false));
  let domReference = $state.raw<Element | null>(null);
  let positionReference = $state.raw<Reference | null>(null);
  let floating = $state.raw<HTMLElement | null>(null);
  let data = $state.raw<PositioningResult>({
    x: 0, y: 0, placement: initialConfig.placement ?? 'bottom', strategy: initialConfig.strategy ?? 'absolute',
    middlewareData: {}, isPositioned: false,
  });
  let error = $state.raw<unknown>(null);
  let generation = 0;
  let request = 0;
  let updateCurrent: (() => Promise<void>) | undefined;
  const options = $derived(readOptions());
  const reference = $derived(positionReference ?? domReference);

  $effect(() => {
    const currentOptions = options;
    const currentReference = reference;
    const currentFloating = floating;
    const lifetime = ++generation;
    data = { ...untrack(() => data), isPositioned: false };
    updateCurrent = undefined;
    if (!currentOptions.mounted || !currentReference || !currentFloating) return;

    const update = async () => {
      const revision = ++request;
      const isCurrent = (node: HTMLElement) =>
        lifetime === generation && revision === request && node === currentFloating && node.isConnected;
      try {
        const config = currentOptions.getConfig(isCurrent);
        // Omit platform: DOM 1.8.0 owns the default browser geometry implementation.
        const computed = await computePosition(currentReference, currentFloating, config);
        if (!isCurrent(currentFloating)) return;
        data = { ...computed, isPositioned: currentOptions.open };
        error = null;
      } catch (cause) {
        if (isCurrent(currentFloating)) error = cause;
      }
    };
    updateCurrent = update;
    const cleanup = currentOptions.whileElementsMounted(currentReference, currentFloating, () => { void update(); });
    return () => {
      ++generation;
      ++request;
      updateCurrent = undefined;
      cleanup();
    };
  });

  // The DOM adapter's source output contract, expressed through native Svelte derivation.
  const floatingStyles = $derived.by(() => {
    const node = floating;
    const dpr = node?.ownerDocument.defaultView?.devicePixelRatio || 1;
    const x = Math.round(data.x * dpr) / dpr;
    const y = Math.round(data.y * dpr) / dpr;
    if (options.transform === false) return { position: data.strategy, left: `${x}px`, top: `${y}px` };
    return {
      position: data.strategy, left: '0px', top: '0px',
      transform: `translate(${x}px, ${y}px)`,
      willChange: dpr >= 1.5 ? 'transform' : '',
    };
  });

  const refs = {
    setReference(node: Element | null) { domReference = node; },
    setPositionReference(node: Reference | null) {
      positionReference = isElement(node) ? {
        getBoundingClientRect: () => node.getBoundingClientRect(),
        getClientRects: () => node.getClientRects(),
        contextElement: node,
      } satisfies VirtualElement : node;
    },
    setFloating(node: HTMLElement | null) { floating = node; },
  };

  return {
    get elements() { return { domReference, reference, floating }; },
    get data() { return data; },
    get error() { return error; },
    get floatingStyles() { return floatingStyles; },
    refs,
    update() { return updateCurrent?.() ?? Promise.resolve(); },
  };
}
