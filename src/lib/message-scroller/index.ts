import MessageScrollerButton from './MessageScrollerButton.svelte';
import MessageScrollerContent from './MessageScrollerContent.svelte';
import MessageScrollerItem from './MessageScrollerItem.svelte';
import MessageScrollerProvider from './MessageScrollerProvider.svelte';
import MessageScrollerRoot from './MessageScrollerRoot.svelte';
import MessageScrollerViewport from './MessageScrollerViewport.svelte';

export {
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerRoot,
	MessageScrollerViewport
};

/** Compound parts matching @shadcn/react `MessageScroller`. */
export const MessageScroller = {
	Provider: MessageScrollerProvider,
	Root: MessageScrollerRoot,
	Viewport: MessageScrollerViewport,
	Content: MessageScrollerContent,
	Item: MessageScrollerItem,
	Button: MessageScrollerButton
};

export { getMessageScroller, type MessageScrollerController } from './scroller.svelte.js';
export type * from './types.js';
export * from './data-attributes.js';
