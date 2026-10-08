// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/markOthers.ts
// which vendors aria-hidden (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
// MIT, see THIRD_PARTY_NOTICES.md.

import { getNodeName, isShadowRoot } from '@floating-ui/utils/dom';
import { ownerDocument } from '../../owner.js';

type Undo = () => void;

const counters = {
	inert: new WeakMap<Element, number>(),
	'aria-hidden': new WeakMap<Element, number>()
};

const markerName = 'data-base-ui-inert';
type ControlAttribute = keyof typeof counters;

const uncontrolledElementsSets: Record<ControlAttribute, WeakSet<Element>> = {
	inert: new WeakSet<Element>(),
	'aria-hidden': new WeakSet<Element>()
};
/** Elements that already wore the marker, such as the dialog's internal backdrop. */
let preexistingMarkers = new WeakSet<Element>();
let markerCounterMap = new WeakMap<Element, number>();
let lockCount = 0;

function unwrapHost(node: Node | null): Element | null {
	if (!node) return null;
	return isShadowRoot(node) ? node.host : unwrapHost(node.parentNode);
}

function correctElements(parent: HTMLElement, targets: Element[]) {
	return targets
		.map((target) => {
			if (parent.contains(target)) return target;
			const corrected = unwrapHost(target);
			if (corrected && parent.contains(corrected)) return corrected;
			return null;
		})
		.filter((target): target is Element => target != null);
}

function buildKeepSet(targets: Element[]) {
	const keep = new Set<Node>();
	for (const target of targets) {
		let node: Node | null = target;
		while (node && !keep.has(node)) {
			keep.add(node);
			node = node.parentNode;
		}
	}
	return keep;
}

function collectOutsideElements(
	root: HTMLElement,
	keepElements: Set<Node>,
	stopElements: Set<Node>
) {
	const outside: Element[] = [];
	const walk = (parent: Element | null) => {
		if (!parent || stopElements.has(parent)) return;
		for (const node of Array.from(parent.children)) {
			if (getNodeName(node) === 'script') continue;
			if (keepElements.has(node)) walk(node);
			else outside.push(node);
		}
	};
	walk(root);
	return outside;
}

function applyAttributeToOthers(
	uncorrectedAvoidElements: Element[],
	body: HTMLElement,
	ariaHidden: boolean,
	inert: boolean,
	mark: boolean
): Undo {
	let controlAttribute: ControlAttribute | null = null;
	if (inert) controlAttribute = 'inert';
	else if (ariaHidden) controlAttribute = 'aria-hidden';

	const avoidElements = correctElements(body, uncorrectedAvoidElements);
	const markerTargets = mark
		? collectOutsideElements(body, buildKeepSet(avoidElements), new Set<Node>(avoidElements))
		: [];
	const hiddenElements: Element[] = [];
	const markedElements: Element[] = [];
	let counterMap: WeakMap<Element, number> | null = null;
	let uncontrolledElementsSet: WeakSet<Element> | null = null;

	if (controlAttribute) {
		const map = counters[controlAttribute];
		const currentUncontrolled = uncontrolledElementsSets[controlAttribute];
		counterMap = map;
		uncontrolledElementsSet = currentUncontrolled;
		const ariaLiveElements = correctElements(
			body,
			Array.from(body.querySelectorAll('[aria-live]'))
		);
		const controlElements = avoidElements.concat(ariaLiveElements);
		const controlTargets = collectOutsideElements(
			body,
			buildKeepSet(controlElements),
			new Set<Node>(controlElements)
		);
		for (const node of controlTargets) {
			const attr = node.getAttribute(controlAttribute);
			const alreadyHidden = attr !== null && attr !== 'false';
			const counterValue = (map.get(node) || 0) + 1;
			map.set(node, counterValue);
			hiddenElements.push(node);
			if (counterValue === 1 && alreadyHidden) currentUncontrolled.add(node);
			if (!alreadyHidden)
				node.setAttribute(controlAttribute, controlAttribute === 'inert' ? '' : 'true');
		}
	}

	if (mark) {
		for (const node of markerTargets) {
			const markerValue = (markerCounterMap.get(node) || 0) + 1;
			markerCounterMap.set(node, markerValue);
			markedElements.push(node);
			if (markerValue === 1 && node.hasAttribute(markerName)) preexistingMarkers.add(node);
			if (markerValue === 1) node.setAttribute(markerName, '');
		}
	}

	lockCount += 1;

	return () => {
		if (counterMap && controlAttribute) {
			for (const element of hiddenElements) {
				const counterValue = (counterMap.get(element) || 0) - 1;
				counterMap.set(element, counterValue);
				if (!counterValue) {
					if (!uncontrolledElementsSet?.has(element)) element.removeAttribute(controlAttribute);
					uncontrolledElementsSet?.delete(element);
				}
			}
		}
		if (mark) {
			for (const element of markedElements) {
				const markerValue = (markerCounterMap.get(element) || 0) - 1;
				markerCounterMap.set(element, markerValue);
				if (!markerValue) {
					if (!preexistingMarkers.has(element)) element.removeAttribute(markerName);
					preexistingMarkers.delete(element);
				}
			}
		}
		lockCount -= 1;
		if (!lockCount) {
			counters.inert = new WeakMap();
			counters['aria-hidden'] = new WeakMap();
			uncontrolledElementsSets.inert = new WeakSet();
			uncontrolledElementsSets['aria-hidden'] = new WeakSet();
			markerCounterMap = new WeakMap();
			preexistingMarkers = new WeakSet();
		}
	};
}

export function markOthers(
	avoidElements: Element[],
	options: { ariaHidden?: boolean; inert?: boolean; mark?: boolean } = {}
): Undo {
	const { ariaHidden = false, inert = false, mark = true } = options;
	const body = ownerDocument(avoidElements[0]).body;
	return applyAttributeToOthers(avoidElements, body, ariaHidden, inert, mark);
}
