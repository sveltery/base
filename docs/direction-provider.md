# Direction Provider

`DirectionProvider` supplies a text reading direction to descendants without adding a DOM element or `dir` attribute. The immutable behavior reference is [Base UI v1.8.0](upstream-contracts.md), commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. It accepts `direction?: 'ltr' | 'rtl'`, defaulting to `ltr`, and an optional children snippet. A nested provider owns its direction; an omitted or undefined nested direction defaults to `ltr` rather than inheriting its parent's value. Consumers outside a provider also read `ltr`.

```svelte
<script lang="ts">
  import { DirectionProvider } from '@sveltery/base/direction-provider';
  import Content from './Content.svelte';
  let direction = $state<'ltr' | 'rtl'>('rtl');
</script>

<DirectionProvider {direction}><Content /></DirectionProvider>
```

In `Content.svelte`, call `useDirection` once during initialization and retain the reader:

```svelte
<script lang="ts">
  import { useDirection } from '@sveltery/base/direction-provider';
  const direction = useDirection();
  let isRTL = $derived(direction() === 'rtl');
</script>

<span dir={direction()}>{isRTL ? 'RTL content' : 'LTR content'}</span>
```

The public root and `@sveltery/base/direction-provider` subpath export the same `DirectionProvider` and `useDirection`, plus `DirectionProviderProps` and `TextDirection`. The pinned `DirectionProvider.Props` and empty `DirectionProvider.State` type-only namespace aliases are also preserved. There is no render/ref/state/native-element prop API or hook override argument at the source pin. The provider itself does not set document direction or retrofit existing controls with RTL behavior; each consuming component must read the context and implement its own pinned interaction contract.

`useDirection(): () => TextDirection` is an explicit Svelte hook adaptation. React returns a primitive on every render; Svelte context lookup occurs during initialization, so its retained callable reader keeps later prop updates reactive. Call the reader in markup, `$derived`, or event handlers. Capturing `const current = direction()` during initialization captures only that initial value. Calling `useDirection()` later, outside component initialization, is unsupported like other Svelte context lookups. The [compatibility record](../parity/direction-provider/compatibility.md) records the delegated PM design decision separately from user approval and merge approval. The upstream primitive return-type assertion remains unported/divergent and earns no unchanged type parity credit.

The reader observes live owner writes before the next DOM commit. For a click that reads `rtl`, changes the provider owner to `ltr`, and reads again, Svelte reports `rtl|ltr`; React's captured primitive reports `rtl|rtl`. Both render `ltr` afterward. This event-handler timing is a specifically accepted delegated PM implementation decision, recorded with paired characterization and zero parity credit. It does not approve other timing differences or retroactively establish explicit user acceptance.

The [dedicated ledger](../parity/direction-provider/README.md) separates two ordinary declaration candidates, zero upstream conformance calls, adapted type checks, and local nesting/teardown/SSR/hydration/package supplements. Real React/Svelte browser execution and exact final-head gates remain separate; complete component or whole-library parity is not claimed.
