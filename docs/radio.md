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

Root renders a span by default. A native Svelte `render` snippet receives merged props, state and children; use `nativeButton` when rendering an actual button. `Indicator` follows source transition presence and supports `keepMounted`. Arrow keys select and move among enabled options with RTL direction, while Space activates on keyup and Enter does not select. Selectable options and labels are authored rather than inferred from schema metadata.

The [complete source graph and correspondence](../parity/radio/source-correspondence.md) map actual Field, CompositeRoot/List/Item, shared button/label and native Svelte dependencies. Hidden input activation uses one cancelable native click so cancellation precedes input/change. React synthetic checked tracking and restoration are replaced by native Svelte/browser defaults, including controlled owner rejection and reset behavior; actual divergent characterizations earn no unchanged upstream assertion credit. Final independent review, browser acceptance and complete upstream assertion parity remain pending.
