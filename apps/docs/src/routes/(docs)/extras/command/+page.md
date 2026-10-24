# Command

<Subtitle>
  A command menu that filters, ranks and selects its items.
</Subtitle>

<Meta name="description" content="A command menu that filters, ranks and selects its items." />

<DemoCommandHero />

Command ports [cmdk](https://github.com/pacocoursey/cmdk) 1.1.1. It renders cmdk's elements, `cmdk-*` attributes, roles and ARIA, so styles written for cmdk select the same markup. Sveltery UI's Command is built on it.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Command } from '@sveltery/base/command';
</script>

<Command.Root>
	<Command.Input />
	<Command.List>
		<Command.Empty />
		<Command.Loading />
		<Command.Group>
			<Command.Item />
		</Command.Group>
		<Command.Separator />
		<Command.Item />
	</Command.List>
</Command.Root>
```

## Filtering and selection

An item's value is its trimmed text unless you pass `value`. Typing filters and ranks items with cmdk's fuzzy scoring. Items that do not match unmount, and the rest render in ranked order. The first matching item is selected, the arrow keys move the selection, and <kbd>Enter</kbd> or a click calls the item's `onSelect` with its value.

A bound `value` that names no item is kept, for example while items load, and selects the first item with that value once one mounts. An empty `value` selects the first item. Use `defaultValue` to start with an item selected without binding it.

`filter(value, search, keywords)` returns a score from 0 to 1. A score of 0 hides the item. The default is the exported `defaultFilter`.

## Keyboard

| Key                                                                                        | Action                                                        |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| <kbd>ArrowDown</kbd>, <kbd>ArrowUp</kbd>                                                   | Next or previous item. Wraps around with `loop`.              |
| <kbd>Ctrl</kbd>+<kbd>N</kbd> or <kbd>J</kbd>, <kbd>Ctrl</kbd>+<kbd>P</kbd> or <kbd>K</kbd> | Same as ArrowDown and ArrowUp, unless `vimBindings` is false. |
| <kbd>Meta</kbd> with any of the above                                                      | Last or first item.                                           |
| <kbd>Alt</kbd> with any of the above                                                       | First item of the next or previous group.                     |
| <kbd>Home</kbd>, <kbd>End</kbd>                                                            | First or last item.                                           |
| <kbd>Enter</kbd>                                                                           | Calls the selected item's `onSelect`.                         |

Root ignores a key when a handler called `preventDefault()` or an input method is composing. Disabled items are never selected by the keyboard or the pointer.

## Examples

### Server results

For results that you fetch yourself, turn filtering off and render what the server returns. Selection and the keyboard keep working:

```svelte title="Server results"
<!-- @highlight-text "shouldFilter={false}" -->
<Command.Root shouldFilter={false}>
	<Command.Input bind:value={query} />
	<Command.List>
		{#if loading}<Command.Loading {progress}>Fetching...</Command.Loading>{/if}
		{#each results as result (result.id)}
			<Command.Item value={result.id}>{result.title}</Command.Item>
		{/each}
		<Command.Empty>Nothing found.</Command.Empty>
	</Command.List>
</Command.Root>
```

### Reading the state

`getCommandState()` reads the menu's state from any component inside Root. Its fields are reactive:

```svelte title="Result count"
<script lang="ts">
	import { getCommandState } from '@sveltery/base/command';

	const command = getCommandState();
</script>

{#if command.search}<p>{command.count} results</p>{/if}
```

### In a dialog

Put Root inside a [Dialog](/components/dialog). The menu resets its search and selection each time the popup content mounts again. Bind `value` on Root and Input to keep them across openings.

```svelte title="Command dialog"
<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Backdrop />
		<Dialog.Popup aria-label="Command menu">
			<Command.Root label="Command menu">
				<Command.Input autofocus placeholder="Type a command..." />
				<Command.List>...</Command.List>
			</Command.Root>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
```

### Where parts render

List and each Group render their parts themselves, in ranked order, and each part leaves only a comment where you write it. So an element you wrap around an Item, Group, Separator, Empty or Loading stays empty: put classes and attributes on the part itself. Other markup written in List or Group renders before its parts. A `{#each}` or `{#if}` around parts is fine.

## API reference

<script>
	import { DemoCommandHero } from './demos/hero';
	import { TypesCommand, TypesCommandAdditional } from './types';
</script>

### Root

<TypesCommand.Root />

### Input

<TypesCommand.Input />

### List

<TypesCommand.List />

### Empty

<TypesCommand.Empty />

### Group

<TypesCommand.Group />

### Item

<TypesCommand.Item />

### Separator

<TypesCommand.Separator />

### Loading

<TypesCommand.Loading />

## Additional types

<TypesCommandAdditional showAdditionalTypes={['commandfilter', 'commandstate']} />
