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

<script>
	import { DemoPreventBaseUIHandler } from './demos/prevent-base-ui-handler';
</script>

<DemoPreventBaseUIHandler />

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
