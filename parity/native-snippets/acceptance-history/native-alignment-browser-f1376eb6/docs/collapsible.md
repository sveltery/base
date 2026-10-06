# Collapsible

This bounded slice implements `Root`, `Trigger` and `Panel` against Base UI v1.8.0, immutable pin `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. [The assertion record](../parity/collapsible/README.md) distinguishes 41 portable ordinary declaration sites / 43 variants from six deferred React.Activity declarations and separate conformance/type/supplemental evidence. This branch integrates the public root/subpath exports after Progress's stable shared checkpoint; final acceptance remains separate.

```svelte
<script lang="ts">
  import { Collapsible } from '@sveltery/base';
</script>

<Collapsible.Root
  defaultOpen={false}
  onOpenChange={(open, details) => {
    // Observe the request or call details.cancel() before the state write.
  }}
>
  <Collapsible.Trigger>Show details</Collapsible.Trigger>
  <Collapsible.Panel>Details</Collapsible.Panel>
</Collapsible.Root>
```

Root renders a div and accepts ordinary native div props. Defaults are `defaultOpen=false` and `disabled=false`. The initial controlled mode and initial default stay fixed for the component lifetime. If an initially controlled value later becomes undefined, the pinned helper falls back to that initial default while preserving the mode warning and refusing uncontrolled writes. `open` controls the owner state; `onOpenChange(nextOpen, details)` requests a change and waits for an external update when controlled. The trigger request negates the last rendered open snapshot, calls the rendered callback before state commit and supplies reason `trigger-press`. `details.cancel()` vetoes that state change without canceling native defaults or propagation. A beforematch request supplies reason `none`. There is no actions API or `onOpenChangeComplete` callback.

Trigger renders a button with `nativeButton=true`, `focusableWhenDisabled=true`, `aria-expanded`, open-only `aria-controls` and `data-panel-open`. Its disabled prop inherits Root disabled unless explicitly supplied; `disabled=false` enables activation under a disabled Root. Rendered state callbacks and Root-derived attributes still describe the Root disabled state, matching upstream. A disabled native Trigger stays focusable with aria-disabled and suppresses activation. Unlike Toggle, Trigger retains native `type`, `form` and `value`; it can submit or reset the specified native form. Custom replacement hosts use `nativeButton=false` and the existing Button keyboard/event behavior.

Panel defaults to unmounted while closed. `keepMounted` retains a hidden closed host. `hiddenUntilFound` keeps the host mounted with `hidden="until-found"`, overrides keepMounted and preserves the upstream warning when keepMounted is explicitly false. A successful browser beforematch opens immediately with temporary zero duration; a canceled request leaves the next trigger open animated. IDs track explicit changes, component removal and remount; a closed Trigger omits aria-controls even if its Panel is retained.

CSS motion uses `data-starting-style`, `data-ending-style`, `data-open` and `data-closed`. The state callback includes transition status `starting`, `idle`, `ending` or undefined. The pin retains `idle` after an unanimated close when unmount bookkeeping cancels the deferred ending phase; a retained hidden Panel reports that status too ([#33](https://github.com/sveltery/base/issues/33)). This behavior is preserved. If a custom render snippet removes its host on close, the pin retains `ending` in Root/Trigger callbacks and their ending attributes; the port preserves that too ([#34](https://github.com/sveltery/base/issues/34)). Panel publishes measured `--collapsible-panel-height` and `--collapsible-panel-width` before closing styles apply, and returns the measurements to `auto` after an accepted open completion. Initial-open keyframes are suppressed, including authored inline animation names; later closes and opens animate normally. Temporary alignment/duration styles are restored at the corresponding lifecycle boundary. Component-owned frames and animation completions are canceled after reopen, replacement or teardown. Missing getAnimations and `BASE_UI_ANIMATIONS_DISABLED` complete promptly.

Composition uses the accepted framework substitutions: class instead of className, CSS strings instead of React style objects, children/render snippets, native event props, bind:ref and attachments. Replacement snippets must spread supplied props, including attachment symbols; use mergeProps to compose consumer events. Named CollapsibleRootProps/State, CollapsibleTriggerProps/State, CollapsiblePanelProps/State, CollapsibleTransitionStatus and change reason/detail types replace React namespace type aliases; the ten adapted type assertions are separate evidence. Complete shared conformance is not claimed. The initially undefined ref contract follows accepted [A-01](upstream-differences.md#a-01-approved-proposed-core-audit-repairs-and-substitutions).

The shared Button helper's disabled-mousedown default-focus correction [D-03](upstream-differences.md#d-03-disabled-chorded-mousedown-default-focus) is inherited without modification or new parity credit. Paired exact-pin Chromium reproduced value-only alignment restoration losing authored `!important` priority ([#30](https://github.com/sveltery/base/issues/30)) and beforematch remaining attached to the original rendered host after replacement ([#31](https://github.com/sveltery/base/issues/31)). This port preserves both behaviors; corrections are deferred. React.Activity effect suspension remains explicitly deferred. See [compatibility](../parity/collapsible/compatibility.md) and [verification](../parity/collapsible/verification.md) for decision and final-head gate status.
