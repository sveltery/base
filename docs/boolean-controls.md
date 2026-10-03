# Checkbox, Switch and CheckboxGroup

The checked controls port the real Base UI 1.8.0 component composition at immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, with native Svelte runes, snippets, context and attachments. Each root owns one hidden native checkbox, source checked-state callbacks and actual Field registration/validation. Switch is a checked form control; Toggle is a pressed button and does not substitute for a checkbox's form value.

```svelte
<script lang="ts">
  import { Field, Form, Switch } from '@sveltery/base';
</script>

<Form>
  <Field.Root name="enabled">
    <Field.Label>Notifications</Field.Label>
    <Switch.Root required>
      <Switch.Thumb />
    </Switch.Root>
    <Field.Error />
  </Field.Root>
</Form>
```

`Checkbox.Root` exposes `checked`, `defaultChecked`, `onCheckedChange`, `indeterminate`, `parent`, `disabled`, `readOnly`, `required`, `name`, `value`, `uncheckedValue`, `form`, `inputRef` and `nativeButton`. `Checkbox.Indicator` mounts for checked or indeterminate state and supports `keepMounted` and the shared CSS transition lifecycle. `Switch.Root` has the corresponding boolean control props, and `Switch.Thumb` reflects root state. The roots default to a span with the appropriate ARIA role and a hidden checkbox sibling. A native button replacement must set `nativeButton` and spread all render props, including the attachment symbol.

```svelte
<Switch.Root nativeButton>
  {#snippet render(props, state, children)}
    <button {...props} aria-label="Notifications">
      {@render children?.()}
    </button>
  {/snippet}
  <Switch.Thumb />
</Switch.Root>
```

The source callback receives `onCheckedChange(nextChecked, details)`. The native event in `details.event` is the hidden checkbox's click. `details.cancel()` prevents the cancelable checkbox activation, so the browser rolls checked state back before emitting input/change events. The callback runs before component state mutation; group callbacks retain their source order and cancellation checks. There is no React checked tracker, activation replay or reset restoration kernel. Merely assigning a checked prop fixes the initial controlled mode; native Svelte does not force an unchanged checked value back after an accepted activation.

The `name` on ordinary Field.Root takes source precedence over a root's name prop. Field.Label and Field.Description associate the actual visible control/hidden input through the canonical labelable context. The forthcoming remote adapter owns encoded submission-name resolution and Kit descriptor defaults; this source core does not infer Kit metadata or import SvelteKit.

CheckboxGroup owns one array-valued Field registration while children register their real native inputs. `allValues` enables the source parent-selection algorithm, including mixed state, disabled child values and the parent's live `aria-controls` list. Parent checkboxes have no submitted name. Field.Item supplies each child's own label scope. Group successful form values exclude disabled or externally associated inputs.

Native checkbox Enter handling uses a small per-root final bubble listener instead of React's separate synthetic/native default-prevention flags. It respects ancestor `preventDefault`, invokes the original default form submitter and prevents ordinary button activation. Native `stopPropagation` prevents that listener, and a window handler registered later cannot retroactively cancel an earlier handler. Custom native buttons retain native default activation when propagation is stopped. These boundaries require actual browser evidence and receive no unchanged React assertion credit.

The source dependency map and original assertion evidence are in [parity/boolean-controls](../parity/boolean-controls/README.md). Full compatibility and exact-head acceptance remain pending; module availability is distinct from complete test parity.
