// Source port: Base UI 1.8.0 useAnchorPositioning.ts at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/anchor-positioning/UPSTREAM_LICENSE. Native Svelte replaces React hook/renderer machinery.
import { getAlignment, getSide } from '@floating-ui/utils';
import { useDirection } from '../../direction-provider/context.js';
import { autoUpdate, createPositioningPolicy, getAutoUpdateOptions, getLogicalSide } from './policy.js';
import { useFloating } from './useFloating.svelte.js';
import type { AnchorPositioningOptions, Reference } from './types.js';

/** Source anchor orchestration; inline/adaptive/lazy-flip and root interaction stores remain missing. */
export function useAnchorPositioning(readOptions: () => AnchorPositioningOptions) {
  const direction = useDirection();
  const options = $derived({ ...readOptions(), direction: direction() });
  let arrow = $state.raw<HTMLElement | null>(null);
  let registeredPositionReference: Reference | null = null;

  const position = useFloating(() => {
    const currentOptions = options;
    const currentArrow = arrow;
    return {
      open: currentOptions.open,
      mounted: currentOptions.mounted,
      transform: currentOptions.transform,
      getConfig: (isCurrent: (node: HTMLElement) => boolean) =>
        createPositioningPolicy(currentOptions, () => currentArrow, isCurrent),
      whileElementsMounted: (reference: Reference, floating: HTMLElement, update: () => void) =>
        autoUpdate(reference, floating, update, getAutoUpdateOptions(floating, currentOptions.disableAnchorTracking)),
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

  // Fixed zero output prevents initial autofocus scrolling and ignores retained closed coordinates.
  // Property-level writes preserve the available-size values owned by source size() middleware.
  $effect(() => {
    const node = position.elements.floating;
    const isPositioned = position.data.isPositioned && options.open && options.mounted;
    if (!node) return;
    const styles = position.floatingStyles;
    node.style.position = isPositioned ? options.positionMethod ?? 'absolute' : 'fixed';
    node.style.top = isPositioned ? styles.top : '0px';
    node.style.left = isPositioned ? styles.left : '0px';
    node.style.transform = isPositioned ? styles.transform ?? '' : '';
    node.style.willChange = isPositioned ? styles.willChange ?? '' : '';
    node.style.opacity = isPositioned ? '' : '0';
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
    get error() { return position.error; },
    get side() { return getLogicalSide(options.side ?? 'bottom', getSide(position.data.placement), options.direction === 'rtl'); },
    get physicalSide() { return getSide(position.data.placement); },
    get align() { return getAlignment(position.data.placement) || 'center'; },
    get isPositioned() { return position.data.isPositioned && options.open && options.mounted; },
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
