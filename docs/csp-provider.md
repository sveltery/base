# CSPProvider

`CSPProvider` is a bounded Svelte 5 port of Base UI 1.8.0's provider/context foundation at immutable `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. It is exported from `@sveltery/base` and `@sveltery/base/csp-provider`, with named `CSPProviderProps` and `CSPProviderState` types from either entry.

```svelte
<script lang="ts">
  import { CSPProvider } from '@sveltery/base/csp-provider';
</script>
<CSPProvider nonce="server-provided-nonce" disableStyleElements>
  <p>Child content renders without a provider wrapper.</p>
</CSPProvider>
```

The provider accepts optional `children` as a Svelte Snippet, `nonce` as a string, and `disableStyleElements` as a boolean. No children produces no host element. Its state type preserves the pinned empty-interface assignability. Pinned `CSPProvider.Props` and `CSPProvider.State` remain available as type-only namespace aliases alongside the named Props/State exports; the aliases add no runtime Props/State properties, public context hook or DOM props.

A missing provider supplies the private context fallback `{ disableStyleElements: false }`. An existing provider supplies its own optional values, including `undefined` when omitted or explicitly cleared. Nested providers replace the context; omitted inner values do not inherit outer values. Existing descendants see nonce/flag updates through reactive getters, and teardown/remount retains component-local scope.

Tabs.Indicator now uses the single canonical [PrehydrationScript](../packages/base/src/lib/internals/PrehydrationScript.svelte) consumer when `renderBeforeHydration` is enabled. It reads the real CSP context, applies the supplied nonce with escaping, emits the immutable Tabs payload during SSR, and removes the tag on native mount. `disableStyleElements` does not suppress scripts. [Tabs evidence](../parity/tabs/README.md) records actual SSR nonce/payload checks and secured paired CSP/parser/hydration/no-JS execution; these supplements earn zero ordinary CSP declaration credit.

ScrollArea and Select remain unimplemented on this Tabs branch. All four pinned CSPProvider ordinary declarations require those actual style consumers and remain deferred and uncredited; the Tabs script consumer does not establish their style-tag removal or nonce assertions. Future style consumers must use the same context and port their complete observable tests. No feature in this slice generates a nonce, writes response headers, modifies arbitrary authored tags or changes inline style attributes.

See [source and supplemental evidence](../parity/csp-provider/README.md) for paired SSR, local DOM/types, public isolated tarball consumers, browser acceptance and remaining gates. [CSP-01](upstream-differences.md#csp-01-csp-provider-framework-substitutions) records the Svelte child/context/type substitutions and PM implementation-scope decision. Supplemental evidence adds zero ordinary declaration credit; complete library or cross-browser parity is not claimed.
