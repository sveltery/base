# Collapsible implementation checkpoint

Reference: Base UI v1.8.0, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.

This draft implements the bounded Collapsible Root/Trigger/Panel surface. Ordinary source inventory is 47 declaration sites / 49 variants: Root 15, Trigger 2, Panel 30. The portable scope is 41 sites / 43 variants. Six external React.Activity Panel declarations at lines 869, 932, 1003, 1063, 1130 and 1413 remain deferred because CSS hiding or remounting does not preserve state while tearing down effects. Four other React-19-guarded beforematch declarations remain in scope. Three conformance invocations and ten type assertions are separate evidence with zero ordinary declaration credit.

Implementation and exact-head acceptance are pending. No ordinary declaration parity credit is claimed at this initial checkpoint. Shared exports, catalog, runner and central documentation integration belong to the serialized parent handoff. Input and shared helpers are outside this change.
