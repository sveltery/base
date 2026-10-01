# Release preparation

The workspace and `@sveltery/base` package are currently private, version `0.0.0`. CI prepares and tests a local tarball only. No automated publication is configured.

1. Agree on the intended public API, supported Svelte versions, semver change and compatibility scope. Do not claim unported browser behavior.
2. Prepare version and release-note changes in a focused PR. Preserve `LICENSE` and `THIRD_PARTY_NOTICES.md` in the package.
3. From a fresh checkout, run `bash scripts/bootstrap.sh`, `bash scripts/verify.sh`, and `bash .github/standards/check.sh`. Run the real browser suite when implemented, including SSR/hydration, accessibility, focus and cleanup acceptance for shipped components.
4. Independently review the final head and verify hosted CI for that same SHA. Inspect the local tarball's contents, exports, included notices and consumer imports. Merge through the normal PR process.
5. Obtain separate, explicit maintainer approval for publication, the target registry/package/version, credentials, and any `private` flag change. Only then may a maintainer create a release/tag and publish that approved artifact using an authorized workflow.

If a release has a regression, stop further publication, document the affected version and prepare a reviewed fix. Registry deprecation, unpublishing and deployment changes require their own explicit authorization. Never treat CI success as permission to publish.
