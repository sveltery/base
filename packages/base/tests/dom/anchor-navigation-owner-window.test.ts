// Supplemental Source fidelity reproducer, not unchanged upstream assertion credit.
// Base UI 1.8.0 pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Middleware, MiddlewareState, SizeOptions } from '@floating-ui/dom';
import { adaptiveOrigin as nativeAdaptiveOrigin } from '../../src/lib/internals/anchor-positioning/adaptive-origin.js';
import { createPositioningPolicy } from '../../src/lib/internals/anchor-positioning/policy.js';
import { adaptiveOrigin as originalAdaptiveOrigin } from './fixtures/anchor-owner-window/adaptiveOriginMiddleware.js';
import { originalSizeMiddleware } from './fixtures/anchor-owner-window/useAnchorPositioningSize.js';
import { ownerWindow } from './fixtures/anchor-owner-window/owner.js';

const referenceRect = { x: 10.25, y: 20.25, width: 30.5, height: 40.5 };
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function host(detachedDocument: boolean) {
  const doc = detachedDocument
    ? document.implementation.createHTMLDocument('positioning')
    : document;
  const floating = doc.createElement('div');
  floating.style.transitionDuration = '0.2s';
  doc.body.append(floating);
  return floating;
}

function middlewareState(floating: HTMLElement): MiddlewareState {
  const offsetParent = document.createElement('section');
  // A meaningful platform branch exercises the complete adaptive-origin algorithm.
  // The platform is a geometry harness; the middleware's actual business body runs.
  return {
    x: 17,
    y: 23,
    strategy: 'absolute',
    placement: 'left',
    initialPlacement: 'left',
    middlewareData: {},
    rects: { reference: referenceRect, floating: { x: 0, y: 0, width: 50, height: 60 } },
    elements: { reference: floating.ownerDocument.createElement('button'), floating },
    platform: {
      getOffsetParent: async () => offsetParent,
      isElement: (node: unknown) => node === offsetParent,
      getDimensions: async () => ({ width: 400, height: 300 }),
    } as unknown as MiddlewareState['platform'],
  };
}

function sizeApply(middleware: Middleware) {
  // Floating UI retains the actual options; this invokes the complete Source apply
  // callback, with available space supplied at its documented middleware boundary.
  const options = middleware.options as SizeOptions;
  if (!options.apply) throw new Error('Actual size middleware apply callback missing');
  return options.apply;
}

for (const original of [true, false]) {
  describe(`${original ? 'Original exact pin' : 'native actual'} NavigationMenu anchor ownerWindow closure`, () => {
    for (const detachedDocument of [false, true]) {
      const label = detachedDocument
        ? 'createHTMLDocument defaultView null'
        : 'ordinary document control';
      it(`adaptiveOrigin runs the complete transitioned left-side branch with ${label}`, async () => {
        const floating = host(detachedDocument);
        try {
          expect(floating.ownerDocument.defaultView).toBe(detachedDocument ? null : window);
          expect(ownerWindow(floating)).toBe(window);
          const middleware = original ? originalAdaptiveOrigin : nativeAdaptiveOrigin;
          await expect(middleware.fn(middlewareState(floating))).resolves.toEqual({
            x: 333,
            y: 23,
            data: { sideX: 'right', sideY: 'top' },
          });
        } finally {
          floating.remove();
        }
      });

      it(`size apply writes available space and fractional DPR-snapped anchor dimensions with ${label}`, async () => {
        vi.stubGlobal('devicePixelRatio', 2);
        const floating = host(detachedDocument);
        const mountedRef = { current: true };
        try {
          const middleware = original
            ? originalSizeMiddleware(mountedRef, { padding: 5 })
            : createPositioningPolicy(
                { open: true, mounted: true, collisionAvoidance: {} },
                () => null,
                (node) => mountedRef.current && node === floating,
              ).middleware.find((item) => item.name === 'size')!;
          await sizeApply(middleware)({
            ...middlewareState(floating),
            availableWidth: 321.5,
            availableHeight: 234.5,
          });
          expect(floating.style.getPropertyValue('--available-width')).toBe('321.5px');
          expect(floating.style.getPropertyValue('--available-height')).toBe('234.5px');
          expect(floating.style.getPropertyValue('--anchor-width')).toBe('30.5px');
          expect(floating.style.getPropertyValue('--anchor-height')).toBe('40.5px');
        } finally {
          floating.remove();
        }
      });
    }

    it('invalidated mounted/current owner returns before any style writes or null-window access', async () => {
      const floating = host(true);
      const mountedRef = { current: false };
      try {
        const middleware = original
          ? originalSizeMiddleware(mountedRef, { padding: 5 })
          : createPositioningPolicy(
              { open: false, mounted: false, collisionAvoidance: {} },
              () => null,
              () => mountedRef.current,
            ).middleware.find((item) => item.name === 'size')!;
        const write = vi.spyOn(floating.style, 'setProperty');
        await sizeApply(middleware)({
          ...middlewareState(floating),
          availableWidth: 321.5,
          availableHeight: 234.5,
        });
        expect(write).not.toHaveBeenCalled();
      } finally {
        floating.remove();
      }
    });
  });
}
