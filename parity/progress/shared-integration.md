# Serialized Progress integration

Input PR #26 owner `01a0fb67-1f88-77b5-99e4-d0a79168802f` owns shared exports/catalog/runner integration. This branch changes no Input or shared helper file. Dedicated fixture/test imports allow independent Progress work from main `5e6492007b187bc9f7f5296b79917c1715c4b141`.

[shared-integration.patch](shared-integration.patch) contains exact bounded additions for the parent to integrate serially: root exports and named types; package ./progress export; the Progress catalog row/count; central documentation/compatibility index; package-consumer invocation; attribution and root README link. It intentionally leaves the 635-entry ordinary aggregate and existing credits unchanged. No source/inventory credit is inferred from adding a catalog row.

The patch is based on this branch's unchanged shared files at the starting main. Parent must reconcile surrounding Input additions while retaining these exact Progress declarations; apply only after its shared checkpoint is ready. Use `git apply --check parity/progress/shared-integration.patch` to validate the original checkpoint. Public package verification must run `bash scripts/check-progress-package.sh --public` on the complete integrated head; default internal mode is separate evidence and cannot prove public exports.

Current required handoff gates: full checks, paired secured browser execution, final exact-head independent review, configured automatic review and parent-coordinated public exports/consumer gate. The draft PR must remain unmerged until the complete integrated head satisfies all gates and is reported explicitly before merge.
