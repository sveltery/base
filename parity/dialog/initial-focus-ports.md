# Popup initialFocus leaf ports

Source: Base UI **v1.8.0**, commit **`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`**, [DialogPopup.test.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/dialog/popup/DialogPopup.test.tsx). Derived fixtures and assertions retain the [MIT notice](UPSTREAM_LICENSE). Base: main `a0a2c655e591feac6dca06697e484e7fd624a074`.

This is an execution overlay on the byte-exact [source inventory](upstream-inventory.json). The source tracer remains unchanged and regenerates its original `unported`/`port=null` candidates; the parent-owned shared manifest is unchanged. Credit these four entries only after all three CI jobs pass on the independently reviewed PR head. [PR #5](https://github.com/sveltery/base/pull/5) records that exact-head evidence and review. There are no approved behavioral deviations.

| Declaration / single variant | Complete source fixture | Ordered retained assertions |
| --- | --- | --- |
| P:92 / Popup | Nonmodal closed Root, Trigger, Portal, Popup with stable input-2 ref; input-1, input-2, input-3, ordinary Close button; outside input before and after Root | Programmatic `trigger.click()`; input-2 focused (source assertion :123) |
| P:287 / Popup | Nonmodal closed Root, Trigger, Portal, Popup with callback returning true; input-1 | User click Open; input-1 focused (:306) |
| P:310 / Popup | Same topology as P:287; callback returns null | User click Open; input-1 focused (:329) |
| P:333 / Popup | Nonmodal closed Root, Trigger, Portal, Popup with stable element-returning callback; input-1, input-2 ref, actual Dialog.Close | User click Open; input-2 focused (:367); callback count exactly 1 (:370); user click Close; Trigger focused (:376); callback count still exactly 1 (:379) |

All four declarations have `parameterAxes=[]`, `variants=[{}]`, `appliesTo=['Popup']`, no source conditions and no upstream guards. Each browser test executes separately in React and Svelte: **eight executions**, covering **four declarations / four expanded records**, not eight credited records. Source inventory totals remain **175 declarations / 371 candidate records**; once accepted, the overlay gives **4 complete ports / 171 unported declarations** and **4 complete ports / 367 unported candidate records**. Source conditions/guards on the remaining candidates still apply; this is not a whole-library passing-test denominator.

## Fixture and assertion adaptations

- [Browser leaf tests](../../tests/browser/dialog-initial-focus.spec.ts) use dedicated `/initial-focus` pages, [Svelte fixture](../../apps/fixtures/src/lib/InitialFocusFixture.svelte) and [React reference fixture](../../apps/fixtures/src/lib/initial-focus-reference.ts). The React dependency remains pinned to `@base-ui/react@1.8.0` in the fixture workspace. No runtime dependencies or lockfiles change.
- P:92 retains the programmatic click rather than replacing it with pointer input. Source `expect(input2).to.toHaveFocus()` contains an extra `.to`; Playwright's `toBeFocused()` preserves the actual focus assertion. P:287/310/333 use Playwright user clicks. React mounting/`act`/`waitFor` adapt to actual page mounting and polling one observation at a time.
- Svelte uses a stable nonreactive `{ current }` ref populated by an attachment on input-2, with identity-checked teardown. This adapts React's `useRef` without derived-state effects. Callback identity remains stable for P:333. The React spy becomes a counter incremented on each actual callback invocation; the same counter is observed before and after closing. Svelte's counter also exposes invocations to the DOM companion via `record`.
- An inert output outside Root observes callback count; it adds no focusable nodes. A `data-hydrated` marker gates mounting, and browser page errors are additionally required to remain empty. Native layout/focus are never mocked in Chromium.
- [Four jsdom companions](../../packages/base/tests/dom/initial-focus.test.ts) mount the same Svelte fixture and test actual focus/callback wiring. jsdom supplies no layout, so the companion explicitly stubs input `getClientRects()` for the runtime's visibility check and restores it on teardown. This companion provides zero independent browser parity credit.

## Test-first evidence and boundaries

The initial tests were committed in `ec25938f015e333d18c039334f2b16aa18acf84d` before runtime edits. Initial checks found a React `createElement` data-attribute typing error, a Svelte host-ref warning, and jsdom's absent layout; only the fixture typing/ref and documented geometry adapter were corrected. The existing Popup/overlay runtime requires no change for this slice.

Reproduce with Node 24.x / pnpm 12.6.0:

```sh
bash scripts/bootstrap.sh
node parity/dialog/inventory.mjs /workspace/base-ui-upstream --check
bash scripts/verify.sh
bash .github/standards/check.sh
pnpm exec playwright test --list
pnpm test:browser
```

Chromium uses the existing secured hosted job: official browser, Ubuntu 22.04, `chromiumSandbox: true`, one worker, zero retries. Local helper/CDN restrictions remain as previously documented; no local bypass is attempted. Browser collection is not execution evidence. The final PR must pass Standards, Verification and Dialog browser; parent report/merge coordination follows independent exact-head review.

The existing **seven shared React/Svelte scenario traces** and **23 additional Svelte supplemental probes** remain unchanged: **37 prior executions + 8 new leaf executions = 45 browser executions**. No shared probe gains additional leaf credit. Other initialFocus cases, finalFocus, handles, Drawer and Toast remain outside this slice.
