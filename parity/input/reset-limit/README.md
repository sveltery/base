# Accepted unsupported controlled reset boundary

I-04 records a narrow user-approved unsupported combination. During a controlled edit, a consumer calls `form.reset()`. The form's `onreset` callback directly changes that input's `form` attribute and calls `stopPropagation()` or `stopImmediatePropagation()` before the native reset algorithm runs. An uncanceled reset can then apply to a different set of controls without the Input observer seeing the association change. Moving out leaves `edit` instead of restoring `owner`; moving in restores `owner` instead of retaining native `seed`.

The [decision record](decision.json) preserves the supplied assistant/user message IDs, the exact user reply “Svelte native is ok”, and its October 2, 2026, 16:40:55 UTC timestamp. The proposal summary is explicitly a summary, not a fabricated transcript. Approval applies to this stopped, uncanceled, direct imperative reassociation combination. It does not waive supported reset, cancellation, reactive association, completed-reset-then-move, or native comparator assertions. Production Input is unchanged.

The runnable [36-case characterization](../../../packages/base/tests/dom/input-reset-limit.test.ts) uses the actual [Input and native Svelte fixture](../../../packages/base/tests/dom/InputResetLimitFixture.svelte). It keeps the original three normative assertions from the independent negative probe. Exactly four controlled moving-in/out cases use `it.fails`; the other 32 pass normally. These are explicit unsupported observations, not repaired behavior or conformance passes. [Raw observations](results.json) identify each expected/actual value; the [execution log](vitest.log) reports **32 passed, four expected fail**. All four fail the settled-value assertion, while immediate native values and final form associations remain correct.

Run from the repository root after bootstrapping the pinned toolchain:

```sh
source scripts/toolchain.sh
pnpm --filter @sveltery/base exec vitest run --config vitest.dom.config.ts tests/dom/input-reset-limit.test.ts
```

To save current observations, set `INPUT_RESET_LIMIT_RESULTS_PATH` to an output file. The checked-in observations and log belong to the recorded source checkpoint; later runs do not automatically replace that evidence.

The [evidence index](evidence.json) hashes the runnable fixture/test, decision, runtime, and all historical artifacts. The historical sources are copied byte for byte. Their absolute scratch imports are retained intentionally; they are diagnostic source snapshots, not additional portable CI tests. Their logs retain their original passing/failing outcomes:

| Historical proof | Executions | Result |
| --- | ---: | --- |
| [Original native/Input probe](history/original24/imperative-reset.test.ts) | 24 | 22 pass, two negative failures |
| [Independent native/Input probe](history/independent/imperative-reset.test.ts) | 36 | 32 pass, four negative failures |
| [Actual pinned React Input](history/rejected-clone-candidate/react-pin.test.ts) | 36 | 36 pass |
| Rejected clone candidate supported sample | 818 | 818 pass; insufficient for promotion |
| Rejected clone candidate collision proof | 12 | Eight pass, four negative failures |
| Independent candidate boundary | 9 | Seven pass, two negative failures |
| Independent candidate ambiguity | 13 | Nine pass, four negative failures |

Actual Base UI React 1.8.0 controlled `value="owner"` initializes the reset default to `owner`, even with a supplied `defaultValue="seed"`, and settles to `owner` in all 18 controlled reset/reassociation/cancellation cases. Its 18 uncontrolled cases retain `edit` for moving out or cancellation and reset to `seed` for uncanceled moving in or completed-reset-then-move. [React raw observations](history/rejected-clone-candidate/react-pin-results.json) include callback values, defaults and native reset phases. Native Svelte preserves the supplied default and resets to `seed` only when the control participates in the successful native reset. These are executed characterizations, separate from ordinary upstream test declarations.

The detached-clone candidate remains **rejected**. Dirty-value flag measurements alone cannot identify reset history: type transitions can clear the flag without a reset, and caller value writes can set it after a reset. The [independent ambiguity records](history/independent/clone-ambiguity-results.json) and [collision records](history/rejected-clone-candidate/collision-results.json) preserve cases with identical permitted observations and different required controlled results. Candidate snapshots, patches and logs are historical investigation only; no candidate or native API interception is part of production. Historical READMEs describe the earlier unresolved decision and are preserved unchanged; this decision record supersedes only that approval status.

This ledger earns **zero ordinary Input declaration credit and zero Field credit**. Existing supported assertions, conformance helper provenance, timing requirements and secured CI/review acceptance remain separate. Upstream source provenance and the MIT notice remain in [the Input inventory](../upstream-inventory.json) and [license](../UPSTREAM_LICENSE).
