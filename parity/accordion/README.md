# Accordion parity slice

Behavior reference: Base UI v1.8.0, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The upstream checkout's working tree may be newer; inventory extraction reads immutable Git objects at this pin. [upstream-inventory.json](upstream-inventory.json) records source, body and ordered assertion hashes. Verify with `node parity/accordion/inventory.mjs /workspace/base-ui-upstream --check`. Preserve [upstream MIT attribution](UPSTREAM_LICENSE).

Ordinary scope is **39 declaration sites / 43 variants**. Portable scope is **38 sites / 42 variants**. Panel:201 requires external React.Activity to retain component state while disconnecting effects; it remains unimplemented and uncredited. CSS hiding or remounting does not satisfy that contract. Root:496 expands one declaration into four native/custom Enter/Space variants; Root:541 expands one declaration into two native/custom variants. Expansion creates no additional declaration sites.

The disabled parameterized declaration has two Root/Item variants, counted separately from ordinary declarations. Five conformance calls, seven generic type assertions and one expected type error are separate evidence. Supplemental tests, SSR, hydration, package consumers, shared Button probes and paired framework execution counts earn zero ordinary declaration credit.

[ports.json](ports.json) is the mapping and execution ledger. Immutable provenance proves source identity; it does not prove execution. Ordinary passing credit requires every ordered source assertion in the paired exact-pin secured browser run, with genuine React reference components and the local implementation. Pending or divergent assertions earn no credit. No full Accordion, React.Activity or shared Button/composition parity is claimed.

Read [component documentation](../../docs/accordion.md), [compatibility](compatibility.md), [verification](verification.md) and [shared-integration.md](shared-integration.md). Public export changes are prepared in [integration.patch](integration.patch) and are not applied by the feature-local worker. Existing shared manifest counts remain unchanged.

Implementation is tracked in [draft PR #35](https://github.com/sveltery/base/pull/35). The collected secured suite has 252 candidates: 84 ordinary paired instances, four disabled parameterized, 140 conformance and 24 supplemental. Current executed local and isolated integration evidence is in [verification](verification.md); it does not establish secured browser parity or merge eligibility.
