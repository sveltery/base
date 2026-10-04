# Avatar bounded composition repair

This follows the frozen [landed audit](../source-audit/README.md) at `60ac5cfa5806efa6e3024d44023456460ca84b41`, before repair. The Original remains Base UI v1.8.0 immutable `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, MIT. The runtime repair checkpoint is `6c4fc55`; final review must identify its own exact successor head externally. The original audit,53 archived bodies and 44 ordinary declaration hashes/ordered assertions are unchanged.

Image now composes the actual dedicated `useImageLoadingStatus`, canonical `useTransitionStatus`, canonical `useOpenChangeComplete`/`useAnimationsFinished` and canonical `RenderElement`. Root and Fallback use that renderer directly with the feature mapping; Image combines it with the canonical transition mapping. `avatar/animations.ts` and the Avatar legacy Dialog Element/type paths are removed. The shared animation pair exactly equals the accepted public Dialog `f0d68ec7df329cb5b39fc5a1116c469bfb63fca5` pair, under the bounded two-file lease. No whole Dialog dependency/prerequisite is added.

[Actual full-body correspondence](source-correspondence.md), [runtime/type graphs](scope.json) and [repair receipt](repair.json) cover the used closure. Developer comparison read all 40 Original and35 current native component bodies. The generator verifies all 53 Original historical archive files against immutable Git and the physical checkout and writes only this successor directory. Original component graph remains40 modules / 94 edges (35 runtime / 5 type); repaired native graph is35 modules / 85 edges (33 runtime / 2 type). Current test/fixture closure is recorded separately with installed Base UI/React/Svelte/test tools as explicit external boundaries. The actual original installed private completion entry is test-only, not a native runtime dependency; Original pinned helper bodies remain the source authority.

Native $state/$derived, pre-DOM/post-DOM effects, actual host refs/attachments and browser defaults are retained. Loading source/options order, stale callbacks, keepMounted/no detached probe, ref-less events, initial complete rendered suppression, callback-before-Root publication, idle suppression/teardown and Fallback monotonic delay remain. The existing AV-01 lexical-source observer and within-frame/native renderer limits are documented; no React render snapshot, activation, geometry or generic controller is introduced.

The strengthened [isolated public consumer gate](../../../scripts/check-avatar-package.sh) checks declarations without skipLibCheck and mounts the actual tarball with its installed Svelte peer. It exercises native replacement attachments/refs, source replacement, event cancellation, callback-before-Root publication and cleanup, then hydrates emitted server HTML with an explicit cached-completion model. Its shell-embedded ephemeral installed modules are a separate test-only boundary in the repair receipt; they are not library runtime modules or browser paint evidence.

Executed bounded validation:

| Check | Result |
| --- | --- |
| Package build; library typecheck | PASS; 0 errors / 0 warnings |
| Avatar + Checkbox/Switch + Radio + Field.Error ownership DOM |186 / 186 in 8 files; one worker |
| Actual pinned React/native leased completion ordering/teardown/dynamic batch supplements |12 / 12; one worker |
| Avatar SSR Vitest |5 / 5 |
| Paired no-browser SSR + immutable provenance |3 / 3 |
| Isolated packed public root/subpath SSR, all 7 type pairs, native DOM and cached hydration model |PASS; strict with skipLibCheck:false |
| Full repository Standards before public-script supplement |PASS |
| Exact leased helper hashes and immutable source archive equality |2 / 2 helpers;53 / 53 bodies |

The 12 completion supplements retain accepted shared-helper commit/abort assertions and add zero Avatar ordinary credit. Actual sibling callers were read in full: Checkbox/Radio indicators use true batch and Field.Error uses default false batch. Component DOM supplements exercise those actual consumers; helper comparisons separately prove the shared policy. Existing 44 ordinary declarations / 44 variants,0 parameterization, 3 conformance calls/45 native helper instances and 6 type assertions are unchanged.

**Final acceptance pending:** fresh independent exact-head complete Source/native/maintainability review, required Standards/Verification, secured current paired browser, final PM approval/publication and expected-head normal merge. Targeted passes and implementation authorization do not satisfy those gates. This record grants no retroactive source-first or invented assertion credit.
