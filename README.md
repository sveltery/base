# Sveltery Base

An experimental, unofficial Svelte 5 port of modern [Base UI](https://base-ui.com/).

The first milestone is reusable foundations and a working Dialog slice, followed by early Drawer and Toast acceptance. Compatibility is measured against pinned upstream APIs and behavior; unsupported features and deliberate Svelte differences will be documented explicitly.

This project is independent of MUI and Base UI and is not affiliated with or endorsed by them. Original Sveltery code is licensed under [MIT](LICENSE); upstream-derived materials retain their original notices in [THIRD_PARTY_NOTICES.md](packages/base/THIRD_PARTY_NOTICES.md).

The [docs app](docs/docs-foundation.md) runs at `/docs` beside the existing fixtures. Its navigation, anatomy and API reference are inspired by [Base UI docs](https://base-ui.com/react/overview/quick-start); its example-first flow also credits [shadcn/ui](https://ui.shadcn.com/docs). Sveltery is not affiliated with or endorsed by shadcn/ui. See the visible About & credits page for sources and licenses.

Main contains a [contained Dialog draft](docs/dialog-first-slice.md) and reusable package foundations. See [cloud bootstrap](docs/cloud-bootstrap.md), [architecture](docs/architecture.md), [pinned contracts](docs/upstream-contracts.md), and [parity inventory](parity/README.md). Complete Dialog parity, Drawer and Toast remain pending. Read the exact-head `Dialog browser` job in [CI](https://github.com/sveltery/base/actions/workflows/ci.yml) for current secured Chromium execution counts and results; local browser startup remains blocked. Browser executions include paired reference and supplemental regressions and do not certify the full upstream Dialog inventory.

Read the [upstream differences register](docs/upstream-differences.md) for landed behavioral corrections, framework adaptations and decision/evidence limits.

The [catalog ledger](docs/catalog.md) accounts for every pinned root export module and distinguishes bounded implementations from unimplemented scope. [Standalone Separator](docs/separator.md) adds the native horizontal/vertical divider surface; its source assertions and acceptance gates remain separately recorded.
