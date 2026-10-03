// Source port: Base UI 1.8.0 useAnchorPositioning.ts at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/anchor-positioning/UPSTREAM_LICENSE. Native Svelte replaces React hook/renderer machinery.
import { getAlignment, getSide } from '@floating-ui/utils';
import { useDirection } from '../../direction-provider/context.js';
import { autoUpdate, createPositioningPolicy, getAutoUpdateOptions, getLogicalSide, getPhysicalSide } from './policy.js';
import { DEFAULT_SIDES } from './adaptive-origin.js';
import { useFloating } from './useFloating.svelte.js';
import type { AnchorPositioningOptions, Reference } from './types.js';

/** Source anchor orchestration; popup root interaction stores remain a separate dependency. */
export function useAnchorPositioning(readOptions: () => AnchorPositioningOptions) {
  const direction = useDirection();
  const options = $derived({ ...readOptions(), direction: direction() });
  let arrow = $state.raw<HTMLElement | null>(null);
  let mountSide = $state<ReturnType<typeof getSide> | null>(null);
  let registeredPositionReference: Reference | null = null;

  const position = useFloating(() => {
    const currentOptions = options;
    const currentArrow = arrow;
    const currentMountSide = mountSide;
    return {
      open: currentOptions.keepMounted ? currentOptions.mounted : undefined,
      mounted: currentOptions.mounted,
      transform: currentOptions.transform,
      getConfig: (isCurrent: (node: HTMLElement) => boolean) =>
        createPositioningPolicy(currentOptions, () => currentArrow, isCurrent, currentMountSide),
      whileElementsMounted: (reference: Reference, floating: HTMLElement, update: () => void) =>
        autoUpdate(reference, floating, update, getAutoUpdateOptions(currentOptions.disableAnchorTracking)),
    };
  });

  // The source's resolved external anchor registration, with native reactive host ownership.
  $effect(() => {
    if (!options.mounted) return;
    const anchorValue = options.anchor;
    const resolvedAnchor = typeof anchorValue === 'function' ? anchorValue() : anchorValue;
    const unwrappedElement = isRef(resolvedAnchor) ? resolvedAnchor.current : resolvedAnchor;
    const finalAnchor = unwrappedElement || null;
    if (finalAnchor !== registeredPositionReference) {
      position.refs.setPositionReference(finalAnchor);
      registeredPositionReference = finalAnchor;
    }
  });

  const positionerStyles = $derived.by(() => {
    const isPositioned = position.data.isPositioned;
    if (!isPositioned) return { position: 'fixed', top: '0px', left: '0px', opacity: '0' };
    const { sideX, sideY } = position.data.middlewareData.adaptiveOrigin || DEFAULT_SIDES;
    const resolvedPosition = options.positionMethod ?? 'absolute';
    if (options.adaptiveOrigin) {
      return { position: resolvedPosition, [sideX]: `${position.data.x}px`, [sideY]: `${position.data.y}px` };
    }
    return { ...position.floatingStyles, position: resolvedPosition };
  });

  // Fixed zero output prevents initial autofocus scrolling and ignores retained closed coordinates.
  // Property-level writes preserve the available-size values owned by source size() middleware.
  $effect(() => {
    const node = position.elements.floating;
    if (!node) return;
    const styles = positionerStyles as Record<string, string>;
    for (const property of ['position', 'top', 'left', 'right', 'bottom', 'transform', 'willChange', 'opacity'] as const) {
      node.style[property] = styles[property] ?? '';
    }
  });

  // Source lazy flip locks the preferred side only after a collision changes it.
  // It resets on logical unmount, independently of retained keepMounted hosts.
  $effect(() => {
    if (!options.mounted) { mountSide = null; return; }
    const renderedSide = getSide(position.data.placement);
    const side = mountSide || getPhysicalSide(options.side ?? 'bottom', options.direction === 'rtl');
    if (options.lazyFlip && position.data.isPositioned && renderedSide !== side) mountSide = renderedSide;
  });

  $effect(() => {
    if (!arrow) return;
    arrow.style.position = 'absolute';
    const middlewareData = position.data.middlewareData;
    arrow.style.top = middlewareData.arrow?.y === undefined ? '' : `${middlewareData.arrow.y}px`;
    arrow.style.left = middlewareData.arrow?.x === undefined ? '' : `${middlewareData.arrow.x}px`;
  });

  return {
    get elements() { return { ...position.elements, arrow }; },
    get result() { return position.data; },
    get positionerStyles() { return positionerStyles; },
    get error() { return position.error; },
    get side() { return getLogicalSide(options.side ?? 'bottom', getSide(position.data.placement), options.direction === 'rtl'); },
    get physicalSide() { return getSide(position.data.placement); },
    get align() { return getAlignment(position.data.placement) || 'center'; },
    get isPositioned() { return position.data.isPositioned; },
    get anchorHidden() { return Boolean(position.data.middlewareData.hide?.referenceHidden); },
    get arrowUncentered() { return position.data.middlewareData.arrow?.centerOffset !== 0; },
    ...position.refs,
    setArrow(node: HTMLElement | null) { arrow = node; },
    update: position.update,
  };
}

function isRef(value: AnchorPositioningOptions['anchor']): value is { current: Reference | null } {
  return value != null && 'current' in value;
}
