# Bootstrap verification evidence

Verified on macOS arm64, Node 24.21.0 and pnpm 12.6.0, 2026-10-01.

| Check | Result |
| --- | --- |
| Frozen-lockfile bootstrap | PASS |
| Library packaging with @sveltejs/package | PASS |
| Library TypeScript/Svelte diagnostics, including three ported upstream type assertions | PASS: 0 errors, 1 warning because no library Svelte components exist yet |
| SvelteKit fixture diagnostics | PASS: 0 errors, 0 warnings |
| Unit regressions | PASS: 9 tests, 2 files; 8 new regressions plus 1 exact upstream runtime port |
| Fixture SSR/client production build | PASS; adapter-auto reports no detected production target, expected for a local fixture build |
| Runtime framework-import boundary scan and built ESM import | PASS |
| Isolated tarball consumer root/subpath imports and included MIT notice | PASS |
| Dialog/Drawer/Toast implementation and browser acceptance | UNPORTED / NOT RUN |
| Hydration, keyboard focus, nesting, cleanup, geometry and exit animations | NOT RUN |
| Linux/cloud bootstrap execution | NOT RUN locally; shared scripts provided |

`parity/manifest.json` has 569 scoped literal test declarations/type assertions: 4 passing ports, 565 unported, 0 failing executed ports, 0 approved deviations. The scope excludes dynamic/parameterized expansion and shared conformance helpers; this count is not a whole-library parity denominator. Test results do not establish Dialog or complete foundation compatibility.

Independent source review caught first-getter mutation, initial undefined style/empty class changes, and weakened type equality; these were corrected. A tarball consumption check caught extensionless ESM imports; these were corrected. Public `mergeProps` typing, DOM-event detection, and Svelte composition need further ports/review before an API guarantee.

The environment's restricted DNS initially blocked registry checks. The successful bootstrap and verification used registry network access; no credentials or security settings were changed. Original Sveltery code is MIT licensed; package tarballs include the project license and preserve upstream MIT notices. The existing GitHub OAuth credential lacks workflow scope; the proposed CI workflow was excluded from the branch instead of changing grants. CI is pending. No package publication, documentation deployment, or PR merge occurred.
