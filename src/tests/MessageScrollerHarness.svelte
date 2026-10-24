<script lang="ts">
	import { untrack } from 'svelte';
	import {
		MessageScroller,
		type MessageScrollerController,
		type MessageScrollerDefaultScrollPosition
	} from '#lib';
	import MessageScrollerProbe from './MessageScrollerProbe.svelte';
	import MessageScrollerVisibility from './MessageScrollerVisibility.svelte';

	type Message = {
		id: string;
		height?: number;
		key?: string;
		register?: false;
		scrollAnchor?: boolean;
	};
	type Options = {
		messages: Message[];
		autoScroll?: boolean;
		defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
		scrollMargin?: number;
		preserveScrollOnPrepend?: boolean;
		contentPaddingStart?: number;
		contentPaddingEnd?: number;
		contentRole?: string;
		contentAriaBusy?: boolean;
		contentAriaRelevant?: 'additions text';
		restoreMessageId?: string;
		observeVisibility?: boolean;
		onStartClick?: (event: MouseEvent) => void;
	};

	let { initial }: { initial: Options } = $props();
	let options = $state(untrack(() => initial));
	let scroller: MessageScrollerController | undefined;
	let scrollableRuns = 0;

	export function update(next: Partial<Options>) {
		options = { ...options, ...next };
	}
	export function api() {
		return scroller!;
	}
	export function scrollableEffectRuns() {
		return scrollableRuns;
	}
</script>

<MessageScroller.Provider
	autoScroll={options.autoScroll}
	defaultScrollPosition={options.defaultScrollPosition}
	scrollMargin={options.scrollMargin}
>
	<MessageScroller.Root data-testid="scroller">
		<MessageScrollerProbe
			capture={(value) => (scroller = value)}
			restore={options.restoreMessageId}
			onscrollable={() => (scrollableRuns += 1)}
		/>
		<MessageScroller.Viewport
			data-testid="viewport"
			preserveScrollOnPrepend={options.preserveScrollOnPrepend}
		>
			<MessageScroller.Content
				data-testid="content"
				data-padding-start={options.contentPaddingStart ?? 0}
				data-padding-end={options.contentPaddingEnd ?? 0}
				role={options.contentRole}
				aria-busy={options.contentAriaBusy}
				aria-relevant={options.contentAriaRelevant}
			>
				{#each options.messages as message (message.key ?? message.id)}
					<MessageScroller.Item
						data-testid="message"
						data-test-height={message.height ?? 40}
						messageId={message.register === false ? undefined : message.id}
						scrollAnchor={message.scrollAnchor}>{message.id}</MessageScroller.Item
					>
				{/each}
			</MessageScroller.Content>
		</MessageScroller.Viewport>
		<MessageScroller.Button data-testid="button">Scroll</MessageScroller.Button>
		<MessageScroller.Button
			data-testid="start-button"
			direction="start"
			onclick={options.onStartClick}
		/>
		<MessageScroller.Button>
			{#snippet render(props, state)}
				<button {...props} data-testid="rendered" data-state="{state.direction} {state.active}"
					>Custom</button
				>
			{/snippet}
		</MessageScroller.Button>
		{#if options.observeVisibility}<MessageScrollerVisibility />{/if}
	</MessageScroller.Root>
</MessageScroller.Provider>
