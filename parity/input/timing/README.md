# Controlled Input event timing characterization

This is supplemental evidence for the native Svelte timing decision accepted on 2026-10-02. The characterization itself changes no runtime behavior. The runtime checkpoint is `2213f032551def068dba89115df69fdaf2cd7e03` (also indexed in [evidence.json](evidence.json)). The actual pinned React Input reference remains Base UI v1.8.0 at `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`; MIT attribution remains in [UPSTREAM_LICENSE](../UPSTREAM_LICENSE).

[The probe](../../../apps/fixtures/src/lib/input-timing/probe.ts) registers native input listeners before and after mounting an isolated framework root. During a single programmatic `dispatchEvent` call inside one JavaScript stack, every listener and callback snapshots both `input.value` and `new FormData(form).get('field')`. It reads again immediately after dispatch returns and after two Svelte ticks. The test uses the existing native value setter to trigger React's ordinary change detection; it patches no native or framework API. The probe owns and removes all listeners and framework roots.

The matrix covers actual React Input, the current port, native Svelte `value={owner}`, plain native `bind:value={owner}` with an owner decision in oninput, accessor binding `bind:value={() => owner, setter}`, a caller-owned final-handler wrapper, and a fixture-only copy of Input with an owned final-handler wrapper. Each accepts, rejects or uppercases the same `edit` request. Three additional cases compare consumer preventBaseUIHandler in React, the current port and the owned wrapper. The programmatic phase matrix does not establish trusted keystroke timing: browsers may checkpoint microtasks between trusted native listener invocations. Separate real Kit trusted-event traces are in [input-remote-phases.spec.ts](../../../tests/browser/input-remote-phases.spec.ts).

All twenty-four DOM cases passed with exact listener-stage order and every value/FormData observation asserted. [Full raw traces](dom-results.json), source SHA-256 hashes, tool versions and the command appear in [the execution index](evidence.json). Both package/fixture type checks and focused ESLint passed.

## Observed DOM and FormData reads

For rejected and rewritten edits, the observations are:

| Observer | React Input | Current port | Native Svelte plain/accessor binding | Caller/owned final wrappers |
| --- | --- | --- | --- | --- |
| Native target and form listeners | `edit` | `edit` | `edit` | `edit` |
| Native root listener registered before framework delegation | `edit` | `edit` | `edit` | `edit` |
| Callback before and after owner decision | `edit` | `edit` | `edit` | `edit` |
| Native root listener registered after delegation | `owner` / `EDIT` | `edit` | `edit` | `owner` / `EDIT` |
| Native document listeners and dispatch return | `owner` / `EDIT` | `edit` | `edit` | `owner` / `EDIT` |
| After tick | `owner` / `EDIT` | `owner` / `EDIT` | `owner` / `EDIT` | `owner` / `EDIT` |

Every FormData snapshot exactly matches the DOM value shown. Accepted edits remain `edit` at every observation. A native Svelte value prop by itself does not restore a rejected edit even after tick; rewrites update after tick. Accessor bindings run their setter at the target, before the added target bubble listener. Plain binding's owner-decision oninput, React's callback, and the port's callback run during framework delegation after the root-before listener. The accessor setter still restores the DOM after tick: Svelte 5.57.1's native binding implementation explicitly awaits tick before validating its getter and reasserting the value (the exact source hash is indexed).

The probe's document labels describe registration relative to the isolated probe mount. An enclosing SvelteKit root can already have document delegation; the observable native snapshots and isolated root-before/root-after ordering remain explicitly asserted.

These DOM results have a separate [secured Chromium test](../../../tests/browser/input-timing.spec.ts), which attaches the complete JSON matrix. The [complete hosted matrix](browser-passing-fresh-host-results.json) passed at checkpoint `02863a6` ([CI 36985467480](https://github.com/sveltery/base/actions/runs/36985467480)); its source/run/artifact hashes are indexed separately. Final-head execution remains required after subsequent repairs. No ordinary Input or Field parity credit is added.

## Smallest feasible synchronous approach

[The fixture-only prototype](../../../apps/fixtures/src/lib/InputTimingFixture.svelte) owns the actual native oninput handler after render composition. It calls the supplied merged handler, then reasserts the latest caller owner value in a finally block. The owner state is synchronously readable after the callback, so this prototype needs neither flushSync nor a new listener on the document. It matches React's later same-dispatch observations while preserving the earlier target/form reads.

The [owned-wrapper copy](../../../apps/fixtures/src/lib/input-timing/InputOwnedFinalWrapper.svelte) separately verifies the component boundary. It copies the checkpoint Input script, prop merging, attachment and render selection. Only fixture import paths and the native default snippet's final oninput handler change. That handler invokes nativeProps.oninput and then reads this component's own controlled `value` prop getter, rather than reading the caller fixture owner directly. All three parent decisions restore synchronously, without flushSync. Consumer prevention also suppresses the value callback while the final handler still restores the owner before later native listeners. [The exact checkpoint source](runtime-checkpoint.svelte) and [the complete fixture diff](owned-wrapper.patch) make the bounded prototype reviewable. The existing delayed listener remains copied; it does not cause the observed synchronous restoration.

The caller wrapper is a feasible opt-in adaptation through the existing render snippet API, and the owned copy establishes feasibility for the library's own default native snippet. That alone does not enforce synchronous restoration for every arbitrary replacement snippet: a render-owned merge can prevent or omit the supplied handler, and the library does not own the replacement's final native handler. The present attachment listener remains a way to settle those suppressed edits after tick; retaining it would retain a bounded timing difference for that rendering scope. Calling flushSync inside a supplied handler does not solve suppression of that handler. A blanket feasibility claim would therefore be inaccurate in either direction.

Accepted contract: keep uniform native Svelte tick timing for default and replacement hosts. No synchronous wrapper API or production handler wrapper is included. The user accepted this specific observable scheduling difference on 2026-10-02; the stage matrix preserves the React comparison and native binding baseline. Secured Chromium execution remains a final-head gate.

Neither approach can make an earlier native form listener observe a rejected or rewritten value retrospectively. The listener has already read `edit` in React too. A SvelteKit form listener can therefore update remote state before the component's delegated callback; rejecting or rewriting that remote owner requires explicitly updating its field state in the owner callback. DOM restoration cannot roll back the earlier listener or its FormData read.

The first hosted matrix at `289d89e` ([CI 36982455436](https://github.com/sveltery/base/actions/runs/36982455436)) recorded all twenty-four results, then failed exact stage ordering for later React probes. The route reused one mounting host; React's retained delegated listener preceded newly installed observers on remount. [The failed matrix](browser-failed-reused-host-results.json) preserves those observations. Each probe now creates, owns and removes a fresh host; original stage/value/FormData assertions remain unchanged. This is a fixture repair, not a relaxed expected ordering or parity credit. Browser JSON is written into test output before attachment so passing runs also retain it in hosted artifacts.
