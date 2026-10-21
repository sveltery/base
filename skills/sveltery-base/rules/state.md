# State and events

Source: [handbook/customization](https://base.sveltery.dev/handbook/customization.md), [handbook/typescript](https://base.sveltery.dev/handbook/typescript.md#events).

## Contents

- Uncontrolled by default, with `default*` props
- Control with `bind:`
- Reject a change with a function binding or `cancel()`
- Change callbacks receive `eventDetails`
- Stop a part's handler with `event.preventDefault()`
- Imperative methods through `bind:this`

---

## Uncontrolled by default, with `default*` props

Every stateful part manages its own state when nothing is bound. Set the initial value with the matching `default*` prop: `defaultOpen`, `defaultValue`, `defaultChecked`, `defaultPressed`. It is read once at mount. On form controls, `defaultValue` and `defaultChecked` are also the values a form reset restores.

```svelte
<Tabs.Root defaultValue="overview">...</Tabs.Root>
<Checkbox.Root defaultChecked />
<Dialog.Root defaultOpen>...</Dialog.Root>
```

## Control with `bind:`

To read or drive the state from your code, bind it. The binding replaces Base UI's pair of a state prop and its change handler, such as `open` plus `onOpenChange`.

**Incorrect:**

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Dialog.Root {open} onOpenChange={(next) => (open = next)}>...</Dialog.Root>
```

**Correct:**

```svelte
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let open = $state(false);
</script>

<Dialog.Root bind:open>...</Dialog.Root>
<button onclick={() => (open = true)}>Open from elsewhere</button>
```

A bound value wins over the `default*` prop. Common bindings: `bind:open` (popups, Collapsible), `bind:value` (Tabs, Select, Combobox, Slider, RadioGroup, Accordion, ToggleGroup, NumberField, Input), `bind:checked` (Checkbox, Switch), `bind:pressed` (Toggle). Check the API table for the exact name.

## Reject a change with a function binding or `cancel()`

To accept some changes and refuse others, use a [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings):

```svelte
<Select.Root
	bind:value={
		() => value,
		(next) => {
			if (next !== 'locked') value = next;
		}
	}
>
	...
</Select.Root>
```

Or leave the part uncontrolled and cancel the change in its callback (see below).

## Change callbacks receive `eventDetails`

`onOpenChange`, `onValueChange`, `onPressedChange`, and the other change callbacks receive `(value, eventDetails)`.

- `eventDetails.reason`: why it changed, such as `'trigger-press'`, `'outside-press'`, `'escape-key'`, or `'item-press'`. The component's `ChangeReason` type lists every value.
- `eventDetails.event`: the DOM event behind the change.
- `eventDetails.cancel()`: stops the part from updating its state.
- `eventDetails.allowPropagation()`: lets a DOM event that the part would stop, such as <kbd>Esc</kbd>, reach parent popups.

```svelte
<Tooltip.Root
	onOpenChange={(open, eventDetails) => {
		if (eventDetails.reason === 'trigger-press') eventDetails.cancel();
	}}
>
	...
</Tooltip.Root>
```

Use the callback for side effects such as analytics or saving. Do not use it to copy the value into your own state; that is what `bind:` does.

Type a handler with the component's exports, such as `ComboboxChangeEventDetails`, `ComboboxOpenChangeEventDetails`, and `ComboboxChangeReason`, or with `BaseUIChangeEventDetails` from `@sveltery/base/types`.

## Stop a part's handler with `event.preventDefault()`

Your DOM handlers (`onclick`, `onkeydown`, `onpaste`, ...) run before the part's own. Calling `event.preventDefault()` makes the part skip its logic. Base UI's `preventBaseUIHandler()` does not exist. The call also cancels the browser's default action.

```svelte
<NumberField.Input onpaste={(event) => event.preventDefault()} />
```

This has no effect where the part listens on the document instead of the element. Prefer a prop when one exists.

## Imperative methods through `bind:this`

Base UI's `actionsRef` becomes `bind:this` on the root. For example, `MenuActions` types what `bind:this` on `<Menu.Root>` returns. `onOpenChangeComplete` fires after the open or close animation finishes.
