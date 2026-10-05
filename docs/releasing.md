# Release preparation

The workspace and `@sveltery/base` package are currently private, version `0.0.0`. CI prepares and tests a local tarball only. No automated publication is configured.

## Build and validate the npm artifact

Use Node 24.x and pnpm 12.6.0. After the frozen bootstrap install, run:

```sh
pnpm package:check
```

This builds the library with the official `@sveltejs/package` 3.0.0 and TypeScript 6.0.3, then packs and validates the actual npm artifact. It preserves `.svelte` components, transpiles TypeScript helpers to JavaScript, leaves rune `.svelte.js` modules for the consumer's Svelte compiler, and emits adjacent declarations. Fully specified internal `.js` imports are intentional modern ESM. Consumers import the supported package root or extensionless public subpaths from `exports`, using Svelte-aware tooling and a compatible Svelte 5 peer.

The artifact gate verifies every export target, component/rune declarations and source preservation, excludes tests and caches, and compares the license, third-party notices and shipped application patch. The same tarball is checked with publint 0.3.25 in strict mode and AreTheTypesWrong core 0.18.5, then installed in the existing isolated consumers. ATTW's public `filterProblems` API requires every public entry to pass Bundler resolution and the plain-JavaScript `merge-props` entry to pass Node16 ESM resolution. No diagnostic rules or public entries are excluded. Its complete, unmodified analysis, including unsupported-mode problems, is retained at `.checks/npm-package/sveltery-base-0.0.0.attw.json`.

Svelte component declaration imports require Svelte-aware Bundler resolution. ATTW's Node16 ESM resolver searches for `Root.d.svelte.ts` when the official Svelte packager emits `Root.svelte.d.ts`; the generic CLI `esm-only` profile therefore fails for component entries. Node10 and CommonJS `require()` are also unsupported. To inspect the full CLI diagnosis, run `pnpm exec attw <actual-tarball.tgz> --profile esm-only`; its nonzero component result does not imply a passing Node16 component contract. The API gate narrows resolution modes honestly while retaining all diagnostic rules. Type resolution success does not make Svelte components or rune modules executable by plain Node: the installed consumers compile them with the real Svelte compiler and test SSR, native DOM wiring and strict public types. The TS5.9.3 remote-contract consumer remains minimum-compiler coverage alongside the TS6 producer checks. The package ships preserved Svelte sources and declarations; JavaScript/declaration source maps are not currently included. Verified editor maps can be considered in a separate source-distribution improvement.

The combined verification command creates the production workspace closure once with native pnpm pack, records each archive SHA-256 in `artifacts.json`, and reuses those exact archives in all isolated consumers. Standalone consumer scripts create a fresh closure through the same helper. Consumer preparation installs local workspace dependencies from those archives, rather than resolving unpublished workspace versions from npm.

To retain a fresh tarball for manual inspection, run `pnpm --filter @sveltery/base pack --pack-destination <directory>`. The official `prepack` lifecycle synchronizes the development configuration, compiles the library and runs strict publint; it does not build the preview application or publish. `pnpm package:check` adds the actual artifact and installed-consumer gates. A script module may be eliminated when unused under the package's `sideEffects` metadata; CSS imports remain side effects. Module initialization currently creates local constants/contexts, while listeners, timers and CSS registration belong to invoked component/helper lifecycles.

The import-time review covered the actual runtime graph from every public export, including Svelte script imports and the viewport's module script. Platform detection only reads guarded navigator data; context factories and loggers create local keys/closures. The ScrollLocker singleton and FloatingDelayGroup defaults allocate idle Timeout objects whose timers start only through invoked methods. ScrollAreaViewport declares its CSS-registration function at module scope and calls it through `onMount`; Svelte instance scripts run when the component is rendered. These bodies support the current script side-effect metadata. Any future import-time global mutation needs an explicit module entry in `sideEffects`.

Future popup source-inventory runs report their actual `ts.version`. To compare the successor compiler without overwriting immutable historical receipts, use `node scripts/record-popup-family-source.mjs <upstream-git-directory> <producer-package.json> <new-output-directory>`. Historical inventories keep their original compiler labels and hashes.

## Prepare an approved release

1. Agree on the intended public API, supported Svelte versions, semver change and compatibility scope. Do not claim unported browser behavior.
2. Prepare version and release-note changes in a focused PR. Preserve `LICENSE` and `THIRD_PARTY_NOTICES.md` in the package.
3. From a fresh checkout, run `bash scripts/bootstrap.sh`, `bash scripts/verify.sh`, and `bash .github/standards/check.sh`. Run the real browser suite when implemented, including SSR/hydration, accessibility, focus and cleanup acceptance for shipped components.
4. Independently review the final head and verify hosted CI for that same SHA. Inspect the local tarball's contents, exports, included notices and consumer imports. Merge through the normal PR process.
5. Obtain separate, explicit maintainer approval for publication, the target registry/package/version, credentials, and any `private` flag change. Only then may a maintainer create a release/tag and publish that approved artifact using an authorized workflow.

If a release has a regression, stop further publication, document the affected version and prepare a reviewed fix. Registry deprecation, unpublishing and deployment changes require their own explicit authorization. Never treat CI success as permission to publish.

## Future trusted publishing

The preferred future publishing path uses npm's GitHub Actions trusted publisher with OIDC rather than a stored npm token. A maintainer must first approve the public API, package/version/private-flag changes and registry destination, configure the npm trusted-publisher record for the exact repository/workflow filename/protected release environment, and verify the organization's registry permissions. This configuration is not established by local package checks.

The separately approved workflow should check out the reviewed release commit, use the pinned Node/pnpm toolchain and a supported pinned npm CLI (trusted publishing requires npm >=11.5.1), run the release gates, and publish the inspected artifact with `npm publish --provenance --access public`. Grant `id-token: write` only to that protected publishing job; verification keeps `contents: read`. Automatic provenance requires an eligible public repository/package and supported hosted runner. Version/tag/release decisions and any retry or deprecation remain explicit maintainer operations. No live publishing workflow, registry credentials, trusted-publisher configuration or release tag is created by this preparation.
