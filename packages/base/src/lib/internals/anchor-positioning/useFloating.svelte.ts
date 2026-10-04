// Native Svelte replacement of the @floating-ui/react-dom renderer boundary.
// Source: Base UI 1.8.0 useFloating.ts, MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
// Floating UI 2.1.9 useFloating/getDPR/roundByDPR, MIT: parity/anchor-positioning/FLOATING_UI_LICENSE.
import { computePosition, type ComputePositionConfig, type VirtualElement } from '@floating-ui/dom';
import { isElement } from '@floating-ui/utils/dom';
import { untrack } from 'svelte';
import type { PositioningResult, Reference } from './types.js';

export interface NativeFloatingOptions {
  open?: boolean;
  mounted: boolean;
  transform?: boolean;
  /** The Source store bridge supplies its actual selected elements to the DOM driver. */
  elements?: { reference: Reference | null; floating: HTMLElement | null };
  /** Middleware writes must obey the same lifetime/request ownership as coordinates. */
  getConfig: (isCurrent: (node: HTMLElement) => boolean) => ComputePositionConfig;
  whileElementsMounted: (reference: Reference, floating: HTMLElement, update: () => void) => () => void;
}

/** One DOM geometry driver; Source root-store/tree composition delegates through useBaseUIFloating. */
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
  let measuredReference: Reference | null = null;
  let measuredFloating: HTMLElement | null = null;
  const options = $derived(readOptions());
  const reference = $derived(options.elements?.reference || positionReference || domReference);
  const floatingElement = $derived(options.elements?.floating || floating);
  const referenceRef = { current: null as Reference | null };
  const floatingRef = { current: null as HTMLElement | null };
  $effect(() => { if (reference) referenceRef.current = reference; if (floatingElement) floatingRef.current = floatingElement; });

  $effect(() => {
    const currentOptions = options;
    const currentReference = reference;
    const currentFloating = floatingElement;
    const lifetime = ++generation;
    updateCurrent = undefined;
    if (!currentOptions.mounted || !currentReference || !currentFloating) {
      data = { ...untrack(() => data), isPositioned: false };
      measuredReference = null;
      measuredFloating = null;
      return;
    }
    // Retain positioned output while options change on the same present hosts.
    // In particular, logical closing must not move a mounted exit transition.
    if (currentReference !== measuredReference || currentFloating !== measuredFloating) {
      data = { ...untrack(() => data), isPositioned: false };
      measuredReference = currentReference;
      measuredFloating = currentFloating;
    }

    const update = async () => {
      const revision = ++request;
      const isCurrent = (node: HTMLElement) =>
        lifetime === generation && revision === request && node === currentFloating && node.isConnected;
      try {
        const config = currentOptions.getConfig(isCurrent);
        // Omit platform: DOM 1.8.0 owns the default browser geometry implementation.
        const computed = await computePosition(currentReference, currentFloating, config);
        if (!isCurrent(currentFloating)) return;
        data = { ...computed, isPositioned: currentOptions.open !== false };
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
    const node = floatingElement;
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
    reference: referenceRef, floating: floatingRef,
    setReference(node: Reference | null) {
      if (node !== referenceRef.current) { referenceRef.current = node; positionReference = node; }
      if (isElement(node) || node === null) domReference = node;
    },
    setPositionReference(node: Reference | null) {
      const computedReference = isElement(node) ? {
        getBoundingClientRect: () => node.getBoundingClientRect(),
        getClientRects: () => node.getClientRects(),
        contextElement: node,
      } satisfies VirtualElement : node;
      referenceRef.current = computedReference;
      positionReference = computedReference;
    },
    setFloating(node: HTMLElement | null) { floatingRef.current = node; floating = node; },
  };

  return {
    get elements() { return { domReference, reference, floating: floatingElement }; },
    get data() { return data; },
    get error() { return error; },
    get floatingStyles() { return floatingStyles; },
    refs,
    update() { return updateCurrent?.() ?? Promise.resolve(); },
  };
}
