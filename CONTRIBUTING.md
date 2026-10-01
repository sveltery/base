# Contributing

This is an experimental, unofficial Svelte 5 port. Start with the [architecture](docs/architecture.md), [pinned upstream contracts](docs/upstream-contracts.md), and [parity inventory](parity/README.md). Preserve upstream MIT attribution when porting code or assertions.

Use Node 24.x and pnpm 12.6.0. From a fresh checkout:

```sh
bash scripts/bootstrap.sh
bash scripts/verify.sh
bash .github/standards/check.sh
```

Keep pull requests focused. Explain the behavior before and after, link the upstream contract or issue, and distinguish upstream assertion ports from new regressions. Update parity claims only with executed evidence. An independent reviewer must examine the exact final commit; rerun relevant checks after changes.

Use native Svelte 5 state, derived values, snippets and event props. Use an effect for synchronization with an external system, with cleanup for listeners, observers and timers. Avoid effects that merely copy reactive state. Check SSR without browser globals, hydration, controlled and uncontrolled updates, cancellation, callback ordering, focus restoration, nesting and teardown where applicable. Browser assertions must exercise a rendered component and fail when the behavior is broken.

ESLint checks TypeScript, JavaScript and Svelte source plus tests and scripts. Prettier currently checks the project standards files listed in `.github/standards/check.sh`. Existing source formatting is not standardized by this PR; expand formatting in a coordinated change to avoid rewriting active component work. Standards dependencies have an independent frozen lockfile under `.github/standards`, so component dependencies remain owned by the workspace. Underscore-prefixed unused parameters are allowed for type assertion helpers. Empty object defaults are allowed only in the upstream-derived event-detail type file. The narrowly scoped `no-self-assign` exception preserves an existing upstream-derived no-op branch in `mergeProps` and should be removed when that port is revised.

Both [CI checks](docs/ci.md) must pass on the reviewed head before merging. Browser acceptance remains a separate requirement for component changes until a real browser suite is connected to CI. Do not substitute an empty job or an environment probe for component acceptance. Package publication is a separate, explicitly approved operation; see [release preparation](docs/releasing.md).

## Upstream porting policy

The pinned upstream is the behavior reference. Reproduce questioned behavior against that exact pin before changing the port. Preserve upstream behavior first, including suspected bugs. Track verified bugs shared with upstream in this repository's GitHub issues for later work; link the reproducer and source pin. Do not silently fix them while porting.

Keep three categories separate: fidelity repairs restore the pinned behavior; intentional differences change it, including local bug fixes; unimplemented scope remains incomplete and blocked. Neither merging a PR nor passing an assertion with a different expected result establishes approval or parity.

For every intentional difference, record the source and immutable pin, observable upstream and local behavior, rationale, test/run evidence, landed PR (or proposed PR until landing), and truthful decision status in the compatibility register. Record framework/API substitutions as well as behavioral fixes. Keep landed status separate from a specific acceptance decision; cite a recorded decision or state that one is not recorded. Divergent assertions earn no parity credit. Preserve MIT notices and assertion provenance, and retain explicit incomplete-parity limits.

Use the [upstream differences](docs/upstream-differences.md) as the central index, with links to feature-specific evidence and remaining scope.
