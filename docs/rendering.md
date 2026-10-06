# Native snippet rendering

Element parts render their own Svelte snippet or intrinsic HTML element. The replacement API is `render(props, state, children)`, where `children` is an optional native snippet. Import `HTMLProps` and `ComponentRenderFn` from `@sveltery/base` when naming those types.

```svelte
<script lang="ts">
  import { Button, type HTMLProps } from '@sveltery/base';
  import type { Snippet } from 'svelte';
  import type { ButtonState } from '@sveltery/base/button';
</script>

{#snippet replacement(props: HTMLProps, state: ButtonState, children: Snippet | undefined)}
  <button {...props} data-custom-disabled={state.disabled}>
    {@render children?.()}
  </button>
{/snippet}

<Button render={replacement}>Save</Button>
```

The component implementation uses this native pattern, with its actual fallback tag:

```svelte
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button {...mergedProps}>{@render children?.()}</button>
{/if}
```

Pure shared helpers preserve state attributes, ordered prop getters, right-to-left event handlers, `preventBaseUIHandler()`, and class/style merging. Component business still supplies its own ARIA relationships, validation, button behavior, focus management and motion resources. Native snippets own their markup; the library does not clone elements, discover hosts with selectors, intercept attachments, or replay React ref/render/commit behavior.

Forward the supplied props, including native attachment symbols, to the host that should participate in that component's behavior. Attachments run and clean up through Svelte. Authored attachments keep their independent native lifetimes. The library does not constrain a snippet's subtree or inspect opaque authored styles. Explicit attributes and styles follow Svelte's normal precedence. Native void-element fallbacks do not render children. SSR renders markup without executing attachments or client effects.

`bind:ref` exposes the actual host. Checkbox.Root, Switch.Root, Radio.Root and RadioGroup also expose `bind:inputRef`; its type is `HTMLInputElement | null | undefined`. RadioGroup publishes its selected/enabled representative input using the existing registration business. Callback/object ref transport is removed. Form libraries can observe the bound input in a native effect and return their own registration cleanup.

The former public `UseRender` component, `@sveltery/base/use-render` subpath and `UseRender*` aliases are removed. Use a component's `render` snippet, or write ordinary Svelte markup and call public `mergeProps` where shared prop composition is useful. The unused `@sveltery/utils/useMergedRefs` subpath is removed as well.

Collapsible and Accordion retain their existing measurement, dimensions, temporary motion writes and cancellation business. Their authored CSS updates follow native Svelte string-style updates; the earlier property snapshot/replay layer is removed. A native style update can therefore replace an imperative temporary CSS value. Snippet-authored CSS remains under the snippet's native precedence. Panels express `hidden="until-found"` directly in SSR/client markup, with native consumer overrides, and their search listener follows the actual panel host. This deliberate renderer difference earns zero unchanged upstream assertion credit.

The [native source record](../parity/native-snippets/README.md) links the pinned Original composition, before/after import graphs, replacements and pending acceptance. Earlier rendering/ref evidence remains historical; it does not certify this successor.
