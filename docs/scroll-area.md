# ScrollArea

`ScrollArea` exports Root, Viewport, Content, Scrollbar, Thumb and Corner from
`@sveltery/base` or `@sveltery/base/scroll-area`, with named `ScrollArea*` aliases
and twelve public Props/State exports.

```svelte
<script lang="ts">
  import { ScrollArea } from '@sveltery/base/scroll-area';
</script>

<ScrollArea.Root style="width:320px;height:240px">
  <ScrollArea.Viewport style="width:100%;height:100%">
    <ScrollArea.Content>Scrollable content</ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar style="width:10px"><ScrollArea.Thumb /></ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal" style="height:10px"
    ><ScrollArea.Thumb /></ScrollArea.Scrollbar
  >
  <ScrollArea.Corner />
</ScrollArea.Root>
```

Root accepts `overflowEdgeThreshold` as a nonnegative number for every edge or a
partial `{ xStart, xEnd, yStart, yEnd }` object. Scrollbar defaults to vertical and
unmounts without overflow; `keepMounted` preserves its element. Viewport becomes
tab-focusable when overflow exists. Native events run consumer handlers before
internal handlers; `event.preventBaseUIHandler()` suppresses the earlier internal
handler without canceling the native event. `bind:ref`, state-dependent `class`
and `style`, native attachments and replacement snippets use the shared renderer.

Viewport CSS metrics are `--scroll-area-overflow-{x,y}-{start,end}` in pixels.
Root supplies `--scroll-area-corner-width/height`; tracks supply
`--scroll-area-thumb-width/height`. Overflow state is reflected on Root, Viewport,
Content and tracks. Thumb and track scrolling state is per axis. DirectionProvider
sets the source RTL algorithms; authored CSS must set the matching direction.

Native Svelte style elements remain owned by each Root, carry CSPProvider nonce,
and honor disableStyleElements. React stylesheet hoisting/deduplication is a
framework boundary, with no unchanged source credit for a divergent observation.
[Source and assertion evidence](../parity/scroll-area/README.md) records current
execution limits and the normal integration of accepted PR55 and Navigation
PR59 plus accepted Button/Avatar main
`95d3d2ae473dc18a2b9a48112284383a2c392315`. All56 used
ScrollArea module bodies and the source/import graph remain unchanged; the root
barrel and package map preserve both families. Exact current-main successor
checks, independent source disposition and PM acceptance remain required.
