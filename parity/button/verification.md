# Button verification ledger

2026-10-01, Node 24.19.0 / pnpm 12.6.0. Before implementation an inert native-button baseline was mounted against `tests/dom/button.test.ts`: **7 of 10 Button companions failed** (custom host/role, modifier click, four disabled variants, reactive aria-disabled). The absent preventBaseUIHandler channel also raised three uncaught event errors. The broad command additionally reported seven unrelated fixture import failures because the library distribution had not yet been built. These are recorded separately and earn no red Button assertion credit. Baseline removed before the test-only commit. Detailed transient log: `/tmp/button-red.log`.

No browser execution or passing parity is claimed at the test-first checkpoint. The test-only commit intentionally references the not-yet-implemented Button component.
