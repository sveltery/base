// Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import { defineContext } from '../internal/context.js';
import type { Attachment } from 'svelte/attachments';
import { Container, type Part } from './parts.svelte.js';
import type { GroupEntry, ItemEntry } from './rank.js';
import type { CommandModel } from './root-state.svelte.js';

export interface ItemOptions {
	readonly anchor: string;
	readonly view: Snippet;
	readonly id: string;
	readonly value: string | undefined;
	readonly keywords: readonly string[] | undefined;
	readonly disabled: boolean;
	readonly forceMount: boolean | undefined;
	readonly onSelect: ((value: string) => void) | undefined;
}

export class ItemModel implements ItemEntry<GroupModel>, Part {
	readonly root: CommandModel;
	readonly group: GroupModel | undefined;
	readonly #options: ItemOptions;
	readonly kind = 'item';
	readonly sequence: number;
	element = $state.raw<HTMLElement>();
	#text = $state<string>();

	constructor(root: CommandModel, group: GroupModel | undefined, options: ItemOptions) {
		this.root = root;
		this.group = group;
		this.#options = options;
		this.sequence = root.sequence();
	}

	get anchor(): string {
		return this.#options.anchor;
	}
	get view(): Snippet {
		return this.#options.view;
	}
	get id(): string {
		return this.#options.id;
	}
	get disabled(): boolean {
		return this.#options.disabled;
	}
	get forceMount(): boolean {
		return this.#options.forceMount ?? this.group?.forceMount ?? false;
	}

	value = $derived.by(() => (this.#options.value ?? this.#text)?.trim());
	keywords = $derived.by(() => (this.#options.keywords ?? []).map((keyword) => keyword.trim()));
	selected = $derived.by(() => this.root.view !== undefined && this.root.selectedItem === this);

	measure(): void {
		if (this.element && this.#options.value === undefined) this.#text = this.element.textContent;
	}

	activate(): void {
		const value = this.value;
		if (this.disabled || !value) return;
		this.root.pick(this, false);
		this.#options.onSelect?.(value);
	}

	hover(): void {
		if (this.disabled || this.root.disablePointerSelection || !this.value) return;
		this.root.pick(this, false);
	}

	attach: Attachment<HTMLElement> = (element) => {
		// Reading `this.element` back here would make the attachment depend on its own write and re-run.
		this.#text = element.textContent;
		this.element = element;
		return () => {
			this.element = undefined;
		};
	};
}

export interface GroupOptions {
	readonly anchor: string;
	readonly view: Snippet;
	readonly forceMount: boolean;
}

export class GroupModel implements GroupEntry, Part {
	readonly root: CommandModel;
	readonly #options: GroupOptions;
	readonly kind = 'group';
	readonly sequence: number;
	readonly items: Container;
	headingElement = $state.raw<HTMLElement>();

	constructor(root: CommandModel, options: GroupOptions) {
		this.root = root;
		this.#options = options;
		this.sequence = root.sequence();
		this.items = new Container(root, this);
	}

	get anchor(): string {
		return this.#options.anchor;
	}
	get view(): Snippet {
		return this.#options.view;
	}
	get forceMount(): boolean {
		return this.#options.forceMount;
	}

	hidden = $derived.by(() => (this.root.view ? !this.root.view.visibleGroups.has(this) : false));

	attachHeading: Attachment<HTMLElement> = (element) => {
		this.headingElement = element;
		return () => {
			this.headingElement = undefined;
		};
	};
}

export const [, setGroup, findGroup] = defineContext<GroupModel>(
	'Sveltery Base: CommandGroupContext is missing. Command.Group items must be placed within <Command.Group>.'
);
