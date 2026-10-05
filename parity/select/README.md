# Select source preparation

This branch is preparation only. Select is unimplemented. The complete manual precode proposal is available for independent source/native/maintainability review and Root approval. There is no approved source plan, helper lease, runtime acceptance, executed Select assertion credit or merge approval.

The immutable baseline is Original Base UI v1.8.0, MIT, commit [`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`](https://github.com/mui/base-ui/commit/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). All archived `.txt` bodies are evidence only. They are never runtime imports and do not prove business fidelity.

The new owned worktree starts at accepted main `95d3d2ae473dc18a2b9a48112284383a2c392315`. [Preparation provenance](preparation-provenance.json) records a separate unknown dirty predecessor read-only. Its generated files and extractor were not copied. The current generator independently reads physical Original files and verifies each byte sequence against the immutable Git blob from `git ls-tree` before archiving it.

Accepted main `dc2fb8247750b519efab708fc221c201f8cfd517`, then `c1600456d3b4e72910d42823b9df69280c74a262`, were subsequently merged normally into this owned branch. The proposed [source/native plan](source-plan.md), [manual business correspondence](source-correspondence.md), [actual native composition](native-composition.md) and [manual assertion/supplement plan](manual-test-plan.md) distinguish the accepted click/store/scroll-edge foundations from the still-pending Popup helper bridge. The [reading checkpoint](reading-checkpoint.json) records complete whole-body reading independently of archive identity, source acceptance and runtime assertion mapping.

From the repository root, with the repository-pinned TypeScript 5.9.3 installed:

```sh
NODE_OPTIONS=--max-old-space-size=768 node parity/select/prepare.mjs \
  --upstream /path/to/base-ui-git \
  --source-root /path/to/pinned-base-ui-checkout \
  --dependencies packages/base
```

Use `--check` to verify reproducibility without writing generated products. `--dependencies` selects a directory containing the normal installed TypeScript dependency; it is not an absolute module import. `--source-root` may differ from the Git repository when a partial clone has missing promisor objects. Every read still fails unless its content hashes to the exact pinned blob. No dependency installation or package change is included here.

The independent native extractor records the concrete proposed providers at accepted main `c1600456…` and pending Popup `ad8381b4…`; use checkouts whose actual bodies match those commits:

```sh
NODE_OPTIONS=--max-old-space-size=768 node parity/select/prepare-native.mjs \
  --main /path/to/accepted-main-checkout \
  --popup /path/to/pending-popup-checkout \
  --dependencies packages/base --check
```

It generates the Select helper and actual test-fixture graphs separately, including native Svelte script imports and complete markup/body hashes. The only pending overrides of existing main files are the three geometry bridge files named in the native comparison. Neither graph grants helper acceptance or creates a new public feature prerequisite from an unused export. External package edges are recorded; their declarations are not claimed manually read.

The evidence currently contains:

- [751 immutable MIT archives and SHA-256 manifest](archive-manifest.json), including every Select family source/type/data-attribute file and conservative source/test closure.
- [195-module conservative source graph](source-graph.json) and [178-module member-selected graph](selected-source-graph.json), preserving runtime/type-only reachability, imported/reexported symbols, caller lines, full-module members and hashes. Barrel fanout is provenance; it does not authorize unrelated feature prerequisites.
- [741-module conservative test/helper graph](test-helper-graph.json) and [279-module member-selected graph](selected-test-helper-graph.json).
- [Original assertion inventory](original-assertions.json): 22 Select test/spec files, three actual seam test files, and eleven selected harness/helper files. There is no pinned `serializeValue.test.ts`; serialization is exercised through the real value/label/Select bodies and later supplements must remain separately classified.
- [173-module proposed native helper/Form graph](proposed-native-helper-graph.json), 13,351 lines and 697 edges, with immutable accepted/pending provider/member/caller/type provenance.
- [201-module native fixture comparison](proposed-native-fixture-graph.json), 15,476 lines and 878 edges, adding 38 actual Popover/hover/Toolbar source bodies beyond the first native graph without treating fixture helpers as Select runtime prerequisites.

The inventory has 377 declaration sites across its 36 files, five parameterization sites, eighteen conformance/helper invocation sites and twenty type sites. The manual plan distinguishes 314 plain Select declarations plus four parameterized sites, 34 plain shared-seam declarations plus one parameterized site, and 24 harness generator sites. Manual reading identifies eleven literal Select rows and four helper rows; those are proposed variants, not executed or credited ports. All records remain `unported` with zero unchanged ordinary credit. Native renderer/default differences must retain Original expectations and earn zero unchanged credit; future actual native supplements remain a separate category.

Preparation validation verifies archives, provider Git blobs, AST graph construction and reproducibility only. The separate manual notes record whole-body business reading; validation cannot establish that reading or business equivalence. Neither establishes executed behavior or clears implementation/review/CI/secured browser/public-package gates.

The governing [source-porting gate](../../docs/source-porting.md), [requirements tracker](https://chatgpt.com/space/page_a2f16e7472408191ba98a44acf7220c8) and its [detailed requirements](https://chatgpt.com/space/page_17faf851e2088191aef858570427c7fa) remain binding. Shared source helpers require one canonical implementation. Root must approve the complete source/native composition, lifetime, control/value/label, hidden form/validation, defaults, ref/render, SSR/hydration, public generic/negative types and behavioral plan before Select runtime work. Shared business changes need a separate scoped lease.
