// Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
// MIT, see THIRD_PARTY_NOTICES.md.

export type CommandFilter = (value: string, search: string, keywords?: readonly string[]) => number;

export interface GroupEntry {
	readonly forceMount: boolean;
}

export interface ItemEntry<G extends GroupEntry = GroupEntry> {
	readonly value: string | undefined;
	readonly keywords: readonly string[];
	readonly disabled: boolean;
	readonly forceMount: boolean;
	readonly group: G | undefined;
}

export interface RankInput<I extends ItemEntry<G>, G extends GroupEntry> {
	readonly items: readonly I[];
	readonly groups: readonly G[];
	readonly search: string;
	readonly filter: CommandFilter | null;
}

export interface View<I, G> {
	readonly visibleItems: ReadonlySet<I>;
	readonly visibleGroups: ReadonlySet<G>;
	readonly ordered: readonly I[];
	readonly navigable: readonly I[];
	readonly groupOrder: readonly G[];
	readonly groupItems: ReadonlyMap<G, readonly I[]>;
	readonly ranked: boolean;
	readonly looseMoved: readonly I[];
	readonly groupMoved: ReadonlyMap<G, readonly I[]>;
	readonly count: number;
}

export function rank<I extends ItemEntry<G>, G extends GroupEntry>({
	items,
	groups,
	search,
	filter
}: RankInput<I, G>): View<I, G> {
	const ranked = filter !== null && search !== '';
	const scores = new Map<I, number>();
	const known = new Set(groups);

	const visible: I[] = [];
	let count = 0;
	for (const item of items) {
		let show = true;
		if (ranked && !item.forceMount && item.value !== undefined) {
			const score = item.value === '' ? 0 : filter(item.value, search, item.keywords);
			scores.set(item, score);
			show = score > 0;
		}
		if (!show) continue;
		visible.push(item);
		if (!item.forceMount) count += 1;
	}

	const loose: I[] = [];
	const buckets = new Map<G, I[]>(groups.map((group) => [group, []]));
	for (const item of visible) {
		if (item.group !== undefined && known.has(item.group)) buckets.get(item.group)!.push(item);
		else loose.push(item);
	}

	const score = (item: I) => scores.get(item) ?? 0;
	// Array.prototype.sort is stable, so ties keep document order.
	const moving = (list: readonly I[]) =>
		list.filter((item) => !item.disabled).sort((a, b) => score(b) - score(a));
	const shown = (group: G) => !ranked || group.forceMount || buckets.get(group)!.length > 0;
	let groupOrder = groups.filter(shown);
	const looseMoved = ranked ? moving(loose) : [];
	const groupMoved = new Map<G, readonly I[]>();
	if (ranked) {
		for (const group of groupOrder) groupMoved.set(group, moving(buckets.get(group)!));
		const best = (group: G) => Math.max(0, ...buckets.get(group)!.map(score));
		groupOrder = groupOrder.sort((a, b) => best(b) - best(a));
	}
	const arranged = (list: readonly I[], moved: readonly I[] | undefined) =>
		ranked ? [...list.filter((item) => item.disabled), ...moved!] : list;

	const usable = (item: I) => !item.disabled && item.value !== undefined && item.value !== '';
	const ordered = ranked
		? [
				...arranged(loose, looseMoved),
				...groupOrder.flatMap((group) => arranged(buckets.get(group)!, groupMoved.get(group)))
			]
		: visible;
	const groupItems = new Map<G, readonly I[]>(
		groupOrder.map((group) => [
			group,
			arranged(buckets.get(group)!, groupMoved.get(group)).filter(usable)
		])
	);

	return {
		visibleItems: new Set(visible),
		visibleGroups: new Set(groupOrder),
		ordered,
		navigable: ordered.filter(usable),
		groupOrder,
		groupItems,
		ranked,
		looseMoved,
		groupMoved,
		count
	};
}

export function step<T>(
	list: readonly T[],
	from: T | undefined,
	delta: 1 | -1,
	loop: boolean
): T | undefined {
	const next = (from === undefined ? -1 : list.indexOf(from)) + delta;
	if (!loop) return list[next];
	return next < 0 ? list.at(-1) : next >= list.length ? list[0] : list[next];
}

export function stepGroup<I extends ItemEntry<G>, G extends GroupEntry>(
	view: View<I, G>,
	from: I | undefined,
	delta: 1 | -1,
	loop: boolean
): I | undefined {
	const at = from?.group === undefined ? -1 : view.groupOrder.indexOf(from.group);
	if (at < 0) return step(view.navigable, from, delta, loop);
	for (let index = at + delta; index >= 0 && index < view.groupOrder.length; index += delta) {
		const first = view.groupItems.get(view.groupOrder[index])![0];
		if (first !== undefined) return first;
	}
	return step(view.navigable, from, delta, loop);
}
