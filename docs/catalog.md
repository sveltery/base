# Component catalog accounting

The immutable Base UI 1.8.0 [root index](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/index.ts) exports 42 non-type modules. [catalog.json](../parity/catalog.json) accounts for each module, including providers and utilities. A bounded export means selected functionality exists; it does not mean complete component or upstream assertion parity.

| Local surface | Scope and limits |
| --- | --- |
| [Button](../parity/button/README.md) | Standalone native/custom button, keyboard and disabled behavior; broader conformance remains incomplete. |
| [Dialog](dialog-first-slice.md) | Contained parts and selected reviewed focus/portal/state behavior; complete Dialog and detached handles remain incomplete. |
| [Toast](../parity/toast/rendering-interface.md) | Bounded store/rendering and standalone Portal; gestures, anchored positioning and remaining conformance remain incomplete. |
| [Separator](separator.md) | Standalone divider, orientation, native prop overrides and composition; acceptance gates are recorded separately. |
| [Toggle](../parity/toggle/README.md) | Standalone pressed state, cancellable callbacks and disabled behavior; ToggleGroup, Toolbar and shared conformance remain deferred. |
| [Input](input.md) | Thin source Field.Control wrapper with native Svelte input/default/reset semantics and optional shared Field state/validation; remaining control families and remote API acceptance are separate. |
| [Progress](progress.md) | Root, Label, Track, Indicator and Value with range normalization, formatting and status; ordinary, parameterized and conformance evidence remain separately counted. |
| [Collapsible](collapsible.md) | Root/Trigger/Panel with bounded measurement and CSS motion lifecycle; six external React.Activity cases and shared conformance remain deferred. |
| [Meter](meter.md) | Root, Label, Track, Indicator and Value with numeric range normalization, formatting and empty state; declaration, parameterized and conformance evidence remain separately counted. |
| [Avatar](avatar.md) | Root/Image/Fallback with detached and rendered loading, fallback timing and private presence; ordinary declarations, conformance, types and supplements remain separately counted. |
| [Accordion](accordion.md) | Root/Item/Header/Trigger/Panel, array values and bounded motion; external React.Activity and complete conformance remain deferred. |
| [DirectionProvider](direction-provider.md) | Nearest-provider direction, default ltr and a retained callable reader; primitive hook typing and same-turn timing differ, and directional control integration remains deferred. |
| [CSPProvider](csp-provider.md) | Provider/context foundation with reactive optional nonce and style flag; ScrollArea/Select/script consumers and all four ordinary CSP assertions remain deferred. |
| [UseRender](use-render.md) | Native component/default host and replacement snippets; React return typing, lazy/Flight/RSC and diagnostics remain deferred, and native identity/teardown observations differ. |
| [Field](field-form.md) | Source Root/Control/Label/Description/Error/Validity/Item, contexts, registration and optional validation; downstream families and final ordinary credit remain bounded. |
| [Form](field-form.md) | Source validation/focus/submit callbacks and external error ownership, plus typed remote Field children and control descriptors; Kit 2.70.3 cancellation/reset requires the explicit application patch, and complete upstream parity remains unclaimed. |
| [Fieldset](field-form.md) | Source nested disabled precedence, legend association and native rendering; downstream assertions remain separate. |
| [Checkbox](boolean-controls.md) | Source Root/Indicator and actual Field integration; original assertion credit and final source/browser acceptance remain pending. |
| [Switch](boolean-controls.md) | Source Root/Thumb boolean form control with one hidden checkbox, validation and checked callbacks; full parity remains incomplete. |
| [CheckboxGroup](boolean-controls.md) | Source array registration, real inputs and parent-selection logic; ordinary assertion parity remains separate. |
| [Radio and RadioGroup](radio.md) | Source Root/Indicator/Group through actual Composite list/navigation and Field registration; native activation differences and assertion acceptance are separately recorded. |
| [NumberField](number-field.md) | Source Root/Input/Group/Increment/Decrement/ScrubArea/ScrubAreaCursor through real Field/Form registration, locale/step algorithms, hold and scrubbing; complete ordinary assertion parity and exact-head acceptance remain separate. |
| merge-props | Bounded native prop/event merge foundation; see [contracts](upstream-contracts.md). |

These 24 modules are bounded and the remaining 18 are unimplemented. No module is labeled fully compatible. Field, Form and Fieldset now have bounded source ports and public exports. The catalog denominator includes modules such as direction-provider and use-render; it is not a component count or a passing-test denominator. All unimplemented names remain visible in the machine-readable ledger.

The [ordinary assertion inventory](../parity/README.md) is separately scoped. Shared conformance helpers, paired framework executions and local supplements do not inflate its declaration credit. The dedicated Toggle ledger records five standalone declarations separately from the shared ordinary inventory; its two ToggleGroup-dependent declarations remain deferred and uncredited. Full Input/Field/Form integration and remaining controls require their own bounded characterization and review.

The [Collapsible ledger](../parity/collapsible/README.md) separately records 47 ordinary sites / 49 variants, with a portable scope of 41 sites / 43 variants. Six React.Activity cases remain deferred. Local DOM/SSR execution, paired browser executions, conformance helpers, type checks and supplements are distinct from verified ordinary declaration credit.

The [Accordion ledger](../parity/accordion/README.md) separately inventories 39 ordinary sites / 43 variants, portable 38 / 42 and one deferred Activity declaration. Parameterized disabled, conformance, types, supplemental execution and final-head acceptance remain separate.
