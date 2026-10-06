# Standalone Separator

`Separator` is exported from `@sveltery/base` and `@sveltery/base/separator`. It renders a native div with `role="separator"`, explicit `aria-orientation="horizontal"` and `data-orientation="horizontal"`. `orientation="vertical"` changes both orientation attributes and the state passed to class/style callbacks and render snippets. Native props use the existing rightmost precedence, so an explicit role or ARIA override wins without changing orientation state.

```svelte
<script lang="ts">
  import { Separator } from '@sveltery/base';
</script>

<Separator orientation="vertical" class="divider" />
```

State has exactly `{ orientation }`. The shared Svelte composition contract accepts native events, string CSS, ClassValue or state callbacks, a replacement render snippet and `bind:ref`; supplied attachment props must be spread on the actual replacement host. Ref cleanup publishes null. The approved initially undefined ref adaptation also applies.

Behavior source is [Separator.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/separator/Separator.tsx) at Base UI 1.8.0 commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. [The feature record](../parity/separator/README.md) preserves ordinary role/orientation assertion sources and separate conformance helper evidence. Implementation, completed source ports and exact-head review/CI are separate statuses; no whole-library parity is claimed.

Native ClassValue object/nested-array values and callback results are normalized before the render snippet receives props. This preserves their class tokens when a replacement follows `mergeProps(props, { class: ... })`; string-only mergeProps and shared Element remain unchanged. Local ClassValue regressions are supplemental evidence with zero ordinary declaration credit.

The coordinated [navigation source audit](../parity/toggle-toolbar/source-correspondence.md) simplifies Separator to its original direct canonical RenderElement composition and native public types. Its existing role, orientation and override business is retained; historical acceptance records remain intact. Toolbar.Separator is a thin actual Separator wrapper with an opposite-toolbar orientation default followed by caller overrides.
