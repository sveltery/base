# Radio and RadioGroup

Radio exposes `Root` and `Indicator`; `RadioGroup` owns the selected value and the source composite navigation context. Both are available from `@sveltery/base` and their corresponding `/radio` and `/radio-group` subpaths.

```svelte
<script lang="ts">
  import { Field, Radio, RadioGroup } from '@sveltery/base';
</script>

<Field.Root name="storageType">
  <Field.Label>Storage type</Field.Label>
  <RadioGroup defaultValue="disk">
    <Field.Item>
      <Field.Label>Disk</Field.Label>
      <Radio.Root value="disk"><Radio.Indicator /></Radio.Root>
    </Field.Item>
    <Field.Item>
      <Field.Label>Cloud</Field.Label>
      <Radio.Root value="cloud"><Radio.Indicator /></Radio.Root>
    </Field.Item>
  </RadioGroup>
</Field.Root>
```

The source Field name takes precedence over the group name, while the optional remote serialization context affects only native hidden input names. Each Radio owns one native radio input; RadioGroup owns the logical value, registration and validation. `inputRef` exposes the representative native input and accepts null. The named props aliases retain the source permissive generic default; explicit generic arguments preserve value and callback type checks. `value`/`defaultValue`, `onValueChange` and event-detail cancellation retain the source API. Options may use strings, numbers, objects or null; hidden values use the source serialization helper.

A standalone Root retains the source empty-value checked fallback. Activating an already selected radio does not mark its Field touched, including this standalone fallback.

Root renders a span by default. A native Svelte `render` snippet receives merged props, state and children; use `nativeButton` when rendering an actual button. `Indicator` follows source transition presence and supports `keepMounted`. Arrow keys select and move among enabled options with RTL direction, while Space activates on keyup and Enter does not select. Selectable options and labels are authored rather than inferred from schema metadata.

Group focus follows its descendants. Moving between radios preserves Field focus; leaving the group marks it touched and commits optional `onBlur` validation. Use native `onfocusin`/`onfocusout` to observe or cancel this bubbling business chain through `event.preventBaseUIHandler()`. Native `onfocus`/`onblur` keep their ordinary nonbubbling DOM behavior, including on custom render hosts.

Secured Chromium witnesses distinguish activation paths: direct hidden-input `.click()` on an actual React 19.2.8 controlled-false radio emits no native input/change events, while a visible root's nested activation emits both. Native Svelte emits both for either path. Source standalone nonempty Radio follows these literal vectors while retaining logical unchecked state and marking Field touched. These bounded native observations earn zero unchanged upstream assertion credit; the recorded JSDOM direct React two-event observation remains separate.

The [complete source graph and correspondence](../parity/radio/source-correspondence.md) map actual Field, CompositeRoot/List/Item, shared button/label and native Svelte dependencies. Hidden input activation uses one cancelable native click so cancellation precedes input/change. React synthetic checked tracking and restoration are replaced by native Svelte/browser defaults, including controlled owner rejection and reset behavior; actual divergent characterizations earn no unchanged upstream assertion credit. Independent source/native/API/maintainability review and all 68 secured browser cases are clear at reviewed head `154cba6`. Final delivery integrates the approved source core from main with those runtime, type and test bodies unchanged; exact delivery checks and PM merge approval remain separate. Complete upstream assertion parity remains incomplete with zero ordinary declaration credit.

The final dependency refresh also includes the approved Boolean controls and type-only remote Field contracts. The source label helper observes the control's actual document or shadow root, and native click construction reuses canonical ownerWindow. Radio's four reviewed focus bodies and browser assertions remain unchanged. Current local graph hashes distinguish those reused helpers from the added type-only module; exact successor-head gates and PM approval remain pending.

The candidate also consumes approved SDK PR #49 from actual main `f1277cd4bed6747865d9d617ca7adf5194e3c2ba`. Its version-specific Kit compatibility patch stays an explicit application opt-in. Radio adds no SDK or Kit runtime dependency; the reviewed source body and native assertion identities are retained.

Shared-host nested Composite rendering preserves the source inner-ref then forwarded-outer-ref order across inner metadata updates, so the outer item's navigation metadata remains authoritative. The canonical native ref transport now composes that complete cleanup/reattachment lifecycle while retaining independently tracked authored Svelte attachments. This fidelity repair follows a reproduced gap at `3061aeb`; its prior 68-case green run remains historical. Fresh70-case secured acceptance and independent final helper/source review are required before PM approval.

Replacing a group `inputRef` while its selected Radio stays mounted does not immediately move the representative ref, matching the pinned original. A subsequent selection publishes the replacement. Teardown uses Svelte's live prop closure, while React's original cleanup captures the old prop: callbacks may clear different ref identities, and object refs may retain a disconnected old or replacement input. [The compatibility record](upstream-differences.md#ra-01-source-radio-composition-and-native-checked-event-ownership) preserves both observed limitations. There is no reactive ref-refresh API or React snapshot emulation.
