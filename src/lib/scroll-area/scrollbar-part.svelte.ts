// Scrollbar registration, wheel listening, and host props.
// Derived from Base UI v1.8.0 packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { createAttachmentKey } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { mergeCssStyle } from '../internal/css-style.js';
import { getStateAttributesProps } from '../internal/state-attributes.js';
import { scrollAreaStateAttributesMapping } from './attributes.js';
import type { ScrollAreaModel } from './model.svelte.js';
import { chain } from './style.js';
import { scrollbarTrackStyle } from './track-style.js';

interface ScrollbarInputs {
	orientation: 'vertical' | 'horizontal';
	keepMounted: boolean;
	style: string | null | undefined;
	render: boolean;
	elementProps: HTMLAttributes<HTMLDivElement>;
	onpointerdown: HTMLAttributes<HTMLDivElement>['onpointerdown'];
	onmousedown: HTMLAttributes<HTMLDivElement>['onmousedown'];
	onpointerup: HTMLAttributes<HTMLDivElement>['onpointerup'];
	onpointercancel: HTMLAttributes<HTMLDivElement>['onpointercancel'];
}

export class ScrollbarPart {
	readonly attachmentKey = createAttachmentKey();
	element = $state<HTMLDivElement | null>(null);
	private rendered = $state<HTMLDivElement | null>(null);

	constructor(
		private readonly model: ScrollAreaModel,
		private readonly read: () => ScrollbarInputs
	) {
		$effect(() => {
			if (!this.shouldRender) return;
			const node = this.node;
			if (this.vertical) this.model.scrollbarYElement = node;
			else this.model.scrollbarXElement = node;
			return () => {
				if (this.vertical) {
					if (this.model.scrollbarYElement === node) this.model.scrollbarYElement = null;
				} else if (this.model.scrollbarXElement === node) this.model.scrollbarXElement = null;
			};
		});

		$effect(() => {
			if (!this.shouldRender) return;
			const node = this.node;
			if (!node) return;
			return this.model.listenWheel(node, this.vertical);
		});
	}

	private get inputs() {
		return this.read();
	}

	get vertical() {
		return this.inputs.orientation === 'vertical';
	}

	get shouldRender() {
		const hidden = this.vertical ? this.model.hiddenState.y : this.model.hiddenState.x;
		return this.inputs.keepMounted || !hidden;
	}

	private get node() {
		return this.inputs.render ? this.rendered : this.element;
	}

	remember = (node: HTMLDivElement) => {
		this.rendered = node;
		return () => {
			if (this.rendered === node) this.rendered = null;
		};
	};

	get partState() {
		const { orientation } = this.inputs;
		return {
			...this.model.rootState,
			hovering: this.model.hovering,
			scrolling: this.vertical ? this.model.scrollingY : this.model.scrollingX,
			orientation
		};
	}

	get hostProps(): HTMLAttributes<HTMLDivElement> {
		const inputs = this.inputs;
		const hideTrack = !this.model.hasMeasuredScrollbar && !inputs.keepMounted;
		return {
			...getStateAttributesProps(this.partState, scrollAreaStateAttributesMapping),
			...(this.model.rootId ? { 'data-id': `${this.model.rootId}-scrollbar` } : {}),
			'aria-hidden': true,
			...inputs.elementProps,
			style: mergeCssStyle(
				scrollbarTrackStyle(this.vertical, hideTrack, this.model.thumbSize),
				inputs.style
			),
			onpointerdown: chain(
				(event) => this.model.trackPointerDown(event, this.vertical),
				inputs.onpointerdown
			),
			onmousedown: chain((event) => this.model.trackMouseDown(event), inputs.onmousedown),
			onpointerup: chain((event) => this.model.pointerUp(event), inputs.onpointerup),
			onpointercancel: chain((event) => this.model.pointerUp(event), inputs.onpointercancel),
			...(inputs.render ? { [this.attachmentKey]: this.remember } : {})
		};
	}
}
