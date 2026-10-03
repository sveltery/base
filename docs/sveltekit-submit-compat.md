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

The original failure was independently observed in [remote API phase run 37104502038](https://github.com/sveltery/base/actions/runs/37104502038) at `d0ad5cf920680a7620e45bfa9706d842989ca0d4`: literal Kit and source-controlled inputs still had edited DOM/FormData during the reset listener, microtask and public Svelte tick; the next task had reset DOM/FormData but stale Kit owner. The literal programmatic reset already copied defaults correctly. The original failing false expectations are retained. This timing correction is an explicit PM-authorized implementation proposal in PR #49; final acceptance and merge remain pending.

## Source and verification

- Kit version: **2.70.3**, MIT, immutable release commit [`39e8e1fbd4feba7f22dd46bfdf7335362c38de16`](https://github.com/sveltejs/kit/blob/39e8e1fbd4feba7f22dd46bfdf7335362c38de16/packages/kit/src/runtime/client/remote-functions/form.svelte.js).
- Original remote form source SHA-256: `40ef548ea4da3e79a305ae25113506f1e019c4a7ef78d526c69dea23ee440401`.
- Patched remote form source SHA-256: `59111bd0acd8a9264ff2340395d32e22696ee5c6249f31b3ff7877bed39d2202`.
- [Package patch](../packages/base/patches/@sveltejs__kit@2.70.3.patch) and [upstream license](../packages/base/patches/LICENSE.sveltekit).
- Proposed compatibility approach: [PR #49](https://github.com/sveltery/base/pull/49) applies these explicit dependency corrections for prior-event cancellation and native reset timing, retaining the original Base Form business sequence and caller-owned Kit enhancement. Unpatched Kit is not supported for these cancellation/native-reset contracts. No final acceptance decision is recorded; merge remains pending.

At `5d736ee2d81b6012276736240ef0416089c38b69`, [SDK run 37100205695](https://github.com/sveltery/base/actions/runs/37100205695) passed twelve patched acceptance cases and five isolated unpatched witnesses. [CI run 37100205690](https://github.com/sveltery/base/actions/runs/37100205690) passed all eight jobs, including 2,032 combined browser cases. This is executed evidence for the documented cancellation boundary; the complete typed remote API and B2 remain separate, incomplete follow-up scope in [PR #52](https://github.com/sveltery/base/pull/52).

The patch source/installation checks and dedicated secured-browser fixtures record acceptance separately. The seven added reset cases exercise trusted/native, public programmatic, default and caller-owned successful resets, prior/later canceled reset issues/touched behavior, and reset during held preflight. Their final patched and isolated original-SDK browser runs remain pending; the earlier 12/5 cancellation results do not establish reset acceptance. Unmodified Kit is retained as an explicit negative control in its own isolated workflow setup. That witness uses the same authored cancellation and Field rejection but expects Kit to send the request; it does not establish compatibility or upstream assertion credit. Patched acceptance requires zero remote POSTs and zero server counter changes for invalid/canceled attempts, followed by exactly one request and mutation on the next valid submission.

Browser execution must use Chromium's sandbox and zero retries. Build/type/installation checks alone do not establish browser acceptance. A proposed PR or green dependency check does not establish the full Field/Form API's completion.
