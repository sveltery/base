# Tabs

The five Source parts are available through `Tabs` from the package root or `@sveltery/base/tabs`: Root, List, Tab, Panel and Indicator. Individual Source names such as `TabsRoot` and every public state/props/value/change-event type are exported too. This is a source-first port under verification, not a claim of complete assertion parity or final acceptance.

```svelte
<script>
  import { Tabs } from '@sveltery/base/tabs';
</script>

<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project details">
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="history">History</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="overview">Project overview</Tabs.Panel>
  <Tabs.Panel value="history">Project history</Tabs.Panel>
</Tabs.Root>
```

Root defaults to value `0`. A defined `value` controls selection; `null` selects no tab. List defaults to manual activation: arrows move focus, Enter/Space select. `activateOnFocus` selects during eligible focus, and `loopFocus={false}` stops focus at either end. Disabled tabs remain focusable through navigation, but do not activate. An explicit disabled default is honored; an implicit uncontrolled default skips disabled or missing selections. Uncontrolled automatic changes report `initial`, `disabled` or `missing`, cannot be canceled, and reset activation direction to `none`. User changes report `none` and can be canceled through event details.

Panels mount while active and through exit animations; `keepMounted` retains hidden inactive content with native inert semantics. Actual mounted panel registration supplies tab controls IDs; corresponding tab metadata supplies panel labels. ID values use Svelte's native `$props.id()` stable SSR/hydration primitive. Class/style functions, render snippets and native element ref bindings use the shared canonical renderer and attachments.

Indicator exposes the six `--active-tab-*` CSS variables for active tab dimensions and offsets. Its Source geometry accounts for scale, rotation/flip distortion, border/scroll offsets, nested scrollers, own tab translations and subpixel rounding. Resize observers track the List and actual Tab hosts, including render-host replacement. Position/size state is null when a non-null selected value has no matching tab; a null selected value omits Indicator.

`renderBeforeHydration` emits the exact pinned Source script and consumes the real CSPProvider nonce. The canonical native wrapper uses a trusted full raw script tag so Svelte's markers remain outside its body. SSR's HTML parser executes it; fresh native client insertion is inert; native mounting removes it. SSR/client payload identity keeps Svelte's hydration hash consistent. This narrow renderer boundary follows the user's native-Svelte directive and earns zero unchanged renderer assertion credit. The wrapper is restored from the publicly frozen Slider development checkpoint pending normally merged dependency integration.

[Source correspondence and full closure](../parity/tabs/source-correspondence.md), [all-part public inventory](../parity/tabs/public-inventory.json), [typed API snapshot](../parity/tabs/api.json) and [test provenance](../parity/tabs/original-assertions.json) retain distinct evidence. Library build, local type/SSR/DOM checks, official secured browser/CSP/hydration/geometry execution, strict isolated packed consumers, full Standards/Verification, independent exact-head source/native/maintainability review and PM acceptance are recorded separately. Source business bugs remain preserved and require reproducible issue tracking; native framework differences require actual paired evidence. No final acceptance is recorded here.
