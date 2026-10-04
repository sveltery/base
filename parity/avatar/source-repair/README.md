# Avatar bounded composition repair

This follows the frozen [landed audit](../source-audit/README.md) at `60ac5cfa5806efa6e3024d44023456460ca84b41`, before repair. The Original remains Base UI v1.8.0 immutable `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, MIT. The runtime repair checkpoint is `6c4fc55`; final review must identify its own exact successor head externally. The original audit,53 archived bodies and44 ordinary declaration hashes/ordered assertions are unchanged.

Image now composes the actual dedicated `useImageLoadingStatus`, canonical `useTransitionStatus`, canonical `useOpenChangeComplete`/`useAnimationsFinished` and canonical `RenderElement`. Root and Fallback use that renderer directly with the feature mapping; Image combines it with the canonical transition mapping. `avatar/animations.ts` and the Avatar legacy Dialog Element/type paths are removed. The shared animation pair exactly equals the accepted public Dialog `f0d68ec7df329cb5b39fc5a1116c469bfb63fca5` pair, under the bounded two-file lease. No whole Dialog dependency/prerequisite is added.

[Actual full-body correspondence](source-correspondence.md), [runtime/type graphs](scope.json) and [repair receipt](repair.json) cover the used closure. Developer comparison read all40 Original and35 current native component bodies. The generator verifies all53 Original historical archive files against immutable Git and the physical checkout and writes only this successor directory. Original component graph remains40 modules/94edges (35runtime/5type); repaired native graph is35modules/85edges (33runtime/2type). Current test/fixture closure is recorded separately with installed Base UI/React/Svelte/test tools as explicit external boundaries. The actual original installed private completion entry is test-only, not a native runtime dependency; Original pinned helper bodies remain the source authority.

Native $state/$derived, pre-DOM/post-DOM effects, actual host refs/attachments and browser defaults are retained. Loading source/options order, stale callbacks, keepMounted/no detached probe, ref-less events, initial complete rendered suppression, callback-before-Root publication, idle suppression/teardown and Fallback monotonic delay remain. The existing AV-01 lexical-source observer and within-frame/native renderer limits are documented; no React render snapshot, activation, geometry or generic controller is introduced.

Executed bounded validation:

| Check | Result |
| --- | --- |
| Package build; library typecheck | PASS;0 errors/0 warnings |
| Avatar + Checkbox/Switch + Radio + Field.Error ownership DOM |186/186 in8files; one worker |
| Actual pinned React/native leased completion ordering/teardown/dynamic batch supplements |12/12; one worker |
| Avatar SSR Vitest |5/5 |
| Paired no-browser SSR + immutable provenance |3/3 |
| Isolated packed public root/subpath SSR and all7 exported type pairs |PASS |
| Exact leased helper hashes and immutable source archive equality |2/2 helpers;53/53 bodies |

The12 completion supplements retain accepted shared-helper commit/abort assertions and add zero Avatar ordinary credit. Actual sibling callers were read in full: Checkbox/Radio indicators use true batch and Field.Error uses default false batch. Component DOM supplements exercise those actual consumers; helper comparisons separately prove the shared policy. Existing44ordinary declarations/44variants,0parameterization,3conformance calls/45native helper instances and6type assertions are unchanged.

**Final acceptance pending:** fresh independent exact-head complete Source/native/maintainability review, required Standards/Verification, secured current paired browser, final PM approval/publication and expected-head normal merge. Targeted passes and implementation authorization do not satisfy those gates. This record grants no retroactive source-first or invented assertion credit.
