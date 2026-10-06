# Sveltery Base docs

A standalone SvelteKit 3.0.0 documentation app. It owns a source-derived docs shell in `src/lib/docs` and consumes canonical
authored metadata, extracted API declarations and the live Svelte example from
`apps/fixtures/src/lib/docs`;
it does not include the diagnostic fixture routes or remote server functions.
The existing fixture app keeps its SvelteKit 2.70.3 dependency and native form patch.

From the repository root, using Node 24.x:

```sh
bash scripts/bootstrap.sh
source scripts/toolchain.sh
pnpm package:build
pnpm --filter @sveltery/docs dev --port 5178 --strictPort
```

Open `http://localhost:5178/docs/`. The development server binds to `0.0.0.0`.
The docs Vite configuration first runs the real fixture app's Kit 2 sync command
because its imported authored TypeScript uses that app's generated tsconfig.
This prerequisite also runs for a direct Vite/Playwright start and static build.

```sh
pnpm --filter @sveltery/docs check
pnpm --filter @sveltery/docs test
pnpm --filter @sveltery/docs test:dom
pnpm build:docs
```

The static adapter writes `apps/docs/build`, including every documented slug,
client assets and an explicit 404 page. Hosting is managed separately by the
user; no deployment credentials, hosted project or deployment workflow is
configured here. The default site path is `/`, with docs under `/docs/`.

Remote Form examples are illustrative consuming-app code. The static docs do
not execute SvelteKit server functions. The Dialog preview runs the real local
library; its displayed source is the same file used for rendering.

Sveltery is experimental, private/unpublished and independent of Base UI and
shadcn/ui. Retained MIT notices and the visible credits remain part of the docs.

The pinned Base UI layout, CSS and selected helpers are ported to native Svelte.
[Source correspondence](../../docs/docs-source-correspondence.md) records exact
closure and incomplete search widgets/API/code emphasis scope. The native search
uses the Original Orama index/ranking; code uses its Starry Night parser with local
WASM. JSON grammar is deferred pending its exact ISC notice. Paper Mono ships with
OFL; Die Grotesk is excluded, so typography and visual fidelity are not exact.

Maintained documentation runtime helpers and tests are TypeScript. Node 24 runs
the actual helper test sources with native type erasure; their narrow resolver
adapts canonical `.js` import spelling and Vite's WASM asset URL for Node. The
portable evidence checker compares 12 unchanged helpers after erasure with the
frozen JavaScript checkpoint and the engine with one precise class-ownership
transform. The prior 13/13 evidence is archived; no parser or ranking algorithm is
replaced:

```sh
node docs/receipts/docs/typescript-source-check.mjs
```

`pnpm exec playwright test --config playwright.docs.config.ts` runs the dedicated
standalone app browser checks. Secured hosted `.github/workflows/docs.yml` preserves
JSON results, logs, traces and screenshots. It leaves component browser discovery
unchanged.

The native lifetime regression reproduces Demo teardown during the closing click.
The dedicated browser gate also checks HTTP SSR host reuse through hydration, the
actual installed-export Dialog preview and native collapsed overflow. All are
supplements with no unchanged upstream assertion credit.

Installed consumers are separate from the workspace HTTP app. These commands
reuse actual Base/Utils tarballs, check all installed declarations with
`skipLibCheck:false`, retain negative type assertions, then verify SSR/hydration
and secured Chromium behavior:

```sh
bash scripts/check-docs-package.sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.checks/docs-playwright"
pnpm exec playwright install chromium
bash scripts/check-docs-browser-package.sh
pnpm exec playwright test --config playwright.docs.config.ts
```

Use the same explicit browser path for installation and both launchers. CI sets
that path at job scope and retains the official browser, sandbox, one worker
and zero retries. Local archive/download/resource failures are incomplete gates.
The docs development typings use the existing Node 24 pin; declarations are not
skipped. Current closure acceptance also waits for the separately owned
Button/Transition representation and PR73 nativeProps empty-style transport work.
No shared helper is copied or patched in the docs app.
