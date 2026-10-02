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

The provider accepts optional `children` as a Svelte Snippet, `nonce` as a string, and `disableStyleElements` as a boolean. No children produces no host element. Its state type preserves the pinned empty-interface assignability. React namespace types are replaced by named Props/State exports; no public context hook or DOM props are introduced.

A missing provider supplies the private context fallback `{ disableStyleElements: false }`. An existing provider supplies its own optional values, including `undefined` when omitted or explicitly cleared. Nested providers replace the context; omitted inner values do not inherit outer values. Existing descendants see nonce/flag updates through reactive getters, and teardown/remount retains component-local scope.

This foundation currently has **no implemented downstream CSP style/script consumer**. ScrollArea, Select and PrehydrationScript remain unimplemented. Passing context values does not establish style-tag removal or nonce application. The four pinned CSPProvider ordinary tests require the real missing families; all four remain deferred and uncredited. Future consumers must use the same context and port their complete observable tests. `disableStyleElements` concerns generated style elements, never scripts. No feature in this slice generates a nonce, writes response headers, modifies authored tags or changes inline style attributes.

See [source and supplemental evidence](../parity/csp-provider/README.md) for paired SSR, local DOM/types, public isolated tarball consumers, browser acceptance and remaining gates. [CSP-01](upstream-differences.md#csp-01-csp-provider-framework-substitutions) records the Svelte child/context/type substitutions and PM implementation-scope decision. Supplemental evidence adds zero ordinary declaration credit; complete library or cross-browser parity is not claimed.
