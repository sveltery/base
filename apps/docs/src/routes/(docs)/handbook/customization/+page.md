# Customization

<Subtitle>
  A guide to customizing the behavior of Sveltery Base components.
</Subtitle>

<Meta name="description" content="A guide to customizing the behavior of Sveltery Base components." />

## Sveltery Base events

Change events such as `onOpenChange`, `onValueChange`, and `onPressedChange` are custom to Sveltery Base.
They can be emitted by various different DOM events or by effects.
Form controls that submit through a native input, such as Checkbox, Select, Slider, and NumberField, fire that input's `input` and `change` events instead.

```ts title="Sveltery Base event signatures"
onOpenChange: (open, eventDetails) => void
onValueChange: (value, eventDetails) => void
onPressedChange: (pressed, eventDetails) => void
```

The `eventDetails` property is passed as a second argument to Sveltery Base event handlers.
This enables the event to be customized, and also allows you to conditionally run side effects based on the reason or DOM event that caused the change.

```ts title="eventDetails object"
interface BaseUIChangeEventDetails {
	reason: string;
	event: Event;
	cancel: () => void;
	allowPropagation: () => void;
	isCanceled: boolean;
	isPropagationAllowed: boolean;
}
```

- `reason` is used to determine why the change event occurred, which can be useful to conditionally run certain side effects.
  Most IDEs show the possible string values after typing `reason === '`.
- `event` is the native DOM event that caused the change.
- `cancel` stops the component from changing its internal state.
- `allowPropagation` allows the DOM event to propagate in cases where Sveltery Base stops the propagation.
- `isCanceled` indicates whether the change event has been canceled.
- `isPropagationAllowed` indicates whether the DOM event is allowed to propagate.

Sveltery Base keeps Base UI's type name. Import `BaseUIChangeEventDetails` from `@sveltery/base/types`, or use a component's own type, as described in [TypeScript](/handbook/typescript#events).

### Canceling a Sveltery Base event

An event can be canceled with the `cancel()` method on `eventDetails`:

```svelte title="Prevent a tooltip from closing when pressing the trigger"
<Tooltip.Root
	onOpenChange={(open, eventDetails) => {
		if (eventDetails.reason === 'trigger-press') {
			// Stop the open change (false) from happening.
			eventDetails.cancel(); // @highlight-text "cancel"
		}
	}}
>
	...
</Tooltip.Root>
```

This lets you leave the component uncontrolled, without `bind:open`, as its internal state is prevented from updating.
This is an alternative to controlling the component with `bind:open` and guarding the state updates conditionally.

### Allowing propagation of the DOM event

In most components, pressing the <kbd>Esc</kbd> key stops the propagation of the event so parent popups don't close simultaneously.
This can also be customized with the `allowPropagation()` method:

```svelte title="Allowing propagation of the event"
<Tooltip.Root
	onOpenChange={(open, eventDetails) => {
		if (eventDetails.reason === 'escape-key') {
			// Allow the DOM event to propagate.
			eventDetails.allowPropagation(); // @highlight-text "allowPropagation"
		}
	}}
>
	...
</Tooltip.Root>
```

## Preventing Sveltery Base from handling a DOM event

To prevent Sveltery Base from handling a DOM event like `onclick`, call `event.preventDefault()` in your handler. A part runs your handler before its own, and skips its own logic when your handler prevented the default:

```svelte title="Prevent Sveltery Base's default behavior"
<NumberField.Input
	onpaste={(event) => {
		event.preventDefault();
	}}
/>
```

Base UI uses a separate `preventBaseUIHandler()` method for this. Sveltery Base has none, so the same call also cancels the browser's default action. In this example, the browser does not paste the text either.

This should be used as an escape hatch in cases where there isn't a prop yet to customize the behavior.
In various cases, a part handles the event in a listener it adds itself, such as a listener on the document, instead of in the handler you pass, so this method has no effect.

## Controlling components with state

Bindings enable a component to be controlled with your own external state.

Components are uncontrolled by default, meaning that they manage their own state internally.

```svelte title="Uncontrolled dialog"
<Dialog.Root>
	<!-- Opens the dialog when clicked. -->
	<Dialog.Trigger />
</Dialog.Root>
```

A component can be made controlled by binding external state to a prop, such as `bind:open` or `bind:value`. The binding replaces Base UI's pair of a state prop and its change handler, such as `open` and `onOpenChange`.

For instance, you can open [Dialog](/components/dialog) after a timeout, without a trigger:

```svelte title="Controlled dialog"
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let open = $state(false);

	$effect(() => {
		const timeout = setTimeout(() => {
			open = true;
		}, 1000);
		return () => clearTimeout(timeout);
	});
</script>

<Dialog.Root bind:open>No trigger is needed in this case.</Dialog.Root>
```

This also allows you to read the state of the component outside of the root component.
