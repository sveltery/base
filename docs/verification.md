# Bootstrap verification evidence

Initial checkpoint verified on macOS arm64, Node 24.21.0 and pnpm 12.6.0, 2026-10-01. Foundation QA fixes verified on Linux x86_64, Node 24.19.0 and pnpm 12.6.0 on the same date. The Linux run used a fresh source copy with no installed dependencies or populated tool cache, starting with default pnpm 11.19.0 on PATH; unchanged bootstrap and verification entrypoints selected the pinned version themselves.

| Check | Result |
| --- | --- |
| Frozen-lockfile bootstrap | PASS |
| Library packaging with @sveltejs/package | PASS |
| Library TypeScript/Svelte diagnostics, including three ported upstream type assertions | PASS: 0 errors, 1 warning because no library Svelte components exist yet |
| SvelteKit fixture diagnostics | PASS: 0 errors, 0 warnings |
| Unit regressions | PASS: 11 tests, 2 files; 10 local regressions plus 1 exact upstream runtime port |
| Toolchain and inventory-parser regressions | PASS: 9 tests; matching/missing/mismatched pnpm, nested fallback, pin rejection, multiline conditional extraction, parameterized exclusions and preservation of port metadata |
| Pinned-upstream source inventory audit | PASS: 633 entries against immutable upstream Git objects |
| Fixture SSR/client production build | PASS; adapter-auto reports no detected production target, expected for a local fixture build |
| Runtime framework-import boundary scan and built ESM import | PASS |
| Isolated tarball consumer root/subpath imports and included MIT notice | PASS |
| Dialog/Drawer/Toast implementation and browser acceptance | UNPORTED / NOT RUN |
| Hydration, keyboard focus, nesting, cleanup, geometry and exit animations | NOT RUN |
| Fresh Linux/cloud bootstrap execution with default pnpm 11 | PASS: frozen install plus complete verification selected pnpm 12.6.0 without an external launcher |

`parity/manifest.json` has 633 scoped named test declarations/type assertions: 4 passing ports, 629 unported, 0 failing executed ports, 0 approved deviations. Multiline conditional declarations are included, and interpolated-template names are counted once. The scope excludes parameterized expansion and shared conformance helpers; this count is not a whole-library parity denominator. Test results do not establish Dialog or complete foundation compatibility.

Independent source review caught first-getter mutation, initial undefined style/empty class changes, and weakened type equality; these were corrected. A tarball consumption check caught extensionless ESM imports; these were corrected. Fresh Linux review then caught custom callback payloads misclassified as DOM events, 64 omitted multiline inventory declarations, and verification losing bootstrap's Corepack fallback. These have focused regressions and fixes. Public `mergeProps` typing, real-browser event validation, and Svelte composition need further ports/review before an API guarantee.

An optional cross-iframe Chromium event probe could not start in this container: Chromium reported that its SUID sandbox helper was not configured correctly. No browser sandbox or system settings were changed; browser event evidence remains pending.

The environment's restricted DNS initially blocked registry checks. The successful bootstrap and verification used registry network access; no credentials or security settings were changed. Original Sveltery code is MIT licensed; package tarballs include the project license and preserve upstream MIT notices. The existing GitHub OAuth credential lacks workflow scope; the proposed CI workflow was excluded from the branch instead of changing grants. CI is pending. No package publication, documentation deployment, or PR merge occurred.
