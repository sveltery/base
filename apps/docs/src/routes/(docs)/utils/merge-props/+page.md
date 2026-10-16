# mergeProps

<Subtitle>
  A utility to merge multiple sets of Svelte props.
</Subtitle>

<Meta name="description" content="A utility to merge multiple sets of Svelte props." />

`mergeProps` helps you combine multiple prop objects (for example, internal props + user props) into a single set of props you can spread onto an element.
It behaves like `Object.assign` (rightmost wins) with a few special cases, so common Svelte patterns work as expected.

## How merging works

- For most keys (everything except `class`, `style`, event handlers, and attachments), the value from the rightmost object wins:

  ```ts title="returns { id: 'b', dir: 'ltr' }"
  mergeProps({ id: 'a', dir: 'ltr' }, { id: 'b' });
  ```

- There is no `ref` to merge. Attachments take its place, and every attachment is kept. They run from left to right:

  ```ts title="both a and b run"
  import { createAttachmentKey } from 'svelte/attachments';

  mergeProps({ [createAttachmentKey()]: a }, { [createAttachmentKey()]: b });
  ```

- `class` values are combined right-to-left (rightmost first) into an array, which Svelte renders as one class list:

  ```ts title="class is ['b', 'a'], rendered as 'b a'"
  mergeProps({ class: 'a' }, { class: 'b' });
  ```

- `style` strings are joined, so declarations from the rightmost style overwrite earlier ones for the same property. Style objects are ignored.
- Event handlers are merged and executed right-to-left (rightmost first). Handlers use Svelte's lowercase names, such as `onclick`. A camelCase prop such as `onValueChange` is a plain prop, so the rightmost one wins.

  ```ts title="b runs before a"
  mergeProps({ onclick: a }, { onclick: b });
  ```

  - For DOM events, calling `event.preventDefault()` in a handler prevents the handlers to its left, including Sveltery Base's internal logic, from running.
    It also cancels the browser's default action for the event, as `preventDefault()` always does.
  - For handlers whose first argument is not a DOM event (callbacks with primitive or object values), this mechanism isn't available and all handlers always execute.

### Preventing Sveltery Base's default behavior

When using the `render` snippet, props are not merged automatically.
You can use `mergeProps` to combine Sveltery Base's props with your own, and call `event.preventDefault()` to stop Sveltery Base's internal logic from running:

```svelte demo
<script lang="ts">
	import { mergeProps } from '@sveltery/base/merge-props';
	import { Toggle, type ToggleHostProps } from '@sveltery/base/toggle';

	let locked = $state(true);
	let pressed = $state(true);

	const getToggleProps = (props: ToggleHostProps) =>
		mergeProps(props, {
			onclick(event: MouseEvent) {
				if (locked) {
					event.preventDefault();
				}
			}
		});
</script>

<div class="flex items-center gap-4">
	<div class="flex items-center gap-2">
		<Toggle
			aria-label="Favorite"
			bind:pressed
			class="m-0 box-border flex size-8 items-center justify-center rounded-none border-0 bg-transparent p-0 text-neutral-950 select-none hover:not-data-[disabled]:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 active:not-data-[disabled]:bg-neutral-200 dark:text-white dark:hover:not-data-[disabled]:bg-neutral-800 dark:focus-visible:outline-white dark:active:not-data-[disabled]:bg-neutral-700"
		>
			{#snippet render(props, state)}
				<button type="button" {...getToggleProps(props)}>
					{#if state.pressed}
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="block"
							aria-hidden="true"
						>
							<path
								d="M7.99961 13.8667C7.88761 13.8667 7.77561 13.8315 7.68121 13.7611C7.43321 13.5766 1.59961 9.1963 1.59961 5.8667C1.59961 3.80856 3.27481 2.13336 5.33294 2.13336C6.59054 2.13336 7.49934 2.81176 7.99961 3.3131C8.49988 2.81176 9.40868 2.13336 10.6663 2.13336C12.7244 2.13336 14.3996 3.80803 14.3996 5.8667C14.3996 9.1963 8.56601 13.5766 8.31801 13.7616C8.22361 13.8315 8.11161 13.8667 7.99961 13.8667Z"
							/>
						</svg>
					{:else}
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="block"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="m7.99961 4.8232-.75505-.75666c-.40333-.40419-1.0559-.86651-1.91162-.86651-1.46903 0-2.66666 1.19764-2.66666 2.66667 0 .5412.24648 1.2356.75339 2.04713.49581.79376 1.17682 1.59861 1.89311 2.33647 1.06989 1.1022 2.1604 1.9962 2.68705 2.4102.52751-.4149 1.61735-1.3085 2.68657-2.4101.7163-.73792 1.3973-1.54278 1.8932-2.33656.5069-.81154.7533-1.50594.7533-2.04714 0-1.46947-1.1975-2.66667-2.6666-2.66667-.85574 0-1.50831.46232-1.91164.86651zm-.01387-1.52394c-.5031-.49988-1.40673-1.1659-2.6528-1.1659-2.05813 0-3.73333 1.6752-3.73333 3.73334 0 3.3296 5.8336 7.7099 6.0816 7.8944a.532.532 0 0 0 .3184.1056c.112 0 .224-.0352.3184-.1051.248-.185 6.08159-4.5653 6.08159-7.8949 0-2.05867-1.6752-3.73334-3.7333-3.73334-1.24617 0-2.14985.66611-2.65293 1.166q-.0069.00686-.0137.01367c.00002-.00003-.00002.00002 0 0-.00459-.0046-.00927-.00914-.01393-.01377"
							/>
						</svg>
					{/if}
				</button>
			{/snippet}
		</Toggle>
		<span class="text-sm text-neutral-950 dark:text-white">
			Favorite {locked ? '(locked)' : '(unlocked)'}
		</span>
	</div>
	<button
		type="button"
		class="m-0 box-border flex h-8 items-center justify-center rounded-none border border-neutral-950 bg-white px-3 font-[inherit] text-sm leading-none font-normal whitespace-nowrap text-neutral-950 select-none hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 active:bg-neutral-200 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white dark:active:bg-neutral-700"
		onclick={() => (locked = !locked)}
	>
		{locked ? 'Unlock' : 'Lock'}
	</button>
</div>
```

## Passing a function instead of an object

Each argument can be a props object or a function that receives the merged props up to that point (left to right) and returns a props object.
This is useful when you need to compute the next props from whatever has already been merged.

Note that the function's return value completely replaces the accumulated props up to that point.
If you want to chain event handlers from the previous props, you must call them manually:

```ts title="Manually chaining handlers in a function"
const merged = mergeProps(
	{
		onclick(event: MouseEvent) {
			// Handler from previous props
		}
	},
	(props) => ({
		onclick(event: MouseEvent) {
			// Manually call the previous handler
			(props.onclick as ((event: MouseEvent) => void) | undefined)?.(event);
			// Your logic here
		}
	})
);
```

## API reference

### mergeProps

This function accepts up to 6 arguments, each being either a props object or a function that returns a props object.
If you need to merge more than 6 sets of props, use `mergePropsN` instead.

**Parameters**

| Parameter | Type                                         | Default | Description                                                                                    |
| --------- | -------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `a`       | `object \| PropsGetter \| null \| undefined` | -       | Props object to merge.                                                                         |
| `b?`      | `object \| PropsGetter \| null \| undefined` | -       | Props object to merge. The function will overwrite conflicting props from `a`.                 |
| `c?`      | `object \| PropsGetter \| null \| undefined` | -       | Props object to merge. The function will overwrite conflicting props from previous parameters. |
| `d?`      | `object \| PropsGetter \| null \| undefined` | -       | Props object to merge. The function will overwrite conflicting props from previous parameters. |
| `e?`      | `object \| PropsGetter \| null \| undefined` | -       | Props object to merge. The function will overwrite conflicting props from previous parameters. |
| `f?`      | `object \| PropsGetter \| null \| undefined` | -       | Props object to merge. The function will overwrite conflicting props from previous parameters. |

**Return value**

`T`

The merged props. `T` is the type of the last argument. `null` and `undefined` arguments are skipped.

### mergePropsN

This function accepts an array of props objects or functions that return props objects.
It uses the same logic as `mergeProps`, so use it when you need to merge more than 6 sets of props or an array of any length.

**Parameters**

| Parameter | Type                                                      | Default | Description              |
| --------- | --------------------------------------------------------- | ------- | ------------------------ |
| `props`   | `readonly (object \| PropsGetter \| null \| undefined)[]` | -       | Array of props to merge. |

**Return value**

`T`

The merged props.
