# Select source preparation

This branch is preparation only. Select is unimplemented. The complete manual precode proposal is available for independent source/native/maintainability review and Root approval. There is no approved source plan, helper lease, runtime acceptance, executed Select assertion credit or merge approval.

The immutable baseline is Original Base UI v1.8.0, MIT, commit [`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`](https://github.com/mui/base-ui/commit/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). All archived `.txt` bodies are evidence only. They are never runtime imports and do not prove business fidelity.

The new owned worktree starts at accepted main `95d3d2ae473dc18a2b9a48112284383a2c392315`. [Preparation provenance](preparation-provenance.json) records a separate unknown dirty predecessor read-only. Its generated files and extractor were not copied. The current generator independently reads physical Original files and verifies each byte sequence against the immutable Git blob from `git ls-tree` before archiving it.

Historical integrations are retained in [history](history/native-precode-94c23.json.gz). Current main `aa4daff54ec82b96e34e1601648d1b3926ef08cf` is normally integrated. [Source plan](source-plan.md), [correspondence](source-correspondence.md), [native composition](native-composition.md) and [manual gates](manual-test-plan.md) now use its native owners, utility package and direct snippets. The [checkpoint](reading-checkpoint.json) separates historical attestations, refreshed identities and pending independent review.

Original extraction remains pinned to TypeScript 5.9.3 in an isolated dependency directory, preserving historical AST products. Current native extraction uses the main producer TypeScript 6.0.3. From the repository root:

```sh
NODE_OPTIONS=--max-old-space-size=768 node parity/select/prepare.mjs \
  --upstream /path/to/base-ui-git \
  --source-root /path/to/pinned-base-ui-checkout \
  --dependencies /path/to/isolated-typescript-5.9.3
```

Use `--check` to verify reproducibility without writing generated products. `--dependencies` selects a directory containing the normal installed TypeScript dependency; it is not an absolute module import. `--source-root` may differ from the Git repository when a partial clone has missing promisor objects. Every read still fails unless its content hashes to the exact pinned blob. No dependency installation or package change is included here.

The native extractor records the single current-main provider `aa4daff54ec82b96e34e1601648d1b3926ef08cf`; use a checkout whose actual bytes match that commit:

```sh
source scripts/toolchain.sh
NODE_OPTIONS=--max-old-space-size=512 node parity/select/prepare-native.mjs \
  --main /path/to/accepted-main-checkout \
  --dependencies packages/base --check
```

It generates helper and fixture graphs separately, verifies complete Git blob/body hashes and native script imports, and follows the actual Utils package source rather than treating it as external. There are no pending overrides. The graphs omit unimplemented Select/unsynced-root/PR73 leaves explicitly; neither supplies implementation or assertion credit.

Existing main useTransitionStatus/useButton functions are included by exact identity, with their required canonical class representations explicitly pending a separate prerequisite owner. This does not invent extra business leaves or accept those functions as final class providers.

The separately proposed [remote ownership/type contract](remote-select-contract.md) gives explicit manual/remote ownership, live fallback/reset rules, a guarded public writer and correlated Root/Trigger render payload. Actual SDK Select routes are string/string[] only; number/boolean leaves remain negatives for remote Select, while core nonremote Select keeps its full generic API. This is a reviewable proposal, not a type/runtime implementation or an inferred lease.

The evidence currently contains:

- [751 immutable MIT archives and SHA-256 manifest](archive-manifest.json), including every Select family source/type/data-attribute file and conservative source/test closure.
- [195-module conservative source graph](source-graph.json) and [178-module member-selected graph](selected-source-graph.json), preserving runtime/type-only reachability, imported/reexported symbols, caller lines, full-module members and hashes. Barrel fanout is provenance; it does not authorize unrelated feature prerequisites.
- [741-module conservative test/helper graph](test-helper-graph.json) and [279-module member-selected graph](selected-test-helper-graph.json).
- [Original assertion inventory](original-assertions.json): 22 Select test/spec files, three actual seam test files, and eleven selected harness/helper files. There is no pinned `serializeValue.test.ts`; serialization is exercised through the real value/label/Select bodies and later supplements must remain separately classified.
- [175-module current-main helper/Form graph](proposed-native-helper-graph.json.gz), 15,235 lines and 665 edges, with provider/member/caller/type provenance.
- [199-module current-main fixture graph](proposed-native-fixture-graph.json.gz), 17,375 lines and 830 edges. Actual fixture-only additions are not Select runtime prerequisites; useOpenInteractionType remains a core Root seed.

The inventory has 377 declaration sites across its 36 files, five parameterization sites, eighteen conformance/helper invocation sites and twenty type sites. The manual plan distinguishes 314 plain Select declarations plus four parameterized sites, 34 plain shared-seam declarations plus one parameterized site, and 24 harness generator sites. Manual reading identifies eleven literal Select rows and four helper rows; those are proposed variants, not executed or credited ports. All records remain `unported` with zero unchanged ordinary credit. Native renderer/default differences must retain Original expectations and earn zero unchanged credit; future actual native supplements remain a separate category.

Preparation validation verifies archives, provider Git blobs, AST graph construction and reproducibility only. The separate manual notes record whole-body business reading; validation cannot establish that reading or business equivalence. Neither establishes executed behavior or clears implementation/review/CI/secured browser/public-package gates.

The governing [source-porting gate](../../docs/source-porting.md), [requirements tracker](https://chatgpt.com/space/page_a2f16e7472408191ba98a44acf7220c8) and its [detailed requirements](https://chatgpt.com/space/page_17faf851e2088191aef858570427c7fa) remain binding. Shared source helpers require one canonical implementation. Root must approve the complete source/native composition, lifetime, control/value/label, hidden form/validation, defaults, ref/render, SSR/hydration, public generic/negative types and behavioral plan before Select runtime work. Shared business changes need a separate scoped lease.

The [complete per-body Source mapping](per-body-source-mapping.json) records each of the 178 selected Source bodies and ten extra Select public data files individually: exact Original hashes/selected members, actual provider paths/symbols or native primitives/missing owners, and separate business/native/maintainability assessments with collective reader attribution. Hash identity is not that assessment. The [existing-provider appendix](existing-provider-appendix.json) adds the three concrete current-main bodies outside the recorded 209-module native union: getPseudoElementBounds, PreviousValue and warn. Original and historical provider graphs remain unchanged; this appendix does not pretend those bodies were already included.

The [209-row actual native mapping](per-body-native-mapping.json) plus three-body appendix records collective physical review scope of 212 providers; it does not alter retained graph counts or accept missing class representations.

The historical receipt is [losslessly gzip-packed](history/native-precode-94c23.json.gz) with a [raw-byte and storage manifest](history/native-precode-94c23-storage.json). Deterministic gzip uses level 9, mtime 0 and no filename. All historical reader attestations and JSON bytes remain unchanged after decompression; this changes storage only and adds no acceptance or credit. From the repository root:

```sh
gzip -dc parity/select/history/native-precode-94c23.json.gz > /tmp/select-native-precode-94c23.json
git hash-object /tmp/select-native-precode-94c23.json
# expected: 431785b57da3374fe697fa10bac13e44c5779cfd
```

Actual `nativeProps.ts:toNativeStyle` on current main suppresses an authored empty CSS string through its falsy guard. The [exact PR73 review](https://github.com/sveltery/base/pull/73#pullrequestreview-5434640789) and [witness receipt](https://github.com/sveltery/base/pull/73#issuecomment-6025527104) report client literal/dynamic/spread bare Svelte retaining an empty style attribute while Listbox drops it; SSR literal/spread retain it, but dynamic and Listbox omit it. PR70 has not rerun those witnesses. Pinned React CSSProperties excludes string; React omits undefined, empty object and empty string while retaining valid nonempty objects. No approved native empty-string normalization decision was found; this is a native transport acceptance dependency, not a newly verified upstream bug. PR73 is the sole canonical repair owner. No helper copy or runtime repair is made here. Its observed head `74c437a9a337a26fd808f44f6fa36f7d7542385b` is open/draft (mergeable, unstable), which grants no acceptance. This transport dependency blocks future implementation acceptance until the owner’s measured repair, review/gates and accepted-main normal integration. Documentation-only plan acceptance requires substantive independent review of the actual public final head, configured-model review and mandatory hosted CI; it does not require completion of the documented runtime prerequisites. This transport acceptance dependency is separate from the five absent business leaves and the reached pending canonical owner representations, with zero unchanged assertion credit.

Current native graphs are losslessly gzip-packed. Their [helper storage manifest](proposed-native-helper-graph-storage.json) and [fixture storage manifest](proposed-native-fixture-graph-storage.json) record exact raw Git blob, SHA-256, byte length and compressed identity. The generator checks both decompressed JSON bytes and deterministic storage bytes; graph counts, business selection and reader scope are unchanged. To inspect from the repository root:

```sh
gzip -dc parity/select/proposed-native-helper-graph.json.gz > /tmp/proposed-native-helper-graph.json
git hash-object /tmp/proposed-native-helper-graph.json
gzip -dc parity/select/proposed-native-fixture-graph.json.gz > /tmp/proposed-native-fixture-graph.json
git hash-object /tmp/proposed-native-fixture-graph.json
```

Compare each result with its manifest's `originalGitBlob`. This storage change grants no source, runtime or assertion acceptance.

Historical graph names inside `plan-repair-evidence.json` and immutable historical receipts identify their original products and are preserved; they are not links to the current storage files. Current graph references use gzip products and their manifests.

The complete current [owner representation inventory](canonical-owner-classification.json) distinguishes runtime/fixture retained owner functions, existing classes, native glue, type-only audit scope and stateful Source utilities. The earlier Button/Transition list is not exclusive. No new missing business leaf, helper acceptance or runtime implementation is claimed.

Authored remote Select requires the separately proposed explicit `Field.Control authoredSelect={true}` discriminator plus a valid select-kind/render snippet. Existing select-kind native render snippets without that flag retain their current route/payload/callbacks; render or kind alone never opts in. Missing render or wrong resolved kind is an explicit configuration/type error. See [remote contract](remote-select-contract.md) and the configured-review [route finding](https://github.com/sveltery/base/pull/70#discussion_r4200861285); this is documentation only, not API/runtime acceptance.

Current owner precision: usePopupHandleStore retains per-instance committed hydration history and is explicitly assigned to the pending canonical Popup class owner, as is useAnchoredPopupScrollLock eligibility state. useAnimationsFinished delegates persistent frame state to the real AnimationFrame class; its observer/signal/retry closures are per invocation and pendingCallbacks remains module-shared Source batching. No additional completion facade class is needed. See the corrected [owner inventory](canonical-owner-classification.json), including preserved prior-public classification provenance. The runtime owner-row count remains 28; no provider acceptance or new missing business leaf is claimed.
