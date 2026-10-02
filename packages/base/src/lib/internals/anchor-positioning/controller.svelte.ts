// Private native Svelte lifecycle adapter for the pinned Base UI anchor policy.
// MIT derivations: parity/anchor-positioning/{UPSTREAM_LICENSE,FLOATING_UI_LICENSE}.
import { computePosition, type VirtualElement } from '@floating-ui/dom';
import { getAlignment, getSide } from '@floating-ui/utils';
import { untrack } from 'svelte';
import { autoUpdate, createPositioningPolicy, getAutoUpdateOptions, getLogicalSide } from './policy.js';
import type { AnchorPositioningOptions, PositioningResult, Reference } from './types.js';

function isElement(value: Reference | null): value is Element {
  return value != null && 'nodeType' in value && value.nodeType === 1;
}

function resolveAnchor(value: AnchorPositioningOptions['anchor']): Reference | null {
  const resolved = typeof value === 'function' ? value() : value;
  return resolved && 'current' in resolved ? resolved.current : resolved ?? null;
}

/** Call during component initialization. No interaction tree or custom geometry platform. */
export function createAnchorPositioning(readOptions: () => AnchorPositioningOptions) {
  let domReference = $state.raw<Element | null>(null);
  let positionReference = $state.raw<Reference | null>(null);
  let floating = $state.raw<HTMLElement | null>(null);
  let arrow = $state.raw<HTMLElement | null>(null);
  let result = $state.raw<PositioningResult>({ x: 0, y: 0, placement: 'bottom', strategy: 'absolute', middlewareData: {}, isPositioned: false });
  let error = $state.raw<unknown>(null);
  let epoch = 0;
  let request = 0;
  let updateCurrent: (() => Promise<void>) | undefined;
  const options = $derived(readOptions());
  const reference = $derived(options.anchor !== undefined ? resolveAnchor(options.anchor) ?? domReference : positionReference ?? domReference);

  $effect(() => {
    const currentOptions = options;
    const currentReference = reference;
    const currentFloating = floating;
    const currentArrow = arrow;
    const generation = ++epoch;
    result = { ...untrack(() => result), isPositioned: false };
    updateCurrent = undefined;
    if (!currentOptions.mounted || !currentReference || !currentFloating) return;
    const isCurrent = (node: HTMLElement) => generation === epoch && node === currentFloating && node.isConnected;
    const update = async () => {
      const revision = ++request;
      try {
        const policy = createPositioningPolicy(currentOptions, () => currentArrow, node => isCurrent(node) && revision === request);
        // Deliberately omit platform: DOM 1.8.0 supplies the audited default DOM platform.
        const computed = await computePosition(currentReference, currentFloating, policy);
        if (!isCurrent(currentFloating) || revision !== request) return;
        result = { ...computed, isPositioned: currentOptions.open };
        error = null;
      } catch (cause) {
        if (isCurrent(currentFloating) && revision === request) error = cause;
      }
    };
    updateCurrent = update;
    const cleanup = autoUpdate(currentReference, currentFloating, () => { void update(); }, getAutoUpdateOptions(currentFloating, currentOptions.disableAnchorTracking));
    return () => { ++epoch; ++request; updateCurrent = undefined; cleanup(); };
  });

  $effect(() => {
    const node = floating;
    const positioned = result.isPositioned && options.open && options.mounted;
    const transform = options.transform !== false;
    if (!node) return;
    const dpr = node.ownerDocument.defaultView?.devicePixelRatio || 1;
    const x = Math.round(result.x * dpr) / dpr;
    const y = Math.round(result.y * dpr) / dpr;
    node.style.position = positioned ? options.positionMethod ?? 'absolute' : 'fixed';
    node.style.left = positioned && !transform ? `${x}px` : '0px';
    node.style.top = positioned && !transform ? `${y}px` : '0px';
    node.style.transform = positioned && transform ? `translate(${x}px, ${y}px)` : '';
    node.style.willChange = positioned && transform && dpr >= 1.5 ? 'transform' : '';
    node.style.opacity = positioned ? '' : '0';
  });

  $effect(() => {
    if (!arrow) return;
    arrow.style.position = 'absolute';
    arrow.style.top = result.middlewareData.arrow?.y === undefined ? '' : `${result.middlewareData.arrow.y}px`;
    arrow.style.left = result.middlewareData.arrow?.x === undefined ? '' : `${result.middlewareData.arrow.x}px`;
  });

  return {
    get elements() { return { domReference, reference, floating, arrow }; },
    get result() { return result; },
    get error() { return error; },
    get side() { return getLogicalSide(options.side ?? 'bottom', getSide(result.placement), options.direction === 'rtl'); },
    get physicalSide() { return getSide(result.placement); },
    get align() { return getAlignment(result.placement) ?? 'center'; },
    get isPositioned() { return result.isPositioned && options.open && options.mounted; },
    get anchorHidden() { return Boolean(result.middlewareData.hide?.referenceHidden); },
    get arrowUncentered() { return result.middlewareData.arrow?.centerOffset !== 0; },
    setReference(node: Element | null) { domReference = node; },
    setPositionReference(node: Reference | null) {
      positionReference = isElement(node) ? {
        getBoundingClientRect: () => node.getBoundingClientRect(),
        getClientRects: () => node.getClientRects(),
        contextElement: node,
      } satisfies VirtualElement : node;
    },
    setFloating(node: HTMLElement | null) { floating = node; },
    setArrow(node: HTMLElement | null) { arrow = node; },
    update() { return updateCurrent?.() ?? Promise.resolve(); },
  };
}

export type AnchorPositioningController = ReturnType<typeof createAnchorPositioning>;
