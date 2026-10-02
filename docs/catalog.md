# Component catalog accounting

The immutable Base UI 1.8.0 [root index](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/index.ts) exports 42 non-type modules. [catalog.json](../parity/catalog.json) accounts for each module, including providers and utilities. A bounded export means selected functionality exists; it does not mean complete component or upstream assertion parity.

| Local surface | Scope and limits |
| --- | --- |
| [Button](../parity/button/README.md) | Standalone native/custom button, keyboard and disabled behavior; broader conformance remains incomplete. |
| [Dialog](dialog-first-slice.md) | Contained parts and selected reviewed focus/portal/state behavior; complete Dialog and detached handles remain incomplete. |
| [Toast](../parity/toast/rendering-interface.md) | Bounded store/rendering and standalone Portal; gestures, anchored positioning and remaining conformance remain incomplete. |
| [Separator](separator.md) | Standalone divider, orientation, native prop overrides and composition; acceptance gates are recorded separately. |
| [Toggle](../parity/toggle/README.md) | Standalone pressed state, cancellable callbacks and disabled behavior; ToggleGroup, Toolbar and shared conformance remain deferred. |
| [Progress](progress.md) | Root, Label, Track, Indicator and Value with range normalization, formatting and status; ordinary, parameterized and conformance evidence remain separately counted. |
| merge-props | Bounded native prop/event merge foundation; see [contracts](upstream-contracts.md). |

These seven modules are bounded and the remaining 35 are unimplemented. No module is labeled fully compatible. Field and Form have no placeholders or exports. The catalog denominator includes modules such as direction-provider and use-render; it is not a component count or a passing-test denominator. All unimplemented names remain visible in the machine-readable ledger.

The [ordinary assertion inventory](../parity/README.md) is separately scoped. Shared conformance helpers, paired framework executions and local supplements do not inflate its declaration credit. The dedicated Toggle ledger records five standalone declarations separately from the shared ordinary inventory; its two ToggleGroup-dependent declarations remain deferred and uncredited. Input and remaining controls require their own bounded characterization and review.
