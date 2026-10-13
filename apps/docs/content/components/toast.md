---
title: Toast
description: Generates toast notifications.
---

Click the button to add a toast. The viewport appears in the bottom right corner of the window. Hover it or press F6 to expand the stack, and swipe a toast down or right to dismiss it.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	const toastManager = Toast.createToastManager();
	let count = 0;

	function createToast() {
		count += 1;
		toastManager.add({
			title: `Toast ${count} created`,
			description: 'This is a toast notification.'
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		onclick={createToast}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Create toast
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

The demos on this page render their toasts with a small `ToastList` component, shown under [Render the toasts](#render-the-toasts). A demo is a single component, and `getToastManager()` has to run in a component inside `Toast.Provider`.

## Anatomy

Import the component and assemble its parts:

```svelte
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
</script>

<Toast.Provider>
	<Toast.Portal>
		<Toast.Viewport>
			<!-- One Toast.Root for each toast in getToastManager().toasts -->
			<Toast.Root {toast}>
				<Toast.Content>
					<Toast.Title />
					<Toast.Description />
					<Toast.Action />
					<Toast.Close />
				</Toast.Content>
			</Toast.Root>
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

An anchored toast wraps each `Toast.Root` in `Toast.Positioner` and can hold a `Toast.Arrow`. See [Anchored toasts](#anchored-toasts).

## Examples

### Render the toasts

`Toast.Provider` owns the toasts. `getToastManager()` returns them as `toasts`, newest first, together with the methods that change them. Call it while a component initializes, inside the provider. Read `manager.toasts` each time you need the list, because destructuring `toasts` copies the array once and stops it updating.

Render one `Toast.Root` for each toast, keyed by `id`. `Toast.Title`, `Toast.Description`, and `Toast.Action` fill themselves from the toast object and render nothing when it has no content for them.

```svelte
<!-- ToastList.svelte -->
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';

	const manager = Toast.getToastManager();
</script>

{#each manager.toasts as toast (toast.id)}
	<Toast.Root {toast}>
		<Toast.Content>
			<Toast.Title />
			<Toast.Description />
			<Toast.Action />
			<Toast.Close>Dismiss</Toast.Close>
		</Toast.Content>
	</Toast.Root>
{/each}
```

Place the component inside the viewport, as in the first demo. The demos on this page use the same structure with Tailwind classes. The root stacks toasts with the `--toast-index`, `--toast-offset-y`, and `--toast-height` CSS variables, and the viewport sets `--toast-frontmost-height`.

### Add toasts from anywhere

`Toast.createToastManager()` makes a manager that you can import into any module, so code outside the component tree can add toasts. Pass it to `Toast.Provider` as `toastManager`. A provider can use `getToastManager()` and a `toastManager` at the same time. They share one list of toasts.

```ts
// toast.ts
import { Toast } from '@sveltery/base/toast';

export const toastManager = Toast.createToastManager();
```

```svelte
<Toast.Provider {toastManager}>…</Toast.Provider>
```

```ts
import { toastManager } from './toast.js';

const id = toastManager.add({ title: 'Saved' });
toastManager.update(id, { title: 'Saved to the cloud' });
toastManager.close(id);
```

`add` returns the toast's id. `close()` without an id closes every toast.

### Action button

Pass `actionProps` to give a toast an action button. `children` is the button's text, and the other props go to the button. Handlers use lowercase names, such as `onclick`. The button does not close the toast, so call `close(id)` yourself if it should.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	const toastManager = Toast.createToastManager();
	let status = $state('Nothing archived yet.');

	function archive() {
		const id = toastManager.add({
			title: 'Conversation archived',
			description: 'It moves out of your inbox.',
			actionProps: {
				children: 'Undo',
				onclick: () => {
					status = 'Archive undone.';
					toastManager.close(id);
				}
			},
			onClose: () => {
				if (status === 'Nothing archived yet.') status = 'Archived.';
			}
		});
	}
</script>

<Toast.Provider {toastManager}>
	<div class="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100">
		<button
			type="button"
			onclick={archive}
			class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
		>
			Archive conversation
		</button>
		<span>{status}</span>
	</div>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Promises

`promise()` shows a toast with `type: 'loading'` while the promise is pending, then updates it to `type: 'success'` or `type: 'error'`. A loading toast never auto-dismisses. Each state takes a string, which becomes the description, an object of toast fields, or a function of the result or error that returns one. `promise()` returns a new promise chained on the one you passed. It resolves with the same value once the success toast shows, and rejects with the same error once the error toast shows.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	const toastManager = Toast.createToastManager();

	function run(succeed: boolean) {
		const request = new Promise<string>((resolve, reject) => {
			setTimeout(
				() => (succeed ? resolve('alice@example.com') : reject(new Error('Offline'))),
				1500
			);
		});
		toastManager
			.promise(request, {
				loading: 'Sending invite…',
				success: (email) => ({ title: 'Invite sent', description: `Sent to ${email}.` }),
				error: (error: Error) => ({ title: 'Invite failed', description: error.message })
			})
			.catch(() => {});
	}

	const button =
		'rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800';
</script>

<Toast.Provider {toastManager}>
	<div class="flex gap-3">
		<button type="button" class={button} onclick={() => run(true)}>Send invite</button>
		<button type="button" class={button} onclick={() => run(false)}>Send and fail</button>
	</div>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

Style the states with the `data-type` attribute that `Toast.Root`, `Toast.Title`, `Toast.Description`, `Toast.Action`, and `Toast.Close` carry. It reads `loading`, `success`, `error`, or whatever `type` you gave the toast.

### Update a toast

`update(id, updates)` changes a toast in place. The updates can be a function of the previous toast. An update to a toast that is closing is ignored. Changing `timeout` restarts the toast's timer. This demo starts a toast that never dismisses itself, updates its description as work progresses, and lets it dismiss after two seconds when it finishes.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	const toastManager = Toast.createToastManager();

	function start() {
		const id = toastManager.add({ title: 'Uploading', description: '0% done', timeout: 0 });
		let progress = 0;
		const interval = setInterval(() => {
			progress += 25;
			if (progress < 100) {
				toastManager.update(id, { description: `${progress}% done` });
				return;
			}
			clearInterval(interval);
			toastManager.update(id, {
				title: 'Upload complete',
				description: '100% done',
				type: 'success',
				timeout: 2000
			});
		}, 600);
	}
</script>

<Toast.Provider {toastManager}>
	<button
		type="button"
		onclick={start}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Start upload
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

Adding a toast with the `id` of a toast that is already open updates that toast and restarts its timer instead of adding a second one. Use it to deduplicate toasts.

### Timeout and limit

`timeout` on `Toast.Provider` is the default time in milliseconds before a toast closes itself. It defaults to `5000`. A toast can override it with its own `timeout`, and `0` keeps a toast open until someone closes it. Hovering the viewport or moving focus into it pauses every timer, and leaving resumes them.

`limit` is how many toasts show at once. It defaults to `3`. The older toasts past the limit stay in the list with `data-limited` and `inert`, so you can fade them out. They show again when newer toasts close.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	const toastManager = Toast.createToastManager();
	let count = 0;
</script>

<Toast.Provider {toastManager} limit={2} timeout={10000}>
	<button
		type="button"
		onclick={() =>
			toastManager.add({ title: `Toast ${++count}`, description: 'Only two show at once.' })}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Add toast
	</button>
	<Toast.Portal>
		<Toast.Viewport
			class="fixed top-auto right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]"
		>
			<ToastList />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

### Anchored toasts

Give a toast `positionerProps` with an `anchor` element to position it against that element instead of stacking it in the viewport. Wrap its `Toast.Root` in `Toast.Positioner`, and add `Toast.Arrow` if you want one. The positioning options, such as `side`, `align`, and `sideOffset`, go in `positionerProps` or straight on `Toast.Positioner`. Anchored toasts cannot be swiped.

```svelte demo
<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import ToastList from '#lib/components/ToastList.svelte';

	const toastManager = Toast.createToastManager();
	let copyButton = $state<HTMLButtonElement | null>(null);

	function copy() {
		toastManager.add({
			description: 'Copied',
			timeout: 1500,
			positionerProps: { anchor: copyButton, sideOffset: 10 }
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button
		bind:this={copyButton}
		type="button"
		onclick={copy}
		class="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		Copy link
	</button>
	<Toast.Portal>
		<Toast.Viewport>
			<ToastList anchored />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
```

Use separate providers for anchored toasts and stacked toasts, each with its own `toastManager`, so a stacked toast never lands in a viewport that expects positioners.

### High priority toasts

A toast with `priority: 'high'` is announced right away. The root uses `role="alertdialog"` and `aria-hidden`, and the viewport mirrors the title and description in a visually hidden `role="alert"` region. The mirror goes away while focus is inside the viewport, and the toast itself is exposed instead. Toasts default to `priority: 'low'`, which the viewport's `aria-live="polite"` region announces.

```ts
toastManager.add({
	title: 'Payment failed',
	description: 'Your card was declined.',
	priority: 'high'
});
```

### Swipe to dismiss

Drag a toast with the pointer, or swipe it on a touch screen, to dismiss it. `swipeDirection` on `Toast.Root` sets the directions that dismiss. It defaults to `['down', 'right']`. While a toast is swiped it carries `data-swiping` and `data-swipe-direction`, and it sets `--toast-swipe-movement-x` and `--toast-swipe-movement-y`.

```svelte
<Toast.Root {toast} swipeDirection="up">…</Toast.Root>
<Toast.Root {toast} swipeDirection={['left', 'right']}>…</Toast.Root>
```

### Keyboard

Press F6 anywhere on the page to move focus to the viewport. The stack expands and the timers pause. Press Tab to reach the toasts and their buttons. Escape closes the toast that has focus and moves focus to the next toast. When no toast remains, focus returns to where it was before F6. Shift+Tab from the viewport also returns focus there.

## Differences from Base UI

- `getToastManager()` replaces the `useToastManager()` hook. It returns `{ toasts, add, close, update, promise }`. `toasts` is a getter, so read `manager.toasts` and do not destructure it. Call `getToastManager()` while a component initializes. `Toast.getToastManager` is the same function.
- `title`, `description`, and `actionProps.children` take a `string` or a `Snippet`, where React takes a node. A snippet renders with `{@render}`. An empty string or `undefined` renders nothing.
- A toast object has `element`, the root element, where React has `ref`. `Toast.Root` writes it. `actionProps` takes `HTMLButtonAttributes`, so handlers are lowercase, such as `onclick`.
- `positionerProps` holds the positioning options and `anchor`. `Toast.Positioner` falls back to it for each option it does not receive.
- `Toast.createToastManager()` hides the provider subscription behind a module symbol, where Base UI uses the string key `' subscribe'`. Only `Toast.Provider` imports the symbol.
- `Toast.Provider` reads `timeout` and `limit` straight from its props. A changed prop is current before any descendant effect runs.
- `Toast.Title`, `Toast.Description`, and `Toast.Action` render nothing unless they have children or the toast field has content. A `render` snippet cannot be inspected, so its own text does not count. Pass that text as children instead.
- Parts take `class` and a `style` string, not functions of state. Style state through the data attributes and CSS variables below. `render` is a snippet that receives `(props, state, children)`.
- `Toast.Portal` has no `keepMounted`, as in Base UI. It does not render focus guards.
- The data attribute and CSS variable names are constant objects, such as `ToastRootDataAttributes.swipeDirection` and `ToastRootCssVariables.index`, where Base UI exports namespaces.

## API reference

### Provider

<ApiPart name="toast" part="Provider" />

`Toast.Provider` renders no element, so it has no data attributes.

### Viewport

<ApiPart name="toast" part="Viewport" />

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-expanded` | Present when the toasts are expanded. |

| CSS variable               | Description                               |
| -------------------------- | ----------------------------------------- |
| `--toast-frontmost-height` | The height of the frontmost toast, in px. |

The viewport is a `region` labelled `Notifications`. Pass `aria-label` to change the label.

### Root

<ApiPart name="toast" part="Root" />

| Attribute              | Description                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `data-expanded`        | Present when the viewport is expanded.                                             |
| `data-limited`         | Present when the toast is over the provider's `limit`.                             |
| `data-type`            | The toast's `type`.                                                                |
| `data-swiping`         | Present while the toast is being swiped.                                           |
| `data-swipe-direction` | The direction the toast is swiped or was swiped: `up`, `down`, `left`, or `right`. |
| `data-starting-style`  | Present when the toast is animating in.                                            |
| `data-ending-style`    | Present when the toast is animating out.                                           |

| CSS variable               | Description                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| `--toast-index`            | The index of the toast in the stack, with `0` for the frontmost toast. |
| `--toast-offset-y`         | The vertical offset of the toast when the stack is expanded, in px.    |
| `--toast-height`           | The measured natural height of the toast, in px.                       |
| `--toast-swipe-movement-x` | The horizontal swipe movement, in px.                                  |
| `--toast-swipe-movement-y` | The vertical swipe movement, in px.                                    |

### Content

<ApiPart name="toast" part="Content" />

| Attribute       | Description                                     |
| --------------- | ----------------------------------------------- |
| `data-expanded` | Present when the viewport is expanded.          |
| `data-behind`   | Present when the toast is behind the frontmost. |

### Title

<ApiPart name="toast" part="Title" />

| Attribute   | Description         |
| ----------- | ------------------- |
| `data-type` | The toast's `type`. |

### Description

<ApiPart name="toast" part="Description" />

| Attribute   | Description         |
| ----------- | ------------------- |
| `data-type` | The toast's `type`. |

### Close

<ApiPart name="toast" part="Close" />

| Attribute   | Description         |
| ----------- | ------------------- |
| `data-type` | The toast's `type`. |

The button sets `aria-hidden` while the viewport is collapsed and the button does not have focus.

### Action

<ApiPart name="toast" part="Action" />

| Attribute   | Description         |
| ----------- | ------------------- |
| `data-type` | The toast's `type`. |

### Portal

<ApiPart name="toast" part="Portal" />

### Positioner

<ApiPart name="toast" part="Positioner" />

| Attribute            | Description                               |
| -------------------- | ----------------------------------------- |
| `data-side`          | The side of the anchor the toast is on.   |
| `data-align`         | How the toast is aligned along that side. |
| `data-anchor-hidden` | Present when the anchor is hidden.        |

| CSS variable         | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `--anchor-height`    | The anchor's height.                                           |
| `--anchor-width`     | The anchor's width.                                            |
| `--available-height` | The available height between the anchor and the viewport edge. |
| `--available-width`  | The available width between the anchor and the viewport edge.  |
| `--transform-origin` | The point the toast scales and rotates from.                   |
| `--toast-index`      | The index of the toast in the stack.                           |

### Arrow

<ApiPart name="toast" part="Arrow" />

| Attribute         | Description                                         |
| ----------------- | --------------------------------------------------- |
| `data-side`       | The side of the anchor the toast is on.             |
| `data-align`      | How the toast is aligned along that side.           |
| `data-uncentered` | Present when the arrow cannot center on the anchor. |

### Toast manager

`Toast.getToastManager()` and `Toast.createToastManager()` return objects with the same methods. They are not parts, so they have no `ApiPart`.

#### getToastManager

`Toast.getToastManager<Data>()` returns a `GetToastManagerReturnValue`. Call it while a component initializes, inside `Toast.Provider`.

| Member    | Type                                          | Description                                                                                                                                  |
| --------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `toasts`  | `ToastObject[]` (read-only getter)            | The toasts, newest first. Read it from the object. Do not destructure it.                                                                    |
| `add`     | `(options: ToastManagerAddOptions) => string` | Adds a toast and returns its id. An `id` of an open toast updates that toast instead. An `id` of a closing toast replaces it with a new one. |
| `close`   | `(toastId?: string) => void`                  | Closes a toast. Without an id, closes every toast.                                                                                           |
| `update`  | `(toastId: string, updates) => void`          | Updates a toast. `updates` is an object or a function of the previous toast.                                                                 |
| `promise` | `(promise, options) => Promise`               | Shows loading, then success or error toast fields. Returns a chained promise.                                                                |

#### createToastManager

`Toast.createToastManager<Data>()` returns a `ToastManager` with `add`, `close`, `update`, and `promise`, which work like the ones above. It has no `toasts`. Pass it to `Toast.Provider` as `toastManager`. Calls made before a provider mounts are dropped, because the manager keeps no queue.

#### Toast options

`add` takes these fields. `update` takes the same fields without `id` and `transitionStatus`.

| Field             | Type                          | Description                                                                          |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `id`              | `string`                      | The toast's id. Adding an existing id updates that toast and restarts its timer.     |
| `title`           | `string \| Snippet`           | The title. `Toast.Title` renders it.                                                 |
| `description`     | `string \| Snippet`           | The description. `Toast.Description` renders it.                                     |
| `type`            | `string`                      | Sets `data-type`. `promise()` uses `loading`, `success`, and `error`.                |
| `timeout`         | `number`                      | Milliseconds before the toast closes. `0` keeps it open. Defaults to the provider's. |
| `priority`        | `'low' \| 'high'`             | How the toast is announced. Defaults to `'low'`.                                     |
| `actionProps`     | `ToastActionButtonProps`      | Props for the action button. `children` is its content.                              |
| `positionerProps` | `ToastManagerPositionerProps` | The anchor and positioning options for an anchored toast.                            |
| `data`            | `Data`                        | Custom data. Read it from `toast.data`.                                              |
| `onClose`         | `() => void`                  | Called when the toast starts closing.                                                |
| `onRemove`        | `() => void`                  | Called when the toast leaves the list, after its exit animation.                     |
