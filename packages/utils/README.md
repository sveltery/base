# @sveltery/utils

Current native cleanup status: Latest user directive: React-only mechanisms with native Svelte equivalents use native primitives/behavior; port business roles without an equivalent. Custom-hook roles use classes. Controlled replaces React-style diagnostics/serializer/functional dispatch with the requested class API; native $effect replaces manual useIsoLayoutEffect dependency tuples. Current f57da39d implementation is a package/source checkpoint; this native cleanup is pending in a separate stacked change and current helper framework acceptance remains open.

Experimental shared utilities for the unofficial Svelte 5 port of Base UI 1.8.0. This private `0.0.0` package is not ready for npm publication.

Base imports the implemented helper subpaths from this package. There is no root export. `@sveltery/utils/store` exports `Store`, `ReadonlyStore` and the native `SvelteStore`; `@sveltery/utils/platform` exports the existing platform namespace. Other exports are explicit implemented helper subpaths listed in `package.json`.

Plain utilities ship ESM and adjacent declarations. Rune utilities retain native `.svelte.js` source and declarations for compilation by a Svelte 5.57.1+ consumer. Both packages use the official `@sveltejs/package` packager. Utils has no Base, React or SvelteKit runtime dependency.

Native Svelte setup owns initialized refs; live closures and `untrack` own stable callbacks; `$props.id()` supplies framework IDs; runes and lifecycle own controlled state and synchronization; `createSubscriber` supplies selected Store reads. The native calling conventions are documented by the declarations. React-only APIs and unimplemented selector, interval, idle, inspector and ID-generator APIs are not exported. Moving existing helpers does not accept inherited feature source debt; Toast's private store/ID and unaudited feature algorithms retain their existing limits.

Run the root bootstrap/build/dev/check commands to build Utils before Base and applications. When editing Utils, the root development command runs the official utility packager watcher. The normal workspace and published package export paths resolve `dist`; a frozen install alone does not produce build output.

Base UI and Floating UI attribution is included in `THIRD_PARTY_NOTICES.md`. Source correspondence, package move hashes and review status are retained in `parity/utils-package` in the repository.
