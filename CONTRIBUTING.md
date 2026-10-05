# Contributing

This is an experimental, unofficial Svelte 5 port. Start with the [architecture](docs/architecture.md), [source-porting gate](docs/source-porting.md), [pinned upstream contracts](docs/upstream-contracts.md), and [parity inventory](parity/README.md). Preserve upstream MIT attribution when porting code or assertions.

Use Node 24.x and pnpm 12.6.0. From a fresh checkout:

```sh
bash scripts/bootstrap.sh
bash scripts/verify.sh
bash .github/standards/check.sh
```

For a focused fresh library build and npm artifact check, run `pnpm package:check`. It validates the packed Svelte source/declarations with publint and AreTheTypesWrong before the existing installed consumers. The producer and standards compiler is TypeScript 6.0.3; the isolated TS5.9.3 remote-contract consumer remains minimum-compiler coverage. See [release preparation](docs/releasing.md) for artifact and supported-resolution details.

The library development setup follows the official `sv create` library template with ESLint, Prettier, Vitest and Playwright, adapted to this workspace. Run `pnpm dev` for the small public-component preview in `packages/base`; the paired reference fixtures remain in `apps/fixtures`.

| Command                     | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `pnpm check`                | Workspace TypeScript and Svelte diagnostics                         |
| `pnpm lint` / `pnpm format` | Check or format maintained source, tests, configs and documentation |
| `pnpm test`                 | Existing Node runtime suites                                        |
| `pnpm test:unit`            | Watch the Node runtime suites                                       |
| `pnpm test:dom`             | Existing jsdom characterization suites                              |
| `pnpm test:component`       | Real Chromium public-component tests                                |
| `pnpm test:e2e`             | Existing paired Playwright browser suites                           |
| `pnpm build`                | Build workspace packages and applications                           |

Install official Chromium once with `pnpm exec playwright install chromium` before browser checks. Both browser runners enable the Chromium sandbox, use one worker and zero retries; use a supported host rather than disabling that sandbox.

Keep pull requests focused. Explain the behavior before and after, link the upstream contract or issue, and distinguish upstream assertion ports from new regressions. Update parity claims only with executed evidence. An independent reviewer must examine the exact final commit; rerun relevant checks after changes.

## Source-first implementation and review

The user’s current native-framework directive supersedes earlier hook-parity guidance: replace React-specific machinery that has a Svelte equivalent with the native primitive and its behavior; port real business mechanisms that have no equivalent. Use classes for reusable state-owner roles previously carried by custom hooks, and keep stateless business functions as functions. Controlled state uses the small `Controlled` class with initial mode, live controlled reads, initial-default fallback and direct value setting. React controlled/default diagnostics, serializers, functional dispatch adapters and explicit effect dependency tuples are unnecessary. Use `$effect` directly; it is SSR-safe without SvelteKit. Preserve real cancellation, registration, resource invalidation and cleanup. Use `untrack` at actual imperative subscription or side-effect boundaries, never as blanket React dependency emulation. Record native expectation changes separately with zero divergent unchanged upstream parity credit.

Element parts use their own direct native branch: `{#if render}{@render render(mergedProps, state, children)}{:else}<button {...mergedProps}>{@render children?.()}</button>{/if}`, substituting the part's actual intrinsic fallback. Do not add `UseRender`, a generic tag renderer, clone/selector host discovery, React callback-ref identity/fanout, render/commit emulation, attachment interception or CSS snapshot/style custody. Pure shared prop, class/style and state-attribute business helpers remain reusable. Publish actual hosts with `$bindable`, native bindings and attachments; capture real registration inputs before untracking the imperative publication, and clean up the captured resource owner. Native snippet/element/style defaults and independent attachment lifetimes are binding under the user's directive.

Before writing implementation code, read the original component and recursively trace its imports at Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Use the pinned source bodies as the starting point with MIT notices; preserve recognizable component composition, business algorithms, dependency boundaries/reuse, names, operation order, branches, state and cancellation. Implement each shared business helper once. In particular, Input delegates to a real Field.Control port; a standalone replacement algorithm or constant Field state does not fulfill that source dependency.

Prefer native Svelte primitives, lifecycle and rendering facilities where they replace Base UI/React machinery. For inherent native element/renderer differences, keep Svelte defaults rather than emulate React quirks. A small named wrapper is useful when it serves correspondence or reuse; do not invent an adapter solely for similarity. Retain a [source-correspondence table](docs/source-porting.md#source-correspondence-record) linking every original file/function to its used business port or native primitive, deliberate replacement and review check. Missing business helpers or internal components keep the component incomplete. Unused copied modules and cosmetic relocation of custom algorithms provide no source evidence. Earlier PM approvals do not waive these requirements.

Source business contracts and test evidence are both binding. PM and independent code review at the final PR head must inspect the full component dependency closure, including reused helpers outside the diff, and assess source fidelity, idiomatic native Svelte and maintainability: readability, proportionate complexity, one shared implementation and no unnecessary abstraction or React lifecycle machinery. Preserve original assertion evidence; native framework assertions use verified native behavior, with divergent expectations earning no unchanged upstream parity credit. Retain separate ordinary, parameterized, conformance and supplemental accounting, the difference policy below, and the required CI, browser, SSR, type and public-package gates. Test totals alone do not establish acceptance. Apply the [landed-feature audit checklist](docs/source-porting.md#landed-feature-audit) to existing implementations.

## Svelte and repository checks

Use native Svelte 5 state, derived values, snippets and event props. Use an effect for synchronization with an external system, with cleanup for listeners, observers and timers. Avoid effects that merely copy reactive state. Check SSR without browser globals, hydration, controlled and uncontrolled updates, cancellation, callback ordering, focus restoration, nesting and teardown where applicable. Browser assertions must exercise a rendered component and fail when the behavior is broken.

For markup-local values, use `{const ...}` and `{let ...}` declaration tags, available since Svelte 5.56. Wrap changing expressions in `$derived(...)`; declaration initializers do not implicitly stay reactive. Keep component-lifetime state and context initialization in the script when moving them into a block would change their lifetime. The installed Svelte 5.57.1 and library peer range `^5.57.1` support this syntax. ESLint rejects legacy `{@const ...}` in runes mode through `svelte/no-at-const-tags`, available since eslint-plugin-svelte 3.20.0 and installed at 3.23.0. See the [scoped modernization record](docs/modern-svelte.md) for the fixture and tooling changes.

The visible root `eslint.config.js` and `prettier.config.js` share one frozen workspace toolchain. ESLint checks maintained TypeScript, JavaScript and Svelte source, tests and scripts. Prettier includes the official Svelte plugin and keeps the project's two-space, single-quote style. Immutable upstream/parity archives, generated output, lockfiles and shipped patch/attribution bytes are excluded from formatting. `.github/standards/check.sh` delegates to `pnpm lint` without a second dependency installation. Underscore-prefixed unused parameters remain allowed for type assertion helpers. Empty object defaults are allowed only in the upstream-derived event-detail type file. The narrow `no-self-assign` exception preserves the source-derived no-op branch in `mergeProps`; JavaScript retains `no-undef` while TypeScript checks its own undeclared names.

The [CI checks](docs/ci.md) must pass on the reviewed head before merging, including the real browser gates for affected components. Do not substitute an empty job or an environment probe for component acceptance. Package publication is a separate, explicitly approved operation; see [release preparation](docs/releasing.md).

## Upstream porting policy

The pinned upstream is the component and business-logic reference. Reproduce questioned behavior against that exact pin before changing the port. Preserve upstream business behavior first, including suspected bugs. Track verified business bugs shared with upstream in this repository's GitHub issues for later work; link the reproducer and source pin. Do not silently fix them while porting. The user's [native Svelte directive](docs/source-porting.md#native-svelte-and-maintainability) authorizes inherent element/renderer differences to retain Svelte defaults; document those differences instead of treating React renderer quirks as business contracts.

Keep three categories separate: fidelity repairs restore the pinned behavior; intentional differences change it, including local bug fixes; unimplemented scope remains incomplete and blocked. Neither merging a PR nor passing an assertion with a different expected result establishes approval or parity.

For every intentional difference, record the source and immutable pin, observable upstream and local behavior, rationale, test/run evidence, landed PR (or proposed PR until landing), and truthful decision status in the compatibility register. Record framework/API substitutions as well as behavioral fixes. Keep landed status separate from a specific acceptance decision; cite a recorded decision or state that one is not recorded. Preserve original assertion provenance; native framework assertions use verified native expectations and earn no unchanged upstream parity credit when divergent. Preserve MIT notices and retain explicit incomplete-parity limits.

Use the [upstream differences](docs/upstream-differences.md) as the central index, with links to feature-specific evidence and remaining scope.
