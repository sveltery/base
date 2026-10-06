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

The source callback receives `onCheckedChange(nextChecked, details)`. The native event in `details.event` is the hidden checkbox's click. `details.cancel()` prevents the cancelable checkbox activation, so the browser rolls checked state back before emitting input/change events. The callback runs before component state mutation; group callbacks retain their source order and cancellation checks. React's source cancellation instead restores checked state while native input/change events still fire; this native event-phase difference is recorded separately.

The hidden input uses native Svelte function `bind:checked`, with `defaultChecked` forwarded as an ordinary input default. Ungrouped uncontrolled roots restore the authored default on native form reset and synchronize visible state, Field state and FormData; reset does not call `onCheckedChange`. Controlled owners must update their checked value on accepted changes and resets, or call `details.cancel()` to reject an activation. As with a literal Svelte bound input, keeping the same owner value does not restore the browser's changed checked property. There is no checked tracker, activation replay, default-rewriting effect or extra reset listener.

Public optional props preserve the source's explicit `undefined` support, including with TypeScript `exactOptionalPropertyTypes`. `inputRef` accepts `null`, a mutable `{ current }` ref or a callback ref; native element `ref` remains a bindable element value.

Svelte 5.57.1's bound-input reset timing has a measured native limit: canceling a real reset-button event at the form target still resets the bound value before that cancellation. A literal Svelte checkbox and these source roots behave alike in secured Chromium. An imperative reset canceled within the same JavaScript call preserves state. The original source's React renderer preserves state in the canceled button case; this framework difference is retained in the browser evidence.

The `name` on ordinary Field.Root takes source precedence over a root's name prop. Field.Label and Field.Description associate the actual visible control/hidden input through the canonical labelable context. The forthcoming remote adapter owns encoded submission-name resolution and Kit descriptor defaults; this source core does not infer Kit metadata or import SvelteKit.

Outside Field, native wrapping or associated labels supply the ARIA fallback. The native observer follows the actual control tree, including a ShadowRoot, when labels mount, their `id` or `for` changes, or they unmount. Explicit `aria-labelledby` and Field label context retain source precedence. The original React helper refreshes associations after each React commit; the Svelte replacement observes the native label tree and disconnects on teardown.

CheckboxGroup owns one array-valued Field registration while children register their real native inputs. `allValues` enables the source parent-selection algorithm, including mixed state, disabled child values and the parent's live `aria-controls` list. Parent checkboxes have no submitted name. Field.Item supplies each child's own label scope. Group successful form values exclude disabled or externally associated inputs.

CheckboxGroup owns its children's checked values, including when the group uses `defaultValue`. Native reset changes the children's native checked defaults without resetting the group-owned array. Reset the owner's group value alongside your form state to keep the logical selection aligned; native successful controls and consolidated submitted values follow the actual inputs. Actual Base UI's group also retains its logical array after native reset. This source group has no additional reset policy.

Native checkbox Enter handling uses a small per-root final bubble listener instead of React's separate synthetic/native default-prevention flags. It respects ancestor `preventDefault`, invokes the original default form submitter and prevents ordinary button activation. Native `stopPropagation` prevents that listener, and a window handler registered later cannot retroactively cancel an earlier handler. Custom native buttons retain native default activation when propagation is stopped. These boundaries require actual browser evidence and receive no unchanged React assertion credit.

The source dependency map and original assertion evidence are in [parity/boolean-controls](../parity/boolean-controls/README.md). Full compatibility and exact-head acceptance remain pending; module availability is distinct from complete test parity.

## Native host bindings

The native snippet successor replaces callback/object `inputRef` transport with optional bindable `HTMLInputElement | null | undefined`. Use `bind:inputRef` to observe the actual input; RadioGroup retains its selected/enabled representative-input registration business. `bind:ref` and native attachment props supply visible-host integration. See [native rendering](rendering.md). Historical Original assertions and receipts retain their provenance; divergent native binding assertions earn zero unchanged upstream credit.
