# SvelteKit remote submit cancellation

SvelteKit 2.70.3's remote form attachment submits an already canceled event. That prevents ordinary `onsubmit` cancellation and Base Form's synchronous Field validation from blocking a remote request. Sveltery retains the original Form validation, focus and cancellation sequence; the explicit Kit patch makes Kit honor that sequence. Applications using Kit 2.70.3 must apply it when they rely on synchronous Form validation or authored submit cancellation. It is optional for applications that do not rely on that contract.

## Application setup

This repository applies a reviewable one-line patch through pnpm's `patchedDependencies`. The patch is also included in the Base package's `patches` directory. It is required application setup for this cancellation contract on Kit 2.70.3, not a Sveltery runtime dependency or an automatic postinstall modification. Installing Base alone does not fix Kit.

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

The repository verifies this setup with pnpm **12.6.0**. Other package managers need their own explicit patch configuration; no compatibility claim is made for an unapplied patch. Do not apply this version-specific patch to a different Kit release. Once a supported Kit release supplies the cancellation behavior, verify its source and the submission regressions before removing the patch.

## Behavior and boundaries

The patch adds `if (event.defaultPrevented) return;` at the start of Kit's existing remote attachment submit listener. Canceled attempts leave Kit's pending/submitted state unchanged and run neither preflight nor the enhancement callback. Other ordinary event listeners still execute.

For uncanceled attempts, the existing Kit implementation owns preflight, the caller's `.enhance(callback)`, event-specific FormData and submitter, `.submit().updates(...)`, result/pending state, redirects and reset. No callback is wrapped, replaced or invoked twice. Custom enhancement continues to own its reset decision. The default enhancement keeps its existing success reset.

This honors cancellation present **before Kit's listener executes**. Svelte's declarative Form handler runs before descriptor attachments, including forwarded replacement-form props and hydration. Cancellation from a bubble listener registered after Kit, or from an ancestor after Kit's own listener, cannot be distinguished from Kit's own `preventDefault`; it is outside this patch's contract. Asynchronous event handlers must cancel synchronously, as with ordinary HTML submission. Source asynchronous Field validation can report errors but cannot cancel a submit that has already proceeded.

Calling `remote.submit()` directly remains Kit's programmatic API; it does not dispatch a native submit event or run Form validation. Use the normal submit button or native `requestSubmit()` when that event/validation flow is required.

## Source and verification

- Kit version: **2.70.3**, MIT, immutable release commit [`39e8e1fbd4feba7f22dd46bfdf7335362c38de16`](https://github.com/sveltejs/kit/blob/39e8e1fbd4feba7f22dd46bfdf7335362c38de16/packages/kit/src/runtime/client/remote-functions/form.svelte.js).
- Original remote form source SHA-256: `40ef548ea4da3e79a305ae25113506f1e019c4a7ef78d526c69dea23ee440401`.
- Patched remote form source SHA-256: `00b87303b7d268906809f889b2e342fdee89bd03dd417023a5fd055d94b518b1`.
- [Package patch](../packages/base/patches/@sveltejs__kit@2.70.3.patch) and [upstream license](../packages/base/patches/LICENSE.sveltekit).
- Proposed compatibility approach: [PR #49](https://github.com/sveltery/base/pull/49) applies this explicit dependency correction for prior-event cancellation, retaining the original Base Form business sequence and caller-owned Kit enhancement. Unpatched Kit is not supported for this cancellation contract. No final acceptance decision is recorded; merge remains pending.

At `5d736ee2d81b6012276736240ef0416089c38b69`, [SDK run 37100205695](https://github.com/sveltery/base/actions/runs/37100205695) passed twelve patched acceptance cases and five isolated unpatched witnesses. [CI run 37100205690](https://github.com/sveltery/base/actions/runs/37100205690) passed all eight jobs, including 2,032 combined browser cases. This is executed evidence for the documented cancellation boundary; the complete typed remote API and B2 remain separate, incomplete follow-up scope in [PR #52](https://github.com/sveltery/base/pull/52).

The patch source/installation checks and dedicated secured-browser fixture record acceptance separately. Unmodified Kit is retained as an explicit negative control in its own isolated workflow setup. That witness uses the same authored cancellation and Field rejection but expects Kit to send the request; it does not establish compatibility or upstream assertion credit. Patched acceptance requires zero remote POSTs and zero server counter changes for invalid/canceled attempts, followed by exactly one request and mutation on the next valid submission.

Browser execution must use Chromium's sandbox and zero retries. Build/type/installation checks alone do not establish browser acceptance. A proposed PR or green dependency check does not establish the full Field/Form API's completion.
