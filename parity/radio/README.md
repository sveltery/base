# Radio and RadioGroup source ports

Base UI 1.8.0, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` (MIT), is the source reference. `source-graph.json` records the full recursive import closure, including CompositeRoot, CompositeList, CompositeItem, Field registration and shared helpers before implementation.

The port preserves source business composition while replacing React renderer machinery with native Svelte state, context, attachments and lifecycle. Runtime code remains free of React and SvelteKit. Source review, assertion provenance, native behavior checks and final secured browser acceptance are pending; no ordinary upstream parity credit is claimed by this checkpoint.
