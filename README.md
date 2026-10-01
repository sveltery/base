# Sveltery Base

An experimental, unofficial Svelte 5 port of modern [Base UI](https://base-ui.com/).

The first milestone is reusable foundations and a working Dialog slice, followed by early Drawer and Toast acceptance. Compatibility is measured against pinned upstream APIs and behavior; unsupported features and deliberate Svelte differences will be documented explicitly.

This project is independent of MUI and Base UI and is not affiliated with or endorsed by them. Original Sveltery code is licensed under [MIT](LICENSE); upstream-derived materials retain their original notices in [THIRD_PARTY_NOTICES.md](packages/base/THIRD_PARTY_NOTICES.md).

The feature branch contains a [contained Dialog draft](docs/dialog-first-slice.md) and reusable package foundations, not a completed component library. See [cloud bootstrap](docs/cloud-bootstrap.md), [architecture](docs/architecture.md), [pinned contracts](docs/upstream-contracts.md), and [parity inventory](parity/README.md). Complete Dialog parity, Drawer and Toast remain pending. The 31 contained browser probes pass in secured Chromium CI; local browser startup remains blocked. This evidence does not certify the full upstream Dialog inventory.
