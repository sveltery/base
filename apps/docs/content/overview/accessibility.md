---
title: Accessibility
description: Learn how to make the most of the accessibility features in Sveltery Base, and what your app still needs to provide.
order: 2
---

Sveltery Base ports the accessibility behavior of Base UI. The components set ARIA roles and attributes, handle pointer and keyboard input, and manage focus. This page lists those features and the parts of accessibility that your app is responsible for.

## Keyboard navigation

The components follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/). A user who cannot use a pointer, or who prefers the keyboard, can operate every component.

Many components respond to the arrow keys, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, and <kbd>Esc</kbd>. In a group such as [Tabs](/components/tabs), [Radio Group](/components/radio-group), [Toggle Group](/components/toggle-group), or [Toolbar](/components/toolbar), one item is in the tab order and the arrow keys move focus between the items.

The arrow keys follow the text direction. Wrap a right-to-left part of your app in a [Direction Provider](/utils/direction-provider) so that the left and right arrow keys move in the reading order.

## Focus management

Components move focus for the user after an interaction. When a [Dialog](/components/dialog) or [Popover](/components/popover) opens, focus moves into the popup. When it closes, focus returns to the trigger.

`Dialog.Popup` and `Popover.Popup` take `initialFocus` and `finalFocus` props to change where focus goes. Pass an element, or a function that returns one. There are no ref objects, so read the element with `bind:this`:

```svelte
<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';

	let nameInput = $state<HTMLInputElement | null>(null);
</script>

<Dialog.Root>
	<Dialog.Trigger>Rename</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Popup initialFocus={() => nameInput}>
			<Dialog.Title>Rename file</Dialog.Title>
			<input bind:this={nameInput} aria-label="File name" />
			<Dialog.Close>Done</Dialog.Close>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

`finalFocus={null}` leaves focus where it is when the popup closes.

The components manage focus, but they do not draw a focus indicator. Style the `:focus-visible` pseudo-class on every part a user can focus, such as `focus-visible:outline-2` in Tailwind CSS. WCAG has [guidelines on focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance).

## Color contrast

Each foreground color must have enough contrast with its background. This includes text, icons, focus indicators, and the states you style through data attributes, such as `data-disabled`. Unless your app must meet a specific standard, consider [APCA](https://apcacontrast.com/).

## Accessible labels

[Field](/components/field) and [Fieldset](/components/fieldset) connect labels, descriptions, and error messages to their controls. `Field.Label` names the control, `Field.Description` and `Field.Error` describe it, and `Fieldset.Legend` names a group of controls.

A [Checkbox](/components/checkbox), [Radio Group](/components/radio-group), or [Switch](/components/switch) inside a `Field.Label` takes its name from the label text:

```svelte demo
<script lang="ts">
	import { Field } from '@sveltery/base/field';
	import { Switch } from '@sveltery/base/switch';
</script>

<Field.Root>
	<Field.Label class="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
		<Switch.Root
			class="relative flex h-6 w-10 rounded-full bg-gray-200 p-px transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 dark:bg-gray-700 dark:data-[checked]:bg-gray-100"
		>
			<Switch.Thumb
				class="aspect-square h-full rounded-full bg-white shadow transition-transform duration-150 data-[checked]:translate-x-4 dark:bg-gray-900"
			/>
		</Switch.Root>
		Notifications
	</Field.Label>
</Field.Root>
```

A control with no visible label needs an accessible name from `aria-label` or `aria-labelledby`. Icon buttons are the most common case. WAI-ARIA describes [how browsers compute an accessible name](https://www.w3.org/TR/wai-aria-1.2/#namecalculation).

The [Forms](/handbook/forms) handbook lists the label to use for each control.

## Custom elements keep the semantics

A `render` snippet replaces the element a part renders. The `props` argument carries the role, the ARIA attributes, the ids, and the event handlers. Spread all of them onto your element, or the part loses its accessibility behavior.

A part that acts as a button expects a native `<button>`. If your snippet renders another element, set `nativeButton={false}`. The part then adds `role="button"` and the keyboard handling that a native button has. In development, a part logs an error when the element does not match `nativeButton`. [Composition](/handbook/composition) has examples.

## Server rendering

Parts render their ARIA attributes on the server. Ids come from Svelte's `$props.id()`, so a `for` or `aria-labelledby` reference in the server HTML still points at the same element after hydration. [SvelteKit](/handbook/sveltekit) covers the parts that render differently before hydration.

## Testing

Each component runs the Base UI test suite ported to Svelte. Browser tests compare each component with React Base UI on the same interactions. Test your own pages with a screen reader and with the keyboard as well, because your markup and styles also affect accessibility.
