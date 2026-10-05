# Sveltery Base docs

A standalone SvelteKit 3.0.0 documentation app. It consumes the authored docs
components and metadata from `apps/fixtures/src/lib/docs` through thin routes;
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
