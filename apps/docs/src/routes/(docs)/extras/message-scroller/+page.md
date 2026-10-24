# Message Scroller

<Subtitle>
  A chat transcript that follows new messages, anchors each turn and keeps the reader's place.
</Subtitle>

<Meta name="description" content="A chat transcript that follows new messages, anchors each turn and keeps the reader's place." />

<DemoMessageScrollerHero />

Message Scroller ports [`@shadcn/react`](https://github.com/shadcn-ui/ui/tree/main/packages/react)'s message scroller. It follows that package's behavior, not Base UI's.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { MessageScroller } from '@sveltery/base/message-scroller';
</script>

<MessageScroller.Provider>
	<MessageScroller.Root>
		<MessageScroller.Viewport>
			<MessageScroller.Content>
				<MessageScroller.Item />
			</MessageScroller.Content>
		</MessageScroller.Viewport>
		<MessageScroller.Button />
	</MessageScroller.Root>
</MessageScroller.Provider>
```

## Examples

### Anchoring turns

Set `scrollAnchor` on the row that starts a turn, such as the user's message. When a new anchored row arrives, the viewport places it near the top, with `scrollPreviousItemPeek` pixels of the previous row still visible, and holds it there while the reply streams in below. With `autoScroll`, the viewport follows the end again once the reply fills the space below the anchor.

### Avoiding a flash on reload

For the `'end'` and `'last-anchor'` opening positions, the root and the viewport have `data-pending-scroll` until the position is applied. Hide the viewport with `visibility: hidden` while it is set, so the layout still exists for the opening scroll:

```css title="Pending scroll"
.Viewport[data-pending-scroll] {
	visibility: hidden;
}
```

### Reading scroll state

`getMessageScroller()` returns the scroller of the closest provider. Call it while a component initializes. Its `scrollable` and `visibility` getters are reactive. Visibility is tracked only while something reads it.

```svelte title="Outline"
<script lang="ts">
	import { getMessageScroller } from '@sveltery/base/message-scroller';

	const scroller = getMessageScroller();
</script>

<p>Current turn: {scroller.visibility.currentAnchorId ?? 'none'}</p>
<button type="button" onclick={() => scroller.scrollToMessage('m1', { behavior: 'smooth' })}>
	Back to the first message
</button>
```

## API reference

<script>
	import { DemoMessageScrollerHero } from './demos/hero';
	import { TypesMessageScroller } from './types';
</script>

<TypesMessageScroller />
