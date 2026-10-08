// Derived from Base UI v1.8.0 packages/react/src/utils/popups/popupTriggerMap.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { DEV } from 'esm-env';

let devElementIdsByMap: WeakMap<PopupTriggerMap, WeakMap<Element, string>> | undefined;

function getDevElementIds(map: PopupTriggerMap) {
	devElementIdsByMap ??= new WeakMap();
	let elementIds = devElementIdsByMap.get(map);
	if (!elementIds) {
		elementIds = new WeakMap();
		devElementIdsByMap.set(map, elementIds);
	}
	return elementIds;
}

export class PopupTriggerMap {
	private idMap = new Map<string, Element>();

	add(id: string, element: Element) {
		if (DEV) {
			const elementIds = getDevElementIds(this);
			const existingId = elementIds.get(element);
			if (existingId !== undefined && existingId !== id) {
				throw new Error(
					'Base UI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.'
				);
			}
			const previousElement = this.idMap.get(id);
			if (previousElement !== undefined && previousElement !== element) {
				elementIds.delete(previousElement);
			}
			elementIds.set(element, id);
		}
		this.idMap.set(id, element);
	}

	delete(id: string) {
		if (DEV) {
			const element = this.idMap.get(id);
			if (element !== undefined) devElementIdsByMap?.get(this)?.delete(element);
		}
		this.idMap.delete(id);
	}

	hasElement(element: Element) {
		for (const registered of this.idMap.values()) {
			if (registered === element) return true;
		}
		return false;
	}

	hasMatchingElement(predicate: (element: Element) => boolean) {
		for (const element of this.idMap.values()) {
			if (predicate(element)) return true;
		}
		return false;
	}

	getById(id: string) {
		return this.idMap.get(id);
	}

	/** Registration id for an element. The DOM id can differ. */
	idOf(element: Element | null | undefined) {
		if (!element) return undefined;
		for (const [id, registered] of this.idMap) {
			if (registered === element) return id;
		}
		return undefined;
	}

	elements(): IterableIterator<Element> {
		return this.idMap.values();
	}

	get size() {
		return this.idMap.size;
	}
}
