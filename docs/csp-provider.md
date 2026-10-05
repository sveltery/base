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

[ScrollArea](scroll-area.md) is an implemented consumer of this same private context. Each Root emits its native scrollbar stylesheet with the supplied nonce unless `disableStyleElements` is true. Its real DOM, SSR/hydration and paired browser supplements exercise nonce/CSS application, style suppression and an enforced CSP supplied by the actual fixture HTTP response. Repeated Roots retain native framework ownership: React produces one hoisted style retained after unmount, while Svelte produces two per-Root styles removed at teardown. That divergent observation earns zero unchanged assertion credit.

Select and PrehydrationScript remain unimplemented. The three pinned CSPProvider declarations requiring ScrollArea remain deferred and uncredited because their complete original assertion ports have not been reconciled and reviewed; ScrollArea supplements do not supply that credit. The fourth declaration remains blocked by missing Select. Future consumers must use the same context, and complete ordinary ports require their own assertion provenance and review. `disableStyleElements` concerns generated style elements, never scripts. The provider generates no nonce or response headers and does not modify authored tags or inline style attributes; the enforced HTTP header is a test-fixture responsibility.

See [source and supplemental evidence](../parity/csp-provider/README.md) for paired SSR, local DOM/types, public isolated tarball consumers, browser acceptance and remaining gates. [CSP-01](upstream-differences.md#csp-01-csp-provider-framework-substitutions) records the Svelte child/context/type substitutions and PM implementation-scope decision. Supplemental evidence adds zero ordinary declaration credit; complete library or cross-browser parity is not claimed.
