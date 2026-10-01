# Contained nonmodal Portal focus slice

Baseline main: `25012fc221fd5604936f2e8e1a2837ea2eb1ff07` (PR #8), secured main CI [36860151005](https://github.com/sveltery/base/actions/runs/36860151005), 116 browser executions. Immutable upstream: Base UI v1.8.0, `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Derived scenarios retain MIT attribution in [UPSTREAM_LICENSE](UPSTREAM_LICENSE).

## Selected source contracts

- [FloatingPortal.tsx:183–299](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/floating-ui-react/components/FloatingPortal.tsx#L183): open nonmodal guards sit at the logical Portal position, independently of the owning Trigger. Portal capture focusin/focusout suppresses physical portal tabbability while focus is outside, restoring saved attributes on entry/reopen. Forward outside guard moves to the next control and explicitly requests `focus-out` with the native focusin event; backward guard moves to the previous control.
- [FloatingFocusManager.tsx:954–1010](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx#L954): guards around Popup connect the two DOM locations. Reverse exit returns through the before-outside guard; forward exit suppresses focus return when focus-out closing is enabled. `modal !== false` uses trapping rather than logical nonmodal order.
- [FloatingFocusManager.tsx:406–575](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx#L406): native focusout checks relatedTarget asynchronously; floating/portal, registered Triggers and owned guards are inside. Null relatedTarget alone does not dismiss. Popup capture tracks movement inside the logical tree. Pointer suppression and previous-focus exclusion also affect dismissal. Programmatic focus must be compared against the actual React adapter before choosing assertions.
- [DialogPopup.tsx:96–107](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/dialog/popup/DialogPopup.tsx#L96): mounted presence enables focus management, `modal !== false` traps, and `disablePointerDismissal` disables focus-out closing as well as pointer dismissal. Disabling dismissal does not disable logical Tab order.
- [tabbable.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/floating-ui-react/utils/tabbable.ts): next/previous navigation uses the current focus in document order; reference is a fallback. Suppression stores/restores original tabindex. It does not reorder Popup next to the active Trigger.

## Bounded approach and evidence

Add paired actual React/Svelte hosted browser scenarios before runtime changes. Use local Portal context for outside guard references and Popup attachment for inside guards; reuse existing overlay topmost ownership and isolation. No new per-document state, public props, dependencies, workflows or browser-security settings. Preserve guards/tabindex cleanup on close, keepMounted reopen, and Portal removal. Programmatic relatedTarget behavior is measured separately before final regression assertions.

All scenarios in `tests/browser/dialog-nonmodal-focus.spec.ts` are source-derived supplements. No complete upstream declaration credit is claimed: global **15/633**, Dialog **11/175**, expanded **13/371** remain unchanged. Detached handles, Viewport, Drawer/Toast and arbitrary external portal mutations are excluded. Material public API deviation or a large rewrite is a stop gate.

Verification and independent exact-head review evidence will be recorded after hosted execution.
