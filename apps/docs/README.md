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
pnpm --filter @sveltery/base build
pnpm --filter @sveltery/docs dev --port 5178 --strictPort
```

Open `http://localhost:5178/docs/`. The development server binds to `0.0.0.0`.

```sh
pnpm --filter @sveltery/docs check
pnpm --filter @sveltery/docs test
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

`pnpm exec playwright test --config playwright.docs.config.ts` runs the dedicated
standalone app browser checks. Secured hosted `.github/workflows/docs.yml` preserves
JSON results, logs, traces and screenshots. It leaves component browser discovery
unchanged.
