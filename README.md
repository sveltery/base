# Sveltery Base

An experimental, unofficial Svelte 5 port of modern [Base UI](https://base-ui.com/).

The first milestone is reusable foundations and a working Dialog slice, followed by early Drawer and Toast acceptance. Compatibility is measured against pinned upstream APIs and behavior; unsupported features and deliberate Svelte differences will be documented explicitly.

This project is independent of MUI and Base UI and is not affiliated with or endorsed by them. Original Sveltery code is licensed under [MIT](LICENSE); upstream-derived materials retain their original notices in [THIRD_PARTY_NOTICES.md](packages/base/THIRD_PARTY_NOTICES.md).

The [docs app](docs/docs-foundation.md) runs at `/docs` beside the existing fixtures. Its navigation, anatomy and API reference are inspired by [Base UI docs](https://base-ui.com/react/overview/quick-start); its example-first flow also credits [shadcn/ui](https://ui.shadcn.com/docs). Sveltery is not affiliated with or endorsed by shadcn/ui. See the visible About & credits page for sources and licenses.

Main contains a [contained Dialog draft](docs/dialog-first-slice.md) and reusable package foundations. See [cloud bootstrap](docs/cloud-bootstrap.md), [architecture](docs/architecture.md), [pinned contracts](docs/upstream-contracts.md), and [parity inventory](parity/README.md). Complete Dialog parity, Drawer and Toast remain pending. Read the exact-head `Dialog browser` job in [CI](https://github.com/sveltery/base/actions/workflows/ci.yml) for current secured Chromium execution counts and results; local browser startup remains blocked. Browser executions include paired reference and supplemental regressions and do not certify the full upstream Dialog inventory.

Read the [upstream differences register](docs/upstream-differences.md) for landed behavioral corrections, framework adaptations and decision/evidence limits.

The [catalog ledger](docs/catalog.md) accounts for every pinned root export module and distinguishes bounded implementations from unimplemented scope. [Standalone Separator](docs/separator.md) adds the native horizontal/vertical divider surface; its source assertions and acceptance gates remain separately recorded.

[Standalone Toggle](parity/toggle/README.md) adds controlled/uncontrolled pressed state with cancellable callbacks and disabled behavior. Its public root/subpath API is bounded; ToggleGroup, Toolbar and complete conformance remain deferred, and final-head acceptance is recorded in PR #27.

[Standalone Input](docs/input.md) preserves a native input and native Svelte default/reset behavior, including direct SvelteKit remote form field spreads in fixtures. Input delegates to the real Field.Control, sharing Field/Form registration, optional contextual validation and label/message integration. Native input ownership stays with Svelte. The [typed remote Field namespace](docs/field-form.md#using-a-remote-form) adds accessor-derived names, bare controls and real Switch render overrides; its bounded delivery evidence is recorded separately in [PR52](https://github.com/sveltery/base/pull/52).

[Progress](docs/progress.md) adds Root, Label, Track, Indicator and Value against the immutable v1.8.0 pin. Its [dedicated declaration and conformance evidence](parity/progress/README.md) remains separately accounted; final-head acceptance is recorded in PR #28.

[Collapsible](docs/collapsible.md) adds Root, Trigger and Panel with a bounded measurement and CSS motion lifecycle. Its [dedicated evidence](parity/collapsible/README.md) separates the portable ordinary scope from six deferred React.Activity cases and final-head acceptance in PR #29.

[Meter](docs/meter.md) adds Root, Label, Track, Indicator and Value from the immutable v1.8.0 pin. Its [dedicated declaration and conformance evidence](parity/meter/README.md) remains separate; final-head acceptance is recorded in PR #32.

[Avatar](docs/avatar.md) adds Root, Image and Fallback with detached-probe and rendered-image keepMounted loading. Its [separate evidence](parity/avatar/README.md) accounts for 44 ordinary sites, three conformance calls and six type assertions; secured browser and exact final-head acceptance remain separate.

[DirectionProvider](docs/direction-provider.md) supplies nearest-provider text direction through a retained Svelte reader, without adding a DOM element. Its [dedicated evidence](parity/direction-provider/README.md) separates two ordinary declarations from adapted type checks and divergent timing characterization; complete control RTL integration remains deferred.

[Accordion](docs/accordion.md) adds Root, Item, Header, Trigger and Panel with array values and cancellable Item-before-Root callbacks. Its [dedicated evidence](parity/accordion/README.md) separates 38 portable ordinary declarations / 42 variants from deferred React.Activity, parameterized, conformance, type and final-head acceptance gates.

[CSPProvider](docs/csp-provider.md) adds a wrapperless provider and optional private CSP context foundation. Its [separate evidence](parity/csp-provider/README.md) keeps all four ScrollArea/Select-dependent ordinary declarations deferred with zero credit; downstream style/script integration remains unimplemented.

[UseRender](docs/use-render.md) exposes a bounded native Svelte component at the root and `@sveltery/base/use-render`; its private closure and explicit identity/teardown differences remain separate from unchanged upstream assertions. React return typing, lazy/Flight/RSC and diagnostics remain unimplemented.

[OTP Field](docs/otp-field.md) adds source Root/Input and shared Separator with actual Field/Form validation and Composite slot registration; native renderer differences and assertion acceptance are recorded separately.
