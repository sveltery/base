# Avatar parity evidence

Reference: mui/base-ui v1.8.0, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`; tag was resolved from the official Git repository in this workspace. Source and derived assertions are MIT; [UPSTREAM_LICENSE](UPSTREAM_LICENSE) retains the notice.

[inventory.mjs](inventory.mjs) extracts the exact pinned AST and preserves full source bytes in upstream/ and hashes source files, declaration bodies and ordered assertion expressions into [upstream-inventory.json](upstream-inventory.json). Regenerate/check against a checkout with `node parity/avatar/inventory.mjs ../base-ui-upstream --check`. The immutable trace remains unported; changing execution status belongs in [ports.json](ports.json).

The full ordinary inventory is **44 sites / 44 variants**: Image 34, Fallback 10, Root 0. There are no parameterized ordinary declarations. Three describeConformance calls and six Avatar.spec expectType assertions remain separate. Expanded conformance checks and supplemental regression/SSR/browser checks add zero ordinary sites. No divergent assertion receives parity credit.

Default mode's detached probe and keepMounted's rendered-image mode are both required. Browser-only cached hydration, request ordering and animation assertions require secured paired actual React 1.8.0/Svelte browser execution. DOM mock witnesses cannot substitute for these. Full ordinary assertion ordering must be reviewed against the immutable trace before promotion to passing; source extraction or tests with similar names alone are insufficient.

[Compatibility](compatibility.md) records framework substitutions, observations and limits. [Verification](verification.md) records executed checks separately from final-head merge gates. [Serialized shared patch](shared-integration.md) adds exports and central records through the parent, without editing Meter or shared helpers here.
