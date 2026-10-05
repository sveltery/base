# @sveltery/utils

The native-framework successor replaces React hook transport with `Controlled` and direct Svelte effects/live closures. Exact-head source review and execution gates remain pending; this is a proposed semantic change stacked on the package extraction.

Experimental shared utilities for the unofficial Svelte 5 port of Base UI 1.8.0. This private `0.0.0` package is not ready for npm publication.

Base imports the implemented helper subpaths from this package. There is no root export. `@sveltery/utils/store` exports `Store`, `ReadonlyStore` and the native `SvelteStore`; `@sveltery/utils/platform` exports the existing platform namespace. Other exports are explicit implemented helper subpaths listed in `package.json`.

Plain utilities ship ESM and adjacent declarations. Rune utilities retain native `.svelte.js` source and declarations for compilation by a Svelte 5.57.1+ consumer. Both packages use the official `@sveltejs/package` packager. Utils has no Base, React or SvelteKit runtime dependency.

`@sveltery/utils/Controlled` exports the reusable rune state owner. Construct it with a live controlled-value getter and the initial default; read `.value` and call `.set(next)` with a direct value. Initial controlled mode stays fixed. A disappearing controlled value falls back to the initial default. Uncontrolled writes are immediate, including function values; business updater functions execute at their call site. The minimal generic uses `defaultValue: T`, `.value: T` and `.set(next: T)`; optional state includes `undefined` in `T`. Svelte supports its private rune field’s first constructor assignment, preserving defined-default types without assertions or overloads.

`@sveltery/utils/PreviousValue` exports `PreviousValue`, the retained current/previous pair with Source's `Object.is` comparison. Read its `.value` getter. `@sveltery/utils/useMergedRefs` exports `MergedRefs`; one instance owns the shared ref fan-out and cleanup business, with `.merge(...)` and `.mergeN(refs)` methods. The existing `useTimeout` and `useAnimationFrame` subpaths export their `Timeout` and `AnimationFrame` classes; component owners construct them directly and register `onDestroy(instance.clear)` or `onDestroy(instance.cancel)`. The setup factories are removed, while Scheduler and cancellation algorithms remain.

Native setup initializes local values once; ordinary closures retain identity and read live props. `$props.id()` supplies framework IDs and direct `$effect` supplies SSR-safe client synchronization. `useControlled`, `useIsoLayoutEffect`, `useStableCallback`, `useOnMount`, `useRefWithInit` and `usePreviousValue` are removed subpaths. Pure business utilities and canonical Store, Scheduler, Timeout, AnimationFrame and ref fan-out algorithms stay shared. No Base, React or SvelteKit runtime dependency is added.

Remaining bounded owner cleanup is recorded in [native correspondence](../../parity/native-framework/README.md): enhanced-click pointer-type state and the scroll-lock effect setup still have their existing function APIs. Their business and the shared ScrollLocker must remain recognizable when those roles migrate. This checkpoint does not claim complete framework acceptance.

Run the root bootstrap/build/dev/check commands to build Utils before Base and applications. When editing Utils, the root development command runs the official utility packager watcher. The normal workspace and published package export paths resolve `dist`; a frozen install alone does not produce build output.

Base UI and Floating UI attribution is included in `THIRD_PARTY_NOTICES.md`. Source correspondence, package move hashes and review status are retained in `parity/utils-package` in the repository.
