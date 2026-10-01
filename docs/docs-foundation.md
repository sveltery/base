# Docs foundation

Run `bash scripts/bootstrap.sh`, `source scripts/toolchain.sh`, `pnpm --filter @sveltery/base build`, then `pnpm --filter @sveltery/fixtures dev`. Browse `http://localhost:5173/docs`. This is a code and preview build; no deployment or package publication is included.

## Structure and sources

The official [Base UI workspace](https://github.com/mui/base-ui/blob/master/pnpm-workspace.yaml) includes a [docs app](https://github.com/mui/base-ui/blob/master/docs/package.json) alongside its component packages. The official [shadcn/ui workspace](https://github.com/shadcn-ui/ui/blob/main/pnpm-workspace.yaml) includes the [apps/v4 docs app](https://github.com/shadcn-ui/ui/blob/main/apps/v4/package.json). Both keep docs with source. Inspected 2026-10-01.

Sveltery keeps that source/docs relationship in this repository. The existing SvelteKit app already consumes the local package and supports SSR and browser acceptance. New `/docs` routes sit beside its unchanged fixtures. This avoids another repository, duplicated toolchains, and relocating fixture URLs. It deliberately uses SvelteKit rather than the upstream Next.js/MDX applications; it does not port their React docs infrastructure.

The logical organization follows [Base UI’s overview and handbook](https://base-ui.com/react/overview/quick-start), and its [Dialog anatomy/examples/API reference](https://base-ui.com/react/components/dialog). [shadcn/ui’s docs](https://ui.shadcn.com/docs) and [Dialog page](https://ui.shadcn.com/docs/components/base/dialog) inform the example-first flow. Navigation groups are Overview, Getting started, Handbook, Components. An on-page contents list, accessible native search input, keyboard shortcut, skip link, and mobile disclosure support navigation. Search filters page titles, descriptions, and groups; it is not a full-text search index or command palette.

All docs prose, CSS, and the live Svelte example are original. [Base UI MIT](https://github.com/mui/base-ui/blob/master/LICENSE) and [shadcn/ui MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) notices were inspected before implementation. No substantial upstream docs code or prose was copied. Existing derived library materials retain [third-party notices](../packages/base/THIRD_PARTY_NOTICES.md). Future substantial code adaptations must retain the applicable copyright and MIT permission notices. README, the visible footer, and About explicitly credit both projects and state Sveltery’s independent/unofficial status.

## Ownership and maintenance

Docs-only ownership: `apps/fixtures/src/routes/docs`, `apps/fixtures/src/lib/docs`, `scripts/docs-api.mjs`, `scripts/tests/docs.test.mjs`, `tests/browser/docs.spec.ts`, this file, and the README credit. The browser CI artifact step preserves screenshots. No component core, package exports, parity manifest, dependency versions, or lockfile changes are needed.

`node scripts/docs-api.mjs` extracts RootProps and the eight public component `$props` signatures into `dialog-api.json`, together with the shared declarations. `node scripts/docs-api.mjs --check` detects drift. Existing script regression runs execute this check in local verification and CI. Regenerate it whenever Dialog types change. Behavioral notes and defaults are original manual explanations grounded in this baseline’s source; they require review when behavior changes.

The live example’s displayed source is imported from the exact rendered `.svelte` file, including CSS, and compiles through the existing type and build checks. Other snippets illustrate partial composition and are labeled by their context; they are not standalone application files. The package remains private/unpublished; getting-started commands use this workspace and its committed toolchain. The site does not advertise full parity or unsupported component APIs.

## Validation

Existing `pnpm check`, `pnpm build`, `bash scripts/verify.sh`, and standards checks include docs. Script tests check extracted API drift, exported part coverage, navigation metadata, local links, and fragment destinations. The browser suite checks server-rendered pages and a 404, keyboard search and skip navigation, dialog labels/focus/return focus, responsive navigation, page errors, overflow, and desktop/mobile screenshots. These are smoke checks, not an accessibility certification or full visual regression suite.

The secured Chromium policy is unchanged. If the local sandbox cannot launch, use the existing hosted `Dialog browser` job. Screenshots and Playwright attachments are kept in the `docs-browser-smoke` workflow artifact. CI, independent review, and completed automatic Codex review must all cover the latest head before parent coordination and any merge.

## Adjacent UI README proposal

This task owns Base docs. For a future Sveltery UI README, first inspect existing credits. If adequate, make no edit. Otherwise propose only: “An experimental, independent Svelte interpretation inspired by [shadcn/ui](https://ui.shadcn.com/) and built on [Sveltery Base](https://github.com/sveltery/base), an unofficial port of [Base UI](https://base-ui.com/). Not affiliated with or endorsed by the original projects. Upstream-derived code retains its original license notices.” Do not claim a published UI package or complete component readiness.
