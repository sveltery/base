# SvelteKit remote submit and reset compatibility

SvelteKit 2.70.3's remote form attachment submits an already canceled event. That prevents ordinary `onsubmit` cancellation and Base Form's synchronous Field validation from blocking a remote request. Sveltery retains the original Form validation, focus and cancellation sequence; the explicit Kit patch makes Kit honor that sequence. Applications using Kit 2.70.3 must apply it when they rely on synchronous Form validation or authored submit cancellation. It is optional for applications that do not rely on that contract. The same patch also fixes Kit’s remote field owner remaining stale after a trusted native reset. Applications using that reset contract must apply it too.

## Application setup

This repository applies a reviewable two-line patch through pnpm's `patchedDependencies`. The patch is also included in the Base package's `patches` directory. It is required application setup for these cancellation and native-reset contracts on Kit 2.70.3, not a Sveltery runtime dependency or an automatic postinstall modification. Installing Base alone does not fix Kit.

For a pnpm application with **Kit pinned to 2.70.3**, copy the patch from the installed Base package into the application:

```sh
mkdir -p patches
cp node_modules/@sveltery/base/patches/@sveltejs__kit@2.70.3.patch patches/
```

Add this entry to the application's `pnpm-workspace.yaml`, retaining its existing settings:

```yaml
patchedDependencies:
  '@sveltejs/kit@2.70.3': patches/@sveltejs__kit@2.70.3.patch
```

Then install and commit the patch, configuration and resulting lockfile:

```sh
pnpm install
pnpm install --frozen-lockfile
```

The repository verifies this setup with pnpm **12.6.0**. Other package managers need their own explicit patch configuration; no compatibility claim is made for an unapplied patch. Do not apply this version-specific patch to a different Kit release. Once a supported Kit release supplies the cancellation behavior, verify its source and the submission/reset regressions before removing the patch.

## Behavior and boundaries

The patch adds `if (event.defaultPrevented) return;` at the start of Kit's existing remote attachment submit listener. Canceled attempts leave Kit's pending/submitted state unchanged and run neither preflight nor the enhancement callback. Other ordinary event listeners still execute.

For uncanceled attempts, the existing Kit implementation owns preflight, the caller's `.enhance(callback)`, event-specific FormData and submitter, `.submit().updates(...)`, result/pending state, redirects and reset. No callback is wrapped, replaced or invoked twice. Custom enhancement continues to own its reset decision. The default enhancement keeps its existing success reset.

This honors cancellation present **before Kit's listener executes**. Svelte's declarative Form handler runs before descriptor attachments, including forwarded replacement-form props and hydration. Cancellation from a bubble listener registered after Kit, or from an ancestor after Kit's own listener, cannot be distinguished from Kit's own `preventDefault`; it is outside this patch's contract. Asynchronous event handlers must cancel synchronously, as with ordinary HTML submission. Source asynchronous Field validation can report errors but cannot cancel a submit that has already proceeded.

Calling `remote.submit()` directly remains Kit's programmatic API; it does not dispatch a native submit event or run Form validation. Use the normal submit button or native `requestSubmit()` when that event/validation flow is required.

## Native reset timing

Kit 2.70.3's reset listener awaits Svelte `tick()` and then reads FormData into its field owner. A trusted browser reset can drain those microtasks before applying the native default action. Text and checkbox DOM values then reset correctly, while Kit's field owner keeps the edited values; controlled remote consumers consequently receive stale values.

The patch retains `await tick()` and adds only `await new Promise((resolve) => setTimeout(resolve, 0));` before the existing FormData snapshot. The native task runs after the reset default action. This leaves the native input/defaultChecked behavior intact and restores the owner to the actual form values; an unchecked optional boolean is omitted from FormData and reads as undefined. Reset synchronization is asynchronous and is not guaranteed after `tick()` alone, including programmatic resets.

No reset-cancellation guard is added. As in the original SDK, a prevented reset preserves the edited DOM and field owner but clears Kit's issues and touched state. Both a prior declarative handler and a later ordinary listener can prevent the native reset. The pending/submitted/result and caller enhancement algorithms remain unchanged. A reset during held preflight does not replace the already captured submission FormData. The default and caller-owned successful programmatic resets retain their existing decisions.

The original failure was independently observed in [remote API phase run 37104502038](https://github.com/sveltery/base/actions/runs/37104502038) at `d0ad5cf920680a7620e45bfa9706d842989ca0d4`: literal Kit and source-controlled inputs still had edited DOM/FormData during the reset listener, microtask and public Svelte tick; the next task had reset DOM/FormData but stale Kit owner. The literal programmatic reset already copied defaults correctly. The original failing false expectations are retained. PM authorized this bounded timing correction after the observed failure. The implementation and executed gates are separate from exact-head PM acceptance and landing; [PR #49](https://github.com/sveltery/base/pull/49) records the current decision and merge status.

## Source and verification

- Kit version: **2.70.3**, MIT, immutable release commit [`39e8e1fbd4feba7f22dd46bfdf7335362c38de16`](https://github.com/sveltejs/kit/blob/39e8e1fbd4feba7f22dd46bfdf7335362c38de16/packages/kit/src/runtime/client/remote-functions/form.svelte.js).
- Original remote form source SHA-256: `40ef548ea4da3e79a305ae25113506f1e019c4a7ef78d526c69dea23ee440401`.
- Patched remote form source SHA-256: `59111bd0acd8a9264ff2340395d32e22696ee5c6249f31b3ff7877bed39d2202`.
- [Package patch](../packages/base/patches/@sveltejs__kit@2.70.3.patch) and [upstream license](../packages/base/patches/LICENSE.sveltekit).
- Explicit compatibility approach: [PR #49](https://github.com/sveltery/base/pull/49) applies these explicit dependency corrections for prior-event cancellation and native reset timing, retaining the original Base Form business sequence and caller-owned Kit enhancement. Unpatched Kit is not supported for these cancellation/native-reset contracts. Executed SDK checks do not themselves grant PM acceptance or landing; use PR #49 for that decision status.

At the historical cancellation-only checkpoint `5d736ee2d81b6012276736240ef0416089c38b69`, [SDK run 37100205695](https://github.com/sveltery/base/actions/runs/37100205695) passed twelve patched acceptance cases and five isolated unpatched witnesses. [CI run 37100205690](https://github.com/sveltery/base/actions/runs/37100205690) passed all eight jobs, including 2,032 combined browser cases. This is executed evidence for the documented cancellation boundary; the complete typed remote API and B2 remain separate, incomplete follow-up scope in [PR #52](https://github.com/sveltery/base/pull/52).

The patch source/installation checks and dedicated secured-browser fixtures record acceptance separately. The seven added reset cases exercise trusted/native, public programmatic, default and caller-owned successful resets, prior/later canceled reset issues/touched behavior, and reset during held preflight. These cases completed in the repaired `8c6dfc5` SDK run below; the earlier 12/5 results remain cancellation-only evidence. Unmodified Kit is retained as an explicit negative control in its own isolated workflow setup. That witness uses the same authored cancellation and Field rejection but expects Kit to send the request; it does not establish compatibility or upstream assertion credit. Patched acceptance requires zero remote POSTs and zero server counter changes for invalid/canceled attempts, followed by exactly one request and mutation on the next valid submission.

Browser execution must use Chromium's sandbox and zero retries. Build/type/installation checks alone do not establish browser acceptance. A proposed PR or green dependency check does not establish the full Field/Form API's completion.

The existing nine direct Input/native Kit cases also run in both SDK lanes. Their four reset cases wait for a fixture-only observer registered after Kit, which yields the listener microtask, awaits public tick and a native task, and records actual FormData, owner, issues and cancellation at that boundary before publishing its settled count. Patched uncanceled reset requires the owner to match native seed values; the isolated original SDK keeps the observed stale owner expectation, and canceled reset keeps edited values in both lanes. DOM defaults, issue clearing and unchanged callbacks remain asserted, with zero reset/edit POSTs and a positive subsequent edit. The [original complete test bytes and provenance](../parity/input/kit-reset-original/README.md) remain preserved. All 28 patched and 21 original-SDK cases completed at the exact repaired checkpoint recorded below.

Completed acceptance at `8c6dfc500e8d6d483fa28b652e9454d2e3a11ea2`: [SDK run 37106897373](https://github.com/sveltery/base/actions/runs/37106897373) passed [28/28 patched cases](https://github.com/sveltery/base/actions/runs/37106897373/job/111157081810) and [21/21 isolated original-SDK cases](https://github.com/sveltery/base/actions/runs/37106897373/job/111157081949). Both lanes include all seven dedicated reset cases and all nine existing Input/native remote cases. The four inherited reset cases prove the captured boundary values directly: patched uncanceled owner equals the native seed, original-SDK owner retains the edited value, and canceled reset preserves edited values in both; issues clear, reset/edit sends no POST, and subsequent input updates the owner. The fresh independent SDK/P1 review is clean, SHA-256 `bfb5d656cd4fe79a2bf0b81e078cbc3d02f91bd0b31513d0b7128757147cb199`; [configured review 5966848149](https://github.com/sveltery/base/pull/49#issuecomment-5966848149) is clean.

Runtime-identical canonical refresh `1157b66e352d56e652338eda8fe480351277d227` passed [SDK run 37107820240](https://github.com/sveltery/base/actions/runs/37107820240) and [source run 37107820259](https://github.com/sveltery/base/actions/runs/37107820259), with a clean independent identity review, SHA-256 `d9d380c828ac681593475d7877e63c2745ec62908ef04f2a0bd2bc121609dbd1`. At documentation checkpoint `8490945be51375fbbe104e855f31ab960ac9f619`, the unchanged product passed [SDK acceptance 37108376514](https://github.com/sveltery/base/actions/runs/37108376514), [Standards job 111161295618](https://github.com/sveltery/base/actions/runs/37108376607/job/111161295618) and [Verification job 111161295594](https://github.com/sveltery/base/actions/runs/37108376607/job/111161295594). Exact-head PM approval and merge were not yet recorded at that checkpoint; [PR #49](https://github.com/sveltery/base/pull/49) holds subsequent required-check, review and acceptance receipts. These results do not establish full Remote API/B2 completion.
