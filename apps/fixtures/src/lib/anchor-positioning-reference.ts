// Actual installed Base UI 1.8.0 reference, corresponding to immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// Fixture-only React/private-source imports; MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
import { createElement as h, StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
// Keep public provider and private hook in the same module graph. Mixing a Vite-optimized
// public entry with a direct private entry creates two independent DirectionContext objects.
import { DirectionProvider } from '../../node_modules/@base-ui/react/direction-provider/DirectionProvider.mjs';
import { useAnchorPositioningWithHook } from '../../node_modules/@base-ui/react/internals/useAnchorPositioning.mjs';
import { useFloating } from '../../node_modules/@base-ui/react/floating-ui-react/hooks/useFloating.mjs';
import type { UseFloatingOptions } from '../../node_modules/@base-ui/react/floating-ui-react/types.mjs';

function usePositionWithOutput(options: UseFloatingOptions) {
  return useFloating({ ...options, transform: false });
}

function Probe({ scenario, open, domDirection, sideOffset, replacement, wide, realArrow }: {
  scenario: string; open: boolean; domDirection: 'ltr' | 'rtl'; sideOffset: number;
  replacement: boolean; wide: boolean; realArrow: boolean;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const positioning = useAnchorPositioningWithHook({
    anchor: scenario === 'virtual' ? () => anchor.current ? {
      contextElement: anchor.current,
      getBoundingClientRect: () => anchor.current!.getBoundingClientRect(),
    } : null : undefined,
    mounted: open, keepMounted: true,
    side: scenario === 'logical' ? 'inline-start' : 'bottom',
    align: ['start', 'rtl', 'mismatch'].includes(scenario) ? 'start' : 'center',
    sideOffset: scenario === 'function' ? data => data.anchor.height / 2 + sideOffset : sideOffset,
    collisionBoundary: 'clipping-ancestors',
    collisionAvoidance: { fallbackAxisSide: 'none' },
    disableAnchorTracking: scenario === 'disabled',
    shift: scenario === 'layout' ? { rootBoundary: 'layoutViewport' } : scenario === 'cross-axis' ? { rootBoundary: 'layoutViewport', crossAxis: true } : undefined,
  }, scenario === 'top-left' ? usePositionWithOutput : useFloating);
  // Real anchored roots register their host in the Floating store. A lone external ref
  // does not exercise that default reference path or the source setReference replacement body.
  const setReference = useCallback((node: HTMLButtonElement | null) => {
    anchor.current = node;
    positioning.refs.setReference(node);
  }, [positioning.refs.setReference]);
  return h('div', { className: 'board', 'data-testid': 'board' }, h('div', { className: 'stage' },
    h('button', { ref: setReference, key: String(replacement), className: `anchor${replacement ? ' replacement' : ''}${scenario === 'collision' ? ' collision' : ''}`, style: { width: wide ? '110px' : '80px' }, 'data-testid': 'anchor' }, 'Anchor'),
    h('div', { className: 'floating', dir: domDirection, 'data-testid': 'floating', 'data-closed': !open,
      'data-positioned': positioning.isPositioned, 'data-side': positioning.side, 'data-align': positioning.align,
      'data-hidden': positioning.anchorHidden, 'data-arrow-uncentered': positioning.arrowUncentered,
      ref: positioning.refs.setFloating, style: positioning.positionerStyles },
    realArrow ? h('div', { className: 'arrow', 'data-testid': 'arrow', ref: positioning.arrowRef, style: positioning.arrowStyles }) : null, 'Private foundation')));
}

function Fixture({ scenario }: { scenario: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(scenario !== 'closed');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(scenario === 'logical' ? 'rtl' : 'ltr');
  const [domDirection, setDomDirection] = useState<'ltr' | 'rtl'>(scenario === 'rtl' || scenario === 'mismatch' ? 'rtl' : 'ltr');
  const [sideOffset, setSideOffset] = useState(0);
  const [replacement, setReplacement] = useState(false);
  const [wide, setWide] = useState(false);
  const [shown, setShown] = useState(true);
  const [realArrow, setRealArrow] = useState(scenario === 'arrow');
  useEffect(() => { setHydrated(true); }, []);
  const button = (label: string, action: () => void) => h('button', { onClick: action, key: label }, label);
  return h('main', { className: 'anchor-positioning', 'data-hydrated': hydrated },
    button('Toggle open', () => setOpen(value => !value)),
    button('Set offset', () => setSideOffset(12)),
    button('Toggle provider direction', () => setDirection(value => value === 'ltr' ? 'rtl' : 'ltr')),
    button('Toggle DOM direction', () => setDomDirection(value => value === 'ltr' ? 'rtl' : 'ltr')),
    button('Replace anchor', () => setReplacement(value => !value)),
    button('Resize anchor', () => setWide(value => !value)),
    button('Toggle arrow', () => setRealArrow(value => !value)),
    button('Toggle foundation', () => setShown(value => !value)),
    h(DirectionProvider, { direction }, shown ? h(Probe, { scenario, open, domDirection, sideOffset, replacement, wide, realArrow }) : null));
}

export function mountAnchorPositioningReference(node: HTMLElement, scenario: string) {
  // Supplemental fixtures use the source helper's default strict setting.
  const root = createRoot(node); root.render(h(StrictMode, null, h(Fixture, { scenario })));
  return () => root.unmount();
}
