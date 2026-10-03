# Boolean controls source ports

Source: Base UI 1.8.0, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` (MIT). The complete recursive import closure for Checkbox, Switch and CheckboxGroup is recorded in `source-graph.json` before implementation. This work supplies real checked-control component families for the accepted remote Field rendering API; it does not replace Field.Control or implement a second validation engine.

Implementation and independent final-head review are pending. No ordinary upstream assertion credit or browser acceptance is claimed by this checkpoint. Framework defaults will remain native Svelte; actual divergent expectations will be documented separately and receive zero unchanged assertion credit.

## Current bounded implementation

Real Switch.Root/Thumb, Checkbox.Root/Indicator and CheckboxGroup/parent-selection source bodies are implemented. They use the source Field/Form/Field.Item and labelable contexts rather than a separate checkbox engine. Source useButton/focus props, native label association, checkbox state mappings, visually-hidden styles, modifier-preserving click, default-submit selection and array equality are shared actual helpers. `source-correspondence.json` maps every module and records immutable hashes; `original-assertions.json` preserves all 237 ordinary declaration-site titles/locations across the six pinned test files without counting parameter expansions or factory calls as extra declarations. Original declaration credit remains zero until complete unchanged bodies are ported and executed.

The focused native suite currently contains 43 supplemental checks. These verify Field/Form registration, values and native successful controls, required/custom validation, server errors, labels, controlled/uncontrolled checked callbacks, accepted/canceled activation, hidden inputs, groups, parts, ref/lifetime cleanup and the explicit native Enter event boundary. Supplement totals do not imply original assertion parity. SSR, isolated public consumers, secured browser evidence and final source review are still in progress.
