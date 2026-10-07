# ScrollArea

A custom scrollbar around a scrollable viewport. Upstream: `packages/react/src/scroll-area` at Base UI v1.8.0 (`47b40521`). Local: `src/lib/scroll-area/`.

## Sub-features

- `ScrollArea.Root` renders a `<div role="presentation">` and injects the `base-ui-disable-scrollbar` style element. `ScrollArea.Viewport` is the scrollable `<div>`. It is `tabindex="0"` when either axis overflows and `tabindex="-1"` when the content fits. `ScrollArea.Content` wraps children with `min-width: fit-content`.
- `ScrollArea.Scrollbar` is `aria-hidden` and `data-orientation`. It unmounts when that axis does not overflow unless `keepMounted` is set. `ScrollArea.Thumb` is the draggable indicator. `ScrollArea.Corner` renders only when both axes overflow.
- Overflow sets `data-has-overflow-x`, `data-has-overflow-y`, and the `data-overflow-*-start` / `end` edges. `overflowEdgeThreshold` delays those edge attributes. The viewport publishes `--scroll-area-overflow-*` lengths. Thumb length is `--scroll-area-thumb-height` or `--scroll-area-thumb-width`, floored at 16px, and shrinks on overscroll.
- A user scroll (pointer, wheel, key, or touch modality) sets `data-scrolling` for 500ms. A programmatic `scrollTop` / `scrollLeft` does not, until the user has interacted. Dragging a thumb or pressing the track scrolls the viewport and sets `scroll-snap-type: none` until release. Wheel events on the scrollbar scroll that axis and chain to the page at the edges. `preventDefault()` on a consumer pointer handler skips the part handler.
- Parts throw if they are outside Root, Viewport, or Scrollbar. A `render` snippet receives `(props, state, children)`.

Differences from React Base UI, all deliberate:

- No `ref`. The host is `bind:this` on the default element, and `{@attach}` when `render` spreads `props`.
- No `className` or style objects. Use `class` and `style` strings.
- No `preventBaseUIHandler()`. `preventDefault()` skips the part handler.
- Direction is `useDirection().direction`. Outside a provider it is `ltr`. The root can still set CSS `direction` for the browser's own scroll origin.
- The scrollbar-hiding `<style>` element receives the CSP `nonce`. It is omitted when `disableStyleElements` is true. Outside a provider the element is rendered and has no nonce.

## How to get to it (user POV)

A consumer imports `ScrollArea` from `@sveltery/base` or `@sveltery/base/scroll-area`. For verification, open `/fixtures/scroll-area?case=<case>`, where `<case>` is `both`, `none`, or `rtl` (`src/routes/fixtures/scroll-area/cases.ts`). Add `&reference` for React Base UI. The `rtl` case sets CSS `direction: rtl` on the root and wraps `DirectionProvider`.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh scroll-area
```

Handles used by `src/routes/fixtures/scroll-area/scroll-area.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Root: `getByTestId('root')`.
- Viewport: `getByTestId('viewport')`.
- Vertical scrollbar: `getByTestId('scrollbar-y')`.
- Corner: `getByTestId('corner')`.

Proof of working order: in both frameworks, overflowing content sets both overflow attributes, shows the vertical scrollbar and corner, and makes the viewport tabbable. Content that fits removes those attributes, unmounts the scrollbar and corner, and sets `tabindex="-1"`. RTL at scroll offset 0 sets `data-overflow-x-end` and not `data-overflow-x-start`. The SSR test checks that the server HTML contains the viewport id and `tabindex="-1"` before measurement, and does not contain `data-has-overflow-y`.

## Gotchas

- Scrollbars stay unmounted until the viewport measures overflow, so the server HTML does not include them.
- `data-scrolling` requires a user interaction before the scroll event, except in touch modality.
- A zero-size corner is still in the document when both axes overflow. Visibility depends on the scrollbar boxes.

## Not ported

- React `ref` and `className` / `style` state callbacks.
- Select, Slider, and Tabs do not render the upstream inline style or prehydration script tags, so they do not read the CSP provider.
