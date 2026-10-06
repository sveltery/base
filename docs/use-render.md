# Former UseRender API

The native snippet successor removes `UseRender`, `@sveltery/base/use-render` and all `UseRender*` aliases under the user's explicit native rendering directive. Components use their own `render(props, state, children)` snippet branch and actual HTML fallback. See [native rendering](rendering.md) for the current API and migration.

The former component adaptation and its seven divergent React return-type assertions remain historical evidence in [the predecessor assertion record](../parity/use-render/README.md). React return values, element cloning, ref fanout and render/commit behavior are not current Svelte API contracts. Original archives, assertion provenance and receipts retain their original bytes and accounting. The successor's native assertions do not gain unchanged upstream credit from differing native expectations.
