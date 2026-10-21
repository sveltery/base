---
name: sveltery-base
description: Writes and fixes Svelte 5 code that uses Sveltery Base (`@sveltery/base`), the unstyled Svelte port of Base UI. Covers assembling component parts, `render` snippets, styling with `data-*` attributes and CSS variables, `bind:` versus `default*` props, change events with `eventDetails`, and Field/Form. Use whenever a project depends on `@sveltery/base`, imports from `@sveltery/base/*`, or the user mentions Sveltery Base, even when they say "Base UI" in a Svelte project.
user-invocable: false
---

# Sveltery Base

Sveltery Base is an unstyled Svelte 5 component library. It ports [Base UI](https://base-ui.com) to Svelte and keeps Base UI's parts, data attributes, and behavior where Svelte allows. The package is `@sveltery/base`, and each component has its own entry point, such as `@sveltery/base/popover`.

> **Pre-1.0.** The API still changes between minor versions, and this skill may lag behind it. When the skill and the docs disagree, the docs win. Check the installed version in `package.json` before you rely on a detail here.

## Look it up before you write it

Do not guess part names, props, data attributes, or CSS variables. Fetch them:

- `https://base.sveltery.dev/llms.txt`: an index of every docs page, with links.
- `https://base.sveltery.dev/llms-full.txt`: every page in one file. Large, so prefer the per-page files.
- Per-page Markdown: add `.md` to a docs URL. For example, `https://base.sveltery.dev/components/dialog.md` has Dialog's anatomy, demos, and full API tables (props, data attributes, CSS variables).
- Handbook pages: `/handbook/styling.md`, `/handbook/animation.md`, `/handbook/composition.md`, `/handbook/customization.md`, `/handbook/forms.md`, `/handbook/typescript.md`, `/handbook/sveltekit.md`.

The installed package's types are the final word for the version the project uses: `node_modules/@sveltery/base/dist/<component>/types.d.ts`.

Base UI docs are useful for intent, but the Svelte API differs. Translate React examples using the rules below instead of copying them.

## Coming from Base UI or React

| Base UI (React)                                           | Sveltery Base (Svelte)                                         |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| `import { Popover } from '@base-ui/react/popover'`        | `import { Popover } from '@sveltery/base/popover'`             |
| `className`, `className={(state) => …}`                   | `class` (string, array, or object). Never a function.          |
| `style={(state) => …}`                                    | `style` string. Use a `render` snippet for state-driven style. |
| `render={<MyButton />}` or `render={(props, state) => …}` | `{#snippet render(props, state, children)}…{/snippet}`         |
| `open` + `onOpenChange` (controlled)                      | `bind:open`                                                    |
| `defaultOpen` (uncontrolled)                              | `defaultOpen`                                                  |
| `onClick`, `onKeyDown`                                    | `onclick`, `onkeydown`                                         |
| `ref`, `actionsRef`                                       | `bind:this` on the root, or an attachment                      |
| `eventDetails.preventBaseUIHandler()`                     | `event.preventDefault()` in your handler                       |
| `Tooltip.Root.Props` (namespace)                          | `TooltipRootProps` (named export)                              |

## Critical rules

### Composition → [rules/composition.md](./rules/composition.md)

- **Assemble every documented part.** A popup needs `Root` → `Trigger` and `Portal` → `Positioner` → `Popup`. Read the anatomy block on the component's page.
- **`render` is a snippet, not a prop value.** Spread `props` onto exactly one element. Without the spread the part loses its attachment, ARIA, and handlers.
- **Custom components must spread rest props onto their root DOM element.**
- **Some parts take a `children` snippet with arguments**, such as `Combobox.Collection`, `Select.Value`, and `Progress.Value`. Use `{#snippet children(arg)}`.
- **Give dialogs a `Title`.** `Dialog.Title`, `AlertDialog.Title`, and `Drawer.Title` name the popup for screen readers.

### Styling → [rules/styling.md](./rules/styling.md)

- **Style states with `data-*` attributes**, such as `data-checked`, `data-open`, `data-highlighted`, and `data-disabled`. Do not toggle classes from your own state.
- **`class` is never a function of state.** Use data attributes, or a `render` snippet.
- **Wrap `<style>` selectors for parts in `:global(...)`.** Parts render inside the library's components, and popups render in a portal.
- **Size and place popups with the exposed CSS variables**, such as `--available-height`, `--anchor-width`, and `--transform-origin`.
- **Animate with `data-starting-style` and `data-ending-style`.** Prefer CSS transitions over keyframe animations.

### State and events → [rules/state.md](./rules/state.md)

- **Uncontrolled by default.** Use `default*` props (`defaultOpen`, `defaultValue`, `defaultChecked`) for the initial value.
- **Control with `bind:`**, such as `bind:open` or `bind:value`. Use a function binding `bind:value={get, set}` to accept or reject changes.
- **`on*Change` callbacks receive `(value, eventDetails)`.** Branch on `eventDetails.reason`, and call `eventDetails.cancel()` to stop the change.
- **Stop a part's own handler with `event.preventDefault()`** in your `onclick`, `onkeydown`, or other DOM handler.

### Forms → [rules/forms.md](./rules/forms.md)

- **Wrap each control in `Field.Root`** with `Field.Label`, `Field.Description`, and `Field.Error`.
- **Put `name` on `Field.Root`**, so the control's value submits with the form.
- **Use `Fieldset.Root` and `Fieldset.Legend` to label groups**, such as a `RadioGroup` or a `CheckboxGroup`.

## Key patterns

```svelte
<script lang="ts">
	import { Popover } from '@sveltery/base/popover';

	let open = $state(false);
</script>

<!-- Assemble every part. Bind only when you need the state. -->
<Popover.Root bind:open>
	<Popover.Trigger class="Button">Notifications</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner sideOffset={8}>
			<Popover.Popup class="Popup">
				<Popover.Title>Notifications</Popover.Title>
				<Popover.Description>You are all caught up.</Popover.Description>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>

<style>
	/* The popup is portaled, so scoped selectors do not reach it. */
	:global(.Popup) {
		max-height: var(--available-height);
		transform-origin: var(--transform-origin);
		transition:
			opacity 150ms,
			transform 150ms;
	}

	:global(.Popup[data-starting-style]),
	:global(.Popup[data-ending-style]) {
		opacity: 0;
		transform: scale(0.95);
	}
</style>
```

```svelte
<!-- A custom trigger: spread props, render children. -->
<Menu.Trigger>
	{#snippet render(props, state, children)}
		<MyButton {...props} active={state.open}>{@render children?.()}</MyButton>
	{/snippet}
	Open menu
</Menu.Trigger>
```

## Components

Each name below is an entry point (`@sveltery/base/<name>`) and a docs page (`https://base.sveltery.dev/components/<name>.md`):

accordion, alert-dialog, autocomplete, avatar, button, checkbox, checkbox-group, collapsible, combobox, context-menu, dialog, drawer, field, fieldset, form, input, menu, menubar, meter, navigation-menu, number-field, otp-field, popover, preview-card, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, textarea, toast, toggle, toggle-group, toolbar, tooltip.

`Radio` imports from `@sveltery/base/radio` and is documented on the radio-group page.

Utilities live at `https://base.sveltery.dev/utils/<name>.md`: `csp-provider`, `direction-provider`, and `merge-props`. Shared types (`RenderSnippet`, `BaseUIChangeEventDetails`) import from `@sveltery/base/types`.
