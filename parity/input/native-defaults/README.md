# Native input defaults after source realignment

The user directed on 2026-10-03 UTC that Base UI composition/business logic remain source-derived while native elements keep Svelte defaults. Current Input is a thin Field.Control wrapper and has no private restore scheduler, property tracker, checked replay or reset observer. Direct SvelteKit descriptors remain native.

The `historical/` files preserve the exact removed-kernel phase/reset assertions from prior PR41 checkpoint `c69d2826e217726de5a300be9f7bf817a910b8bd` for comparison. They are source evidence outside active Vitest collection, not unused runtime or exemptions for the new implementation. In particular, the four unchanged `it.fails` reset witnesses are retained only for the implementation that owned the old pending-restore state. The current native comparison introduces no expanded unsupported classification and no expected failures.

Current DOM tests compare real Input to literal Svelte inputs through input dispatch, distinct owner writes, same-turn reset, canceled reset, imperative reassociation and stopped reset propagation. Checked lifecycle and click-consumer mutation supplements retain their actual React reference assertions and compare the new Input with genuine native Svelte hosts. These are supplemental characterization, with zero ordinary Input/Field parity credit. Compilation and execution are pending shared renderer integration; no current-head pass is claimed here.

The private UI48 matrix is not copied into this repository. Six independent case witnesses cover the diagnosed checked/default lifecycle scope without treating the matrix's raw observations as executed tests.
