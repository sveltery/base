# Toggle, ToggleGroup and Toolbar

Import `Toggle`, `ToggleGroup` and `Toolbar` from `@sveltery/base`, or their `toggle`, `toggle-group` and `toolbar` subpaths. Toggle’s `pressed`/`defaultPressed` default false. A group owns `value`/`defaultValue` arrays of string values; `multiple=false`, `orientation='horizontal'` and `loopFocus=true`. Give grouped toggles explicit values when initializing group selection.

```svelte
<script lang="ts">
  import { Toolbar, ToggleGroup, Toggle } from '@sveltery/base';
</script>

<Toolbar.Root aria-label="Formatting">
  <Toolbar.Button>Save</Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.Group>
    <ToggleGroup multiple defaultValue={['bold']}>
      <Toggle value="bold">Bold</Toggle>
      <Toggle value="italic">Italic</Toggle>
    </ToggleGroup>
  </Toolbar.Group>
  <Toolbar.Input aria-label="Search" defaultValue="" />
  <Toolbar.Link href="/help">Help</Toolbar.Link>
</Toolbar.Root>
```

A Toggle callback runs before the group callback with the same cancelable details. Canceling either vetoes the source state commit. Controlled values change after their owner accepts the request. Toggle strips native `form` and `type`, and never submits a grouped value to a form.

Toolbar exports exactly Root, Group, Button, Input, Link and Separator. A nested ToggleGroup shares Toolbar’s Composite navigation; a standalone group owns its own list and Home/End behavior. Direction comes from DirectionProvider. Button and Input default to remaining focusable while disabled; direct Toggle items are skipped while disabled. Links remain enabled. Toolbar.Input is a native input with caret-aware navigation, not a Field.Control wrapper. Separator defaults to the opposite Toolbar orientation, and an explicit orientation overrides it.

Native Svelte class/style callbacks receive the original part state. Replacement snippets receive props, state and children; attachments and `bind:ref` resolve the actual host. Same-turn state and callback reads follow native Svelte timing. The [source audit](../parity/toggle-toolbar/source-correspondence.md), [actual exported API snapshot](../parity/toggle-toolbar/api.json) and [difference register](upstream-differences.md#t-01-native-toggle-source-audit-and-real-toolbar-composition) distinguish those native substitutions from original assertions and final acceptance. Cross-family Menu/Select/Popover/AlertDialog/NumberField assertion coverage remains with those families; complete assertion parity is not claimed.
