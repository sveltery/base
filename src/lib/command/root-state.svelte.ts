// Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
// MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { defineContext } from '../internal/context.js';
import type { Attachment } from 'svelte/attachments';
import { commandScore } from './command-score.js';
import type { GroupModel, ItemModel } from './item-state.svelte.js';
import { ANCHOR_PREFIX, type Container, type Part } from './parts.svelte.js';
import { rank, step, stepGroup, type CommandFilter, type View } from './rank.js';
import type { CommandState } from './types.js';

/** cmdk's default filter: `commandScore` over the value and its keywords. */
export const defaultFilter: CommandFilter = (value, search, keywords) =>
	commandScore(value, search, keywords);

export interface RootOptions {
	readonly id: string;
	readonly shouldFilter: boolean;
	readonly filter: CommandFilter | undefined;
	readonly loop: boolean;
	readonly disablePointerSelection: boolean;
	readonly vimBindings: boolean;
	value: string;
	readonly onValueChange: ((value: string) => void) | undefined;
}

export interface SearchSource {
	readonly value: string;
}

export class CommandModel {
	readonly #options: RootOptions;
	readonly ids: { readonly label: string; readonly input: string; readonly list: string };
	settled = $state(false);
	// Parts register while their component initializes, which may not write state, so the sets are plain and `#layout`
	// is bumped once they mount.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- see above
	readonly #items = new Set<ItemModel>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- see above
	readonly #groups = new Set<GroupModel>();
	#sequence = 0;
	#element: HTMLElement | undefined;
	readonly #scopes = new SvelteSet<HTMLElement>();
	#search = $state.raw<SearchSource>();
	/** `#search` without reactivity, for the unlink, which runs in a teardown. */
	#linked: SearchSource | undefined;
	#layout = $state(0);
	#lastSearch: string | undefined;
	#current = $state.raw<ItemModel>();
	count = $state<number>();
	#scrollRequest = $state.raw<{ readonly item: ItemModel }>();

	constructor(options: RootOptions) {
		this.#options = options;
		this.ids = {
			label: `${options.id}-label`,
			input: `${options.id}-input`,
			list: `${options.id}-list`
		};
	}

	get search(): string {
		return this.#search?.value ?? '';
	}
	get value(): string {
		return this.#options.value ?? '';
	}
	get disablePointerSelection(): boolean {
		return this.#options.disablePointerSelection;
	}

	#anchors = $derived.by(() => {
		void this.#layout;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- built and returned in one derivation
		const anchors = new Map<string, Comment>();
		const scopes = [...this.#scopes];
		for (const scope of scopes) {
			if (scopes.some((other) => other !== scope && other.contains(scope))) continue;
			const walker = document.createTreeWalker(scope, NodeFilter.SHOW_COMMENT);
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const text = (node as Comment).data;
				if (text.startsWith(ANCHOR_PREFIX))
					anchors.set(text.slice(ANCHOR_PREFIX.length), node as Comment);
			}
		}
		return anchors;
	});

	inMarkupOrder<T extends Part>(parts: Iterable<T>): T[] {
		const anchors = this.#anchors;
		const compare = (first: Part, second: Part) => {
			const a = anchors.get(first.anchor);
			const b = anchors.get(second.anchor);
			if (!a || !b) return first.sequence - second.sequence;
			const position = a.compareDocumentPosition(b);
			return position & Node.DOCUMENT_POSITION_FOLLOWING
				? -1
				: position & Node.DOCUMENT_POSITION_PRECEDING
					? 1
					: 0;
		};
		const outer = (part: Part) => (part.kind === 'item' && (part as ItemModel).group) || part;
		return [...parts].sort(
			(first, second) => compare(outer(first), outer(second)) || compare(first, second)
		);
	}

	#ordered = $derived.by(() => {
		void this.#layout;
		return { items: this.inMarkupOrder(this.#items), groups: this.inMarkupOrder(this.#groups) };
	});
	#view = $derived.by(() =>
		rank({
			...this.#ordered,
			search: this.search,
			filter: this.#options.shouldFilter ? (this.#options.filter ?? defaultFilter) : null
		})
	);
	#selected = $derived.by(() => {
		const value = this.value.trim();
		if (value === '') return undefined;
		const current = this.#current;
		if (current?.value === value && this.#view.visibleItems.has(current)) return current;
		return this.#view.ordered.find((item) => item.value === value);
	});

	get view(): View<ItemModel, GroupModel> | undefined {
		return this.settled ? this.#view : undefined;
	}
	get selectedItem(): ItemModel | undefined {
		return this.settled ? this.#selected : undefined;
	}

	readonly state: CommandState = stateOf(this);

	sequence(): number {
		return this.#sequence++;
	}
	register(item: ItemModel): () => void {
		this.#items.add(item);
		return () => {
			this.#items.delete(item);
			this.relayout();
		};
	}
	registerGroup(group: GroupModel): () => void {
		this.#groups.add(group);
		return () => {
			this.#groups.delete(group);
			this.relayout();
		};
	}
	relayout(): void {
		untrack(() => (this.#layout += 1));
	}

	arrange(container: Container, parts: readonly Part[]): Part[] {
		const inOrder = this.inMarkupOrder(parts);
		const view = this.view;
		if (!view) return inOrder;
		const shown = inOrder.filter(
			(part) => part.kind !== 'item' || view.visibleItems.has(part as ItemModel)
		);
		if (!view.ranked) return shown;
		const moved: readonly Part[] = container.group
			? (view.groupMoved.get(container.group) ?? [])
			: [...view.looseMoved, ...view.groupOrder].filter((part) => container.has(part));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a local lookup
		const moving = new Set(moved);
		return [...shown.filter((part) => !moving.has(part)), ...moved];
	}

	linkSearch(source: SearchSource): () => void {
		this.#search = this.#linked = source;
		return () => {
			if (this.#linked !== source) return;
			this.#search = this.#linked = undefined;
		};
	}

	pick(item: ItemModel | undefined, scroll: boolean): void {
		this.#current = item;
		if (scroll && item) this.#scrollRequest = { item };
		const value = item?.value ?? '';
		if (value === this.value) return;
		const focused = document.activeElement;
		if (focused && (focused === this.#element || focused.id === this.ids.input)) {
			(document.getElementById(this.ids.input) ?? document.getElementById(this.ids.list))?.focus();
		}
		this.#options.value = value;
		this.#options.onValueChange?.(value);
	}

	reconcile(): void {
		if (!this.settled) return;
		// Text that renders the search changed in this same flush, before the mutation observer can report it.
		untrack(() => this.#measure());
		const view = this.#view;
		const search = this.search;
		const value = this.value;
		const selected = this.#selected;
		untrack(() => {
			const searched = this.#lastSearch !== undefined && this.#lastSearch !== search;
			this.#lastSearch = search;
			this.count = view.count;
			const lost = this.#current !== undefined && !view.visibleItems.has(this.#current);
			if (searched || lost || value.trim() === '') this.pick(view.navigable[0], searched);
			else this.#current = selected;
		});
	}

	followSelection(): void {
		const request = this.#scrollRequest;
		if (!request) return;
		const item = this.selectedItem;
		untrack(() => {
			this.#scrollRequest = undefined;
			if (request.item !== item) return;
			const leader = item.group && this.#view.ordered.find((entry) => entry.group === item.group);
			if (leader === item) item.group?.headingElement?.scrollIntoView?.({ block: 'nearest' });
			item.element?.scrollIntoView?.({ block: 'nearest' });
		});
	}

	#measure(): void {
		for (const item of this.#items.keys()) item.measure();
	}

	keydown(event: KeyboardEvent): void {
		// keyCode 229 marks a key that an input method editor is handling.
		if (event.isComposing || event.keyCode === 229 || !this.settled) return;
		const vim = this.#options.vimBindings && event.ctrlKey;
		switch (event.key) {
			case 'n':
			case 'j':
				if (vim) this.#move(event, 1);
				break;
			case 'ArrowDown':
				this.#move(event, 1);
				break;
			case 'p':
			case 'k':
				if (vim) this.#move(event, -1);
				break;
			case 'ArrowUp':
				this.#move(event, -1);
				break;
			case 'Home':
				event.preventDefault();
				this.#go(this.#view.navigable[0]);
				break;
			case 'End':
				event.preventDefault();
				this.#go(this.#view.navigable.at(-1));
				break;
			case 'Enter':
				event.preventDefault();
				this.#selected?.activate();
		}
	}

	#move(event: KeyboardEvent, delta: 1 | -1): void {
		event.preventDefault();
		const view = this.#view;
		const loop = this.#options.loop;
		if (event.metaKey) this.#go(delta > 0 ? view.navigable.at(-1) : view.navigable[0]);
		else if (event.altKey) this.#go(stepGroup(view, this.#selected, delta, loop));
		else this.#go(step(view.navigable, this.#selected, delta, loop));
	}

	#go(item: ItemModel | undefined): void {
		if (item) this.pick(item, true);
	}

	observe: Attachment<HTMLElement> = (element) => {
		this.#scopes.add(element);
		const observer = new MutationObserver((records) => {
			if (element !== this.#element && this.#element?.contains(element)) return;
			this.#measure();
			if (records.some((record) => record.type === 'childList')) this.#layout += 1;
		});
		observer.observe(element, { childList: true, characterData: true, subtree: true });
		return () => {
			observer.disconnect();
			this.#scopes.delete(element);
		};
	};

	attach: Attachment<HTMLElement> = (element) => {
		this.#element = element;
		const release = this.observe(element);
		this.settled = true;
		return () => {
			release?.();
			this.#element = undefined;
		};
	};
}

function stateOf(root: CommandModel): CommandState {
	return {
		get search() {
			return root.search;
		},
		get value() {
			return root.value;
		},
		get count() {
			return root.count ?? 0;
		},
		get selectedId() {
			return root.selectedItem?.id;
		}
	};
}

export const [getCommand, setCommand] = defineContext<CommandModel>(
	'Sveltery Base: CommandRootContext is missing. Command parts must be placed within <Command.Root>.'
);

/** Reads the command menu's state from any descendant of Root. */
export function getCommandState(): CommandState {
	return getCommand().state;
}
