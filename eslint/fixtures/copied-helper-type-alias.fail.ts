type ReadingDirection = 'ltr' | 'rtl';

type HostRender<Node extends EventTarget, Snapshot> = Snippet<
	[props: HTMLAttributes<Node>, state: Snapshot, children: RenderChildren]
>;
