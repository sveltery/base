# Avatar

A profile image with a fallback. Upstream: `packages/react/src/avatar` (Root, Image, Fallback, `useImageLoadingStatus`) at Base UI v1.8.0. Local: `src/lib/avatar/`.

## Sub-features

- `Avatar.Root` renders a `<span>` and shares `imageLoadingStatus` with its parts. The status is not copied to a `data-*` attribute.
- `Avatar.Image` renders an `<img>`. Without `keepMounted`, a detached `Image` probes `src` / `srcset` and the element mounts only after the probe reports `loaded`. With `keepMounted`, the `<img>` stays mounted and status is read from that element (`complete` / `naturalWidth`, plus `load` and `error`).
- Probe order: handlers, referrer policy, cross origin, sizes, srcset, then src. A cached probe resolves in that same turn. `idle` is not passed to `onLoadingStatusChange`. Removing the image sets the root back to `idle`.
- `Avatar.Fallback` renders a `<span>` while the image is not `loaded`. `delay` (milliseconds, default `0`) waits before the first show. After it has been shown, raising `delay` does not hide it.
- `keepMounted` adds `data-loading`, `data-error` and `aria-hidden` until the image has loaded. An explicit `aria-hidden` from the caller wins.
- Native rendering: `render` receives `(props, state)`. Consumer `{@attach}` reaches the host through the props spread. `src` is applied after `loading`, `sizes` and `srcset`.

Differences from React Base UI, all deliberate:

- No `ref`. Use `{@attach}`.
- No `class` or `style` callbacks of state. Pass a string `class` and a string `style`.
- No enter/exit transitions (`data-starting-style`, `data-ending-style`) and no wait for CSS animations before unmounting. A probe that is not `loaded` removes the `<img>` immediately.
- No `preventBaseUIHandler()`. A consumer `onload` / `onerror` runs first. `event.preventDefault()` skips the status update when the event is cancelable. Browser `load` and `error` events are not cancelable; the paired fixture dispatches a cancelable `error` for that case.
- React prop names `srcSet`, `crossOrigin`, `referrerPolicy`, `onLoad` and `onError` are the native `srcset`, `crossorigin`, `referrerpolicy`, `onload` and `onerror`.

Preserved upstream behavior: unmounting one `Avatar.Image` sets the root status to `idle` even if another image in the same root is still loaded, so the fallback renders again. See the GitHub issue filed with this port.

## How to get to it (user POV)

A consumer imports `Avatar` from `@sveltery/base` or `@sveltery/base/avatar` and renders `<Avatar.Root><Avatar.Image src={url} alt="" /><Avatar.Fallback>JD</Avatar.Fallback></Avatar.Root>`. For verification, open `/fixtures/avatar?case=<case>`, where `<case>` is one of `loaded`, `error`, `delay`, `keep` or `prevented` (`src/routes/fixtures/avatar/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh avatar
```

Handles used by `src/routes/fixtures/avatar/avatar.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Image: `#tested-image`, accessible name `Jane Doe` once it is loaded and not `aria-hidden`
- Fallback: `#tested-fallback`, text `JD`
- Callback log: `getByTestId('calls')`, a JSON list of loading statuses

`loaded` and `keep` use a cached data URI. `error` and `delay` use `/missing-avatar.png`. `prevented` uses `/hung-avatar.png`, which the test leaves unanswered, then dispatches a cancelable `error`. `delay` is 1000ms. SSR checks the server HTML: the default case has the fallback and no `<img>`; `keep` has the image, `aria-hidden="true"` and the fallback.

## Gotchas

- Assert after `data-hydrated="true"`. The loading effect runs before that flag, but a cached image is not in the server HTML.
- The `delay` assertion that the fallback is absent must run before the 1000ms timer. Playwright retries a failing `toHaveCount(0)`, so a late start fails the test instead of passing early.
- `load` / `error` from the browser cannot be cancelled. The skip check only sees `defaultPrevented` on a cancelable event.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
