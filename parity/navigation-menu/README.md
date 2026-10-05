# NavigationMenu

Status: **complete public composition in implementation draft; final acceptance pending**. This feature has zero unchanged ordinary assertion credit. [The implementation checkpoint](IMPLEMENTATION.md), [actual used graph](actual-native-graph.json), [body correspondence](implementation-correspondence.md) and [separate assertion ledger](implementation-assertion-ledger.json) describe current work. The Phase 1 preparation below is historical evidence at `6e1ccd1`.

Read the complete [pre-code Source plan](source-plan.md), [module/function correspondence](source-correspondence.json), [exact public API](public-api.json), [immutable Original graph](source-graph.json), [named-member selection](selected-source.json), [Original assertion inventory](original-assertions.json), and [canonical reuse/lease plan](canonical-reuse-plan.json). The inherited complete-body records are exact module-specific provenance, not whole Menu/Toolbar/Dialog acceptance. MIT archive and limits are recorded alongside them.

Evidence-only regeneration, with an installed TypeScript 5.9.3 resolver:

```sh
NAVIGATION_SOURCE_REQUIRE_FROM=/workspace/menu-family-base/packages/base/package.json node --max-old-space-size=384 parity/navigation-menu/prepare-source.mjs
python3 parity/navigation-menu/prepare-correspondence.py
NAVIGATION_SOURCE_REQUIRE_FROM=/workspace/menu-family-base/packages/base/package.json node --max-old-space-size=384 parity/navigation-menu/prepare-native-reuse.mjs
```

The scripts use immutable Git object identities and verify physical Original/canonical source bytes. They write only evidence. Their graph/body count is not manual-reading or test credit. Implementation requires Root's Phase 1 review and assignment of the four precise shared-helper leases in the plan.
