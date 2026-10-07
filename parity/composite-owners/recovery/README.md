# PR86 recovery successor

This directory preserves the immutable recovery handoff for public head
`2626b3793f6b877d9d79094cfeb6e2bc3a8535ce` and prepares a new normal integration
with main `abe8aa9b66ab8cd8d83dfdac28ebee94a0655f79`. It does not restore or
publish the old logical tree `683cf3e565c16700426b372b1ed767b3cc86b562`.

`frozen-manifest.json` and `immutable-handoff.txt.gz` retain all 62 old path
entries and the published final implementation. Twenty entries are exactly
recoverable; 42 old paths remain unavailable. `available-and-missing.json`
and `address-observations.json` retain the exact inventory and observations.
The recovered gzip Git blobs are binary bytes, independently checked by Git
blob hash and length. Eight Original bodies were reconstructed from immutable
MIT pin `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, with exact compressed
identity against the manifest. No unavailable old raw execution log was
recreated from a summary.

The maintained List class is the verbatim 8,694-byte published handoff body:
SHA256 `a253618ced977fdb4a961858d7550bf91e3bd686b0a8c9314deb84ee38c3a560`,
Git blob `7edc3e95c86778d338e964a9bf4860bdb3907d46`. The immutable public2626
preimage has SHA256
`71f38c19bcb64f4443f76d533a583cebe826c896a1b22cac6c462c7bcbce07b5`.
The separate native effects preserve ref teardown and ordinary map array
identity. This repairs the generic Source199 branch; the two current
production callers retain stable ref objects. It is not a claim of a new
production bug or acceptance of the whole feature.

The newly authored adapters in `scripts/check-composite-recovery.mjs`, its
loader, two native fixtures and `source-array-witness.tsx` run real Original
ReactDOM and real native Svelte. The unchanged archived Source199 test block
retains all seven assertion predicates. The supplement checks add, reorder,
metadata update, removal, stable arrays and teardown. The public preimage lane
must fail the specific ref-replacement assertion; setup errors cannot count
as red. Candidate and ordinary public-stable lanes must pass. Newly authored
adapters and assertions earn zero additional Original credit.

Fresh local execution remains incomplete: the first bootstrap hit proxy
transport failures; the single authorized standard retry failed at a
read-only pnpm store lock before network access. Existing compiler and
TypeScript bytes were used directly. The actual paired attempt stopped at
missing `tough-cookie`, before assertions. Local compiler/static evidence is
separate from behavioral red/green and hosted acceptance. `local/` contains
actual raw fresh observations; none are old frozen receipts. The bounded
script-suite attempts also retain their raw failures. The required hosted
workflow executes the paired witnesses and preserves raw logs, then retains
the strict real-package SSR/hydration consumer. Secured RadioComposite and all
applicable Standards/Verification/CI gates remain mandatory.

`accepted-main/` preserves the exact accepted PR73 current-source descriptor,
gzip and integration proof/tool before refreshing actual successor producer
outputs. Historical logical hash
`91e619581bf5d5c732937157c107a5bee316937b54f37bc7e3d0ca5d63872e24`
and gzip hash
`2979e278c453e79588b9164ffa35589e02dc0a5cdacf0751377b946b0723dd13`
remain attributable to main, not this successor. The current proof records
12 Composite representation/recovery paths separately and checks actual
current body hashes and ASTs. PR90 remains unmerged and pending; no private
canonical style or HTMLElement body was copied from it.

Independent review covers the complete 250-body Original and 243-body native
closures, then the actual preparation delta. Exact final public-head review
and actual CI are required before acceptance. Preparation review and compiler
success cannot replace those gates. Historical incomplete parity, shared
upstream defects and issue links remain in the feature correspondence and
compatibility register.

## Fresh hosted loader failure and correction

At public `656ca125`, hosted Composite run `37553156443` stopped before any behavioral assertion: the newly authored loader accepted a dependency directory as a file (`EISDIR`). Its exact retrieved log is retained. File checks now require actual files and let ordinary CommonJS resolve directories. An actual local dependency-directory witness reproduced red and then green; the maintained regression passes. This changes only newly authored test tooling. The exact a253 class and every Original/native assertion remain unchanged. Fresh hosted paired execution and all final-head gates remain mandatory; earlier Standards/Radio passes stay attributed to 656ca125.
