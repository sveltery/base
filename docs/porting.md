# Porting Base UI to Svelte

This guide maps Base UI's React patterns to Svelte 5. It condenses a lab study that ran each claim in a throwaway SvelteKit app on Svelte 5.57.2, SvelteKit 3.0.1 and Base UI 1.9.0. [AGENTS.md](../AGENTS.md) states the rules. This guide shows how to follow them.

## `useIsoLayoutEffect` is `$effect`

Base UI's `useIsoLayoutEffect` is React's `useLayoutEffect` in the browser and a no-op on the server. Svelte needs no equivalent:

- `$effect`, `$effect.pre` and `{@attach}` run in the same task as the DOM update, before the next animation frame. A screencast test found no painted frame of an intermediate state when an `$effect` corrected the DOM.
- None of them run on the server.

Pick the primitive by what the code needs:

| Primitive      | Runs                                                            | Use it for                                              |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `$effect.pre`  | Before this component's DOM update, parent first                | Adjusting state before the template reads it            |
| `{@attach fn}` | After the element is inserted, before the `$effect`s            | Work tied to one element: observers, listeners, focus   |
| `$effect`      | After the DOM update, child first                               | Layout reads, registration, timers                      |
| `flushSync()`  | Synchronously                                                   | Places where Base UI calls `ReactDOM.flushSync`         |
| `tick()`       | A microtask after the flush, or the next frame under async mode | Waiting for the DOM. Use `flushSync()` for "flush now". |

Two ordering rules matter:

- Register a child in a parent registry from `$effect` or `{@attach}`, not from `<script>`. A replacement child that registers in `<script>` registers before the old child unregisters.
- An outro transition keeps the old child registered until the outro ends. Parts that register with a parent use Base UI's own exit tracking (`TransitionStatus`), not Svelte transitions.

## Base UI hook and pattern map

| React hook or pattern                                                                                      | Svelte replacement                                                                                                                                                       | What still needs code                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useControlled`                                                                                            | `let { value = $bindable(initial) } = $props()`. No binding is uncontrolled, `bind:value` is two-way, `bind:value={get, set}` can reject a change.                       | The cancelable change callback. Build the event details, call `onValueChange(next, details)`, and write the value only if `!details.isCanceled`. A one-way `value={x}` lets the child drift until `x` changes. |
| `useRenderElement` and the `render` prop                                                                   | A `render` snippet that receives the props to spread. `<svelte:element this={tag}>` for a tag-only swap.                                                                 | State to `data-*` mapping as a pure function. Drop tag-specific defaults such as `type="button"` when the rendered tag differs.                                                                                |
| `className` and `style` as functions of state                                                              | Not needed. Style on `data-*` attributes. `class` accepts arrays and objects.                                                                                            | None.                                                                                                                                                                                                          |
| `mergeProps`                                                                                               | A short function that chains `on*` handlers, joins `class` as an array and copies symbol keys so attachments survive.                                                    | Lowercase handler names only (`onclick`).                                                                                                                                                                      |
| Refs, `useMergedRefs`                                                                                      | `bind:this` to read an element. `{@attach}` for behavior. Several attachments compose.                                                                                   | None.                                                                                                                                                                                                          |
| `useStableCallback`, `useEventCallback`                                                                    | Not needed. Closures read current state through getters.                                                                                                                 | None.                                                                                                                                                                                                          |
| `useValueAsRef`, latest refs                                                                               | `untrack(() => value)` in an effect, or read the value in an event handler.                                                                                              | None.                                                                                                                                                                                                          |
| `useTimeout`, `useAnimationFrame`                                                                          | `ScopedTimeout` and `ScopedAnimationFrame`, cleared from an `$effect` cleanup. Code no component owns uses the plain classes.                                            | None.                                                                                                                                                                                                          |
| `useOnMount`, `useOnFirstRender`                                                                           | `onMount`, an `$effect` with no reactive reads, or the top of `<script>`.                                                                                                | None.                                                                                                                                                                                                          |
| `useRefWithInit`, `useForcedRerendering`, `usePreviousValue`                                               | A class field or a script `const`. A forced re-render is not needed.                                                                                                     | None.                                                                                                                                                                                                          |
| `useId`, `useBaseUiId`                                                                                     | `$props.id()`. Derive extra ids as `` `${id}-label` ``.                                                                                                                  | None.                                                                                                                                                                                                          |
| `React.createContext`                                                                                      | `createContext<T>()` returns `[get, set, has]`. `get` throws when the context is missing, and `has` serves optional parents. Put a class instance in it, not a snapshot. | None.                                                                                                                                                                                                          |
| `ReactStore`, `useStore`, selectors, `useSyncExternalStore`                                                | A class with `$state` fields and `$derived` getters. Selectors become getters.                                                                                           | None.                                                                                                                                                                                                          |
| Portals                                                                                                    | A `Portal` component whose root element an attachment moves, or `mount()` with `getAllContexts()`.                                                                       | Focus guards and the `aria-owns` span are real behavior. Port them.                                                                                                                                            |
| StrictMode double effects                                                                                  | Not applicable. Scripts and effects run once.                                                                                                                            | None.                                                                                                                                                                                                          |
| Synthetic events                                                                                           | Native events.                                                                                                                                                           | Parts that stop propagation register with `on()` from `svelte/events`, never raw `addEventListener`.                                                                                                           |
| Controlled inputs and form reset                                                                           | `bind:value` or `bind:checked` plus `defaultValue` or `defaultChecked`. Svelte restores bound state on `reset`.                                                          | Field state (touched, dirty, validity, errors) listens for the form's `reset` event and clears itself.                                                                                                         |
| `createBaseUIEventDetails`                                                                                 | Port as is. It is framework-free.                                                                                                                                        | None.                                                                                                                                                                                                          |
| `useScrollLock`, `useAnimationsFinished`, `useOpenChangeComplete`, `useButton`, `useFocusableWhenDisabled` | The same logic as classes.                                                                                                                                               | All of it. These carry real behavior.                                                                                                                                                                          |
| `useTransitionStatus`                                                                                      | A `TransitionStatus` class. See [the worked example](#worked-example-transitionstatus).                                                                                  | None.                                                                                                                                                                                                          |

## Svelte APIs worth knowing

Reactivity:

- `$state.raw` stores a value without a deep proxy. Use it for large or replace-only data such as positioning results.
- `$state.snapshot` makes a plain copy for third-party APIs such as Floating UI middleware.
- A writable `$derived` follows its source but accepts a local override until the source changes.
- `$derived.by` holds a multi-statement derivation.
- `$effect.pre` adjusts state before the DOM update.
- `$effect.tracking()` reports whether code runs in a reactive context.
- `$effect.root` creates effects outside component init, for singletons. Plain `$effect` outside init throws `effect_orphan`.
- `$inspect.trace` shows which dependency re-ran a derived or an effect.
- `untrack` reads state without subscribing.
- `flushSync` applies pending updates synchronously.
- `getAbortSignal()` returns a signal that aborts when the current `$derived` or `$effect` re-runs or is destroyed. Use it for stale async work and listener cleanup.

`svelte/reactivity`:

- `createSubscriber` subscribes to an external source only while something reactive reads it. It replaces `useSyncExternalStore`.
- `MediaQuery` is a reactive `matchMedia`. On the server it returns its fallback.
- `svelte/reactivity/window` exposes `innerWidth`, `scrollY`, `devicePixelRatio` and similar values. They are `undefined` on the server.
- `SvelteMap` and `SvelteSet` are reactive collections. A `SvelteMap` suits an item registry.

Template, elements and events:

- `{@attach fn}` runs element behavior with cleanup. It re-runs when a value it reads changes, so wrap reads that must not re-attach in `untrack`.
- `createAttachmentKey()` lets an attachment travel inside a spread props object.
- `fromAction` wraps a `use:` action as an attachment.
- `on()` from `svelte/events` adds a listener that keeps Svelte's delegation order and returns its own cleanup.
- `<svelte:window>`, `<svelte:document>` and `<svelte:body>` declare global listeners with cleanup.
- `<svelte:element this>` renders a dynamic tag.
- `<svelte:boundary>` catches errors and holds async pending UI.
- `$props.id()` gives SSR-stable ids.
- `mount`, `unmount` and `getAllContexts` render a component elsewhere and keep context.

SvelteKit, for the forms integration:

- `$app/forms` provides `enhance`, `applyAction` and `deserialize`.
- `$app/state` provides `page.form` and `page.status`.
- `$app/server` provides `form`, `query` and `command`.
- `@sveltejs/kit` provides `fail` and `invalid`.

## Hooks become classes

Port each Base UI hook as a class in a `*.svelte.ts` file:

```ts
import { createContext, untrack } from 'svelte';

export class Thing {
	value = $state(0);
	readonly doubled = $derived(this.value * 2);

	constructor(private readonly props: () => { enabled: boolean; delay?: number }) {
		this.value = untrack(() => props().delay ?? 0);

		$effect(() => {
			if (!this.props().enabled) return;
			const id = setInterval(() => this.value++, this.props().delay ?? 100);
			return () => clearInterval(id);
		});
	}

	reset = () => {
		this.value = 0;
	};

	attach = (node: HTMLElement) => {
		node.dataset.thing = '';
		return () => delete node.dataset.thing;
	};
}

export const [getThing, setThing, hasThing] = createContext<Thing>();
```

Follow these rules:

- Construct the class during component init. A constructor that calls `$effect` throws `effect_orphan` anywhere else.
- Take inputs as getters. A plain value is a snapshot and goes stale.
- Expose state as fields or getters. Do not destructure them at the call site, because destructuring breaks reactivity.
- Keep framework-free logic, such as `ScrollLocker`, `Timeout` and event-details factories, in plain `.ts` files. The class wraps them with a lifetime.
- Write state from `$effect` only when it mirrors something external, such as a DOM measurement or a timer. Make everything computable a `$derived`.

### Worked example: `TransitionStatus`

Base UI's `useTransitionStatus` decides whether a popup is mounted and whether it carries `data-starting-style` or `data-ending-style`. In Svelte, React's render-phase `setState` becomes `$effect.pre`, and each layout effect that schedules a frame becomes an `$effect` that returns the cancel function.

The port is [`src/lib/internal/useTransitionStatus.svelte.ts`](../src/lib/internal/useTransitionStatus.svelte.ts). It takes upstream's `enableIdleState`, `deferEndingState` and `animateInitialOpen` as options. A part that unmounts after its exit animation calls `unmountAfterExit` with its element:

```svelte
<script lang="ts">
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';

	const transition = new TransitionStatus(() => open);
	let node = $state<HTMLElement | null>(null);
	transition.unmountAfterExit(() => node);
</script>

{#if transition.mounted}
	<div
		bind:this={node}
		data-starting-style={transition.transitionStatus === 'starting' ? '' : undefined}
	></div>
{/if}
```

Measured frame by frame, the first painted frame after opening carries `data-starting-style` and the next drops it. Closing sets `data-ending-style` before the first frame and keeps the element until its exit animations finish.

## Gotchas

1. **Do not move a block's first or last node.** An attachment that moves its node to `body` corrupts `{#if}` removal when that node is the first or last node of the block. Use a dedicated `Portal` component or `mount()`.
2. **Mixed event registration reverses order.** A native `addEventListener` on an ancestor fires before a child's delegated `onclick`, so the child's `stopPropagation()` cannot stop it. Use `on()` from `svelte/events` for any listener whose order matters.
3. **`tick()` waits a frame under async mode.** Use `flushSync()` when you need a synchronous flush.
4. **`$effect.pre` runs before `bind:this` on mount.** Its first run sees `undefined`, and it re-runs when the element is set.
5. **Attachments re-run on any reactive read inside them.** Wrap reads that must not re-attach in `untrack`.
6. **Register in `$effect`, not `<script>`.** Script registration overlaps a swapped sibling's unregister.
7. **A reset restores `defaultValue`, not the initial bound value.** Without `defaultValue`, a bound input resets to `""`. When the user clicks a reset button, sync and microtask code in a `reset` listener still sees the old values, and only a task later (`setTimeout`) sees the reset ones. A programmatic `form.reset()` already shows reset values to microtasks. `isTrusted` is true in both cases.
8. **A one-way prop is not controlled.** A child with `$bindable` can diverge from a parent value that is not bound. Use `bind:x={get, set}` for strict control.
9. **`type="button"` follows spread props onto other tags.** A part that renders a consumer-chosen element drops tag-specific defaults.
10. **SvelteKit 3 removed `$lib`.** Declare `"imports": { "#lib/*": "./src/lib/*" }` and import with the file extension.
11. **SvelteKit 3 takes Svelte options in the Vite plugin.** Compiler options and Kit options go into `sveltekit({ compilerOptions, ... })` in `vite.config.ts`.
12. **A remote form field's `type="email"` triggers native validation** unless the form sets `novalidate`, which can block the submit before preflight runs.
