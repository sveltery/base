# Docs foundation

Run `bash scripts/bootstrap.sh`, `source scripts/toolchain.sh`, `pnpm --filter @sveltery/base build`, then `pnpm --filter @sveltery/docs dev --port 5178 --strictPort`. Browse `http://localhost:5178/docs/`. The standalone docs app uses stable SvelteKit 3.0.0, TypeScript 6.0.3 and adapter-static 4.0.0; the existing fixture app keeps Kit 2.70.3 and its patch. `pnpm build:docs` writes the static site to `apps/docs/build`. Hosting is managed separately by the user; no deployment or package publication is configured.

## Structure and sources

The official [Base UI workspace](https://github.com/mui/base-ui/blob/master/pnpm-workspace.yaml) includes a [docs app](https://github.com/mui/base-ui/blob/master/docs/package.json) alongside its component packages. The official [shadcn/ui workspace](https://github.com/shadcn-ui/ui/blob/main/pnpm-workspace.yaml) includes the [apps/v4 docs app](https://github.com/shadcn-ui/ui/blob/main/apps/v4/package.json). Both keep docs with source. Inspected 2026-10-01.

Sveltery keeps that source/docs relationship in this repository. The existing SvelteKit app already consumes the local package and supports SSR and browser acceptance. The fixture app retains its `/docs` preview and existing fixture URLs. The standalone `apps/docs` app owns source-derived native Svelte layout/components and consumes shared authored metadata, actual API declarations and the live example; diagnostic fixtures and remote server functions are excluded. This keeps one source for documentation and the committed Node 24/pnpm 12.6 toolchain. The docs app uses Kit 3 with the compatible static adapter, while fixture tests retain their Kit 2 environment. It adapts pinned Base UI documentation composition/helpers/styles to native SvelteKit; React/Next/MDX runtime is excluded. Exact selected bodies and incomplete scope are recorded in [source correspondence](docs-source-correspondence.md).

The organization follows Base UI overview, handbook, component anatomy and API flow. The standalone shell ports pinned Header, SideNav, QuickNav, CodeBlock, Demo, native reference accordion and selected search/parser helpers. Canonical ScrollArea/Collapsible primitives supply shared business code. The native dialog/input/list exposes Original Orama ranking with pending suppression, failed engine retry ownership and IME/modifier helpers; Autocomplete selection and Drawer gestures remain incomplete. The fixture preview retains its original simpler shell.

Prose and the live Svelte example remain original; the standalone docs CSS, composition and selected helpers are adapted from the immutable Base UI source with full MIT notices. Paper Mono ships with its actual OFL; separately licensed Die Grotesk is excluded. Static source notices accompany the artifact. Exact visual comparison and complete interaction/source closure acceptance are unverified; the correspondence records the remaining widget, formatter and code-emphasis scopes. Sveltery remains independent and unofficial.

## Ownership and maintenance

Docs-only ownership: `apps/fixtures/src/routes/docs`, `apps/fixtures/src/lib/docs`, `scripts/docs-api.mjs`, `scripts/tests/docs.test.mjs`, `tests/browser/docs.spec.ts`, this file, and the README credit. The browser CI artifact step preserves screenshots. The standalone app additionally owns `apps/docs`, its workspace manifest/lock additions and the root `build:docs` command. No component core, package exports, parity manifest or fixture dependency pins change. Shared layout navigation uses route params supported by both Kit versions.

`node scripts/docs-api.mjs` extracts RootProps and the eight public component `$props` signatures into `dialog-api.json`, together with the shared declarations. `node scripts/docs-api.mjs --check` detects drift. Existing script regression runs execute this check in local verification and CI. Regenerate it whenever Dialog types change. Behavioral notes and defaults are original manual explanations grounded in this baseline’s source; they require review when behavior changes.

The live example’s displayed source is imported from the exact rendered `.svelte` file, including CSS, and compiles through the existing type and build checks. Other snippets illustrate partial composition and are labeled by their context; they are not standalone application files. The package remains private/unpublished; getting-started commands use this workspace and its committed toolchain. The site does not advertise full parity or unsupported component APIs.

## Validation

Existing `pnpm check`, `pnpm build`, `bash scripts/verify.sh`, and standards checks include docs. Script tests check extracted API drift, exported part coverage, navigation metadata, local links, and fragment destinations. The browser suite checks server-rendered pages and a 404, keyboard search and skip navigation, dialog labels/focus/return focus, responsive navigation, page errors, overflow, and desktop/mobile screenshots. These are smoke checks, not an accessibility certification or full visual regression suite.

The secured Chromium policy is unchanged. The dedicated `playwright.docs.config.ts` runs only `tests/docs-browser` against the actual Kit3 app on5178. Hosted `.github/workflows/docs.yml` uses secured official Chromium on Ubuntu22.04 and retains JSON/raw logs/traces/screenshots for14days. Local browser startup failures earn no assertion credit. Fixture docs retain their existing checks separately. Docs helper tests and static build are explicit CI steps, and docs code/config/tests have an explicit ESLint target. CI, exact-head independent review and configured review remain required before parent approval and merge.

## Adjacent UI README proposal

This task owns Base docs. For a future Sveltery UI README, first inspect existing credits. If adequate, make no edit. Otherwise propose only: “An experimental, independent Svelte interpretation inspired by [shadcn/ui](https://ui.shadcn.com/) and built on [Sveltery Base](https://github.com/sveltery/base), an unofficial port of [Base UI](https://base-ui.com/). Not affiliated with or endorsed by the original projects. Upstream-derived code retains its original license notices.” Do not claim a published UI package or complete component readiness.

## Standalone app coverage

The 19 authored pages include Button, Avatar, Toolbar, ToggleGroup, ScrollArea and typed remote Form. Newly added component examples are labeled composition snippets; remote Form examples explicitly require a consuming Kit server application. Manual API summaries link actual local declarations and source evidence. Dialog and Accordion retain their extracted type references and drift checks; only Dialog currently has a live example. These descriptions cover bounded merged slices and do not claim complete upstream parity.
