// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/safePolygon.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `buffer` and `requireIntent` are not restored. v1.8.0 already removed them.

import { isElement } from '@floating-ui/utils/dom';
import { Timeout } from '../timeout.js';
import type { FloatingTreeStore } from './components/FloatingTreeStore.js';
import { getNodeChildren } from './components/FloatingTreeStore.js';
import { contains, getTarget } from '../shadow-dom.js';

const CURSOR_SPEED_THRESHOLD = 0.1;
const CURSOR_SPEED_THRESHOLD_SQUARED = CURSOR_SPEED_THRESHOLD * CURSOR_SPEED_THRESHOLD;
const POLYGON_BUFFER = 0.5;

export interface SafePolygonOptions {
	blockPointerEvents?: boolean;
	getScope?: () => HTMLElement | SVGSVGElement | null;
}

export interface HandleCloseContext {
	x: number | null;
	y: number | null;
	placement: string | null;
	elements: { domReference: Element | null; floating: HTMLElement | null };
	onClose: () => void;
	nodeId?: string;
	tree?: FloatingTreeStore | null;
}

export interface HandleClose {
	(context: HandleCloseContext): (event: MouseEvent) => void;
	__options?: SafePolygonOptions;
	/** Cancels the pending 40ms close. The trigger calls this on unmount. */
	clear?: () => void;
}

function hasIntersectingEdge(
	pointX: number,
	pointY: number,
	xi: number,
	yi: number,
	xj: number,
	yj: number
) {
	return yi >= pointY !== yj >= pointY && pointX <= ((xj - xi) * (pointY - yi)) / (yj - yi) + xi;
}

function isPointInQuadrilateral(
	pointX: number,
	pointY: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number
) {
	let inside = false;
	if (hasIntersectingEdge(pointX, pointY, x1, y1, x2, y2)) inside = !inside;
	if (hasIntersectingEdge(pointX, pointY, x2, y2, x3, y3)) inside = !inside;
	if (hasIntersectingEdge(pointX, pointY, x3, y3, x4, y4)) inside = !inside;
	if (hasIntersectingEdge(pointX, pointY, x4, y4, x1, y1)) inside = !inside;
	return inside;
}

function isInsideRect(pointX: number, pointY: number, rect: DOMRect) {
	return (
		pointX >= rect.x &&
		pointX <= rect.x + rect.width &&
		pointY >= rect.y &&
		pointY <= rect.y + rect.height
	);
}

function isInsideAxisAlignedRect(
	pointX: number,
	pointY: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
) {
	return (
		pointX >= Math.min(x1, x2) &&
		pointX <= Math.max(x1, x2) &&
		pointY >= Math.min(y1, y2) &&
		pointY <= Math.max(y1, y2)
	);
}

export function safePolygon(options: SafePolygonOptions = {}): HandleClose {
	const { blockPointerEvents = false } = options;
	const timeout = new Timeout();
	const fn: HandleClose = ({ x, y, placement, elements, onClose, nodeId, tree }) => {
		const side = placement?.split('-')[0];
		let hasLanded = false;
		let lastX: number | null = null;
		let lastY: number | null = null;
		let lastCursorTime = performance.now();

		function isCursorMovingSlowly(nextX: number, nextY: number) {
			const currentTime = performance.now();
			const elapsedTime = currentTime - lastCursorTime;
			if (lastX === null || lastY === null || elapsedTime === 0) {
				lastX = nextX;
				lastY = nextY;
				lastCursorTime = currentTime;
				return false;
			}
			const deltaX = nextX - lastX;
			const deltaY = nextY - lastY;
			const distanceSquared = deltaX * deltaX + deltaY * deltaY;
			const thresholdSquared = elapsedTime * elapsedTime * CURSOR_SPEED_THRESHOLD_SQUARED;
			lastX = nextX;
			lastY = nextY;
			lastCursorTime = currentTime;
			return distanceSquared < thresholdSquared;
		}

		function close() {
			timeout.clear();
			onClose();
		}

		return function onMouseMove(event: MouseEvent) {
			timeout.clear();
			const domReference = elements.domReference;
			const floating = elements.floating;
			if (!domReference || !floating || side == null || x == null || y == null) return;
			const { clientX, clientY } = event;
			const target = getTarget(event);
			const isLeave = event.type === 'mouseleave';
			const isOverFloatingEl = contains(floating, target instanceof Node ? target : null);
			const isOverReferenceEl = contains(domReference, target instanceof Node ? target : null);
			if (isOverFloatingEl) {
				hasLanded = true;
				if (!isLeave) return;
			}
			if (isOverReferenceEl) {
				hasLanded = false;
				if (!isLeave) {
					hasLanded = true;
					return;
				}
			}
			if (isLeave && isElement(event.relatedTarget) && contains(floating, event.relatedTarget))
				return;

			function hasOpenChildNode() {
				return Boolean(tree && nodeId && getNodeChildren(tree.nodes, nodeId).length > 0);
			}
			function closeIfNoOpenChild() {
				if (!hasOpenChildNode()) close();
			}
			if (hasOpenChildNode()) return;

			const refRect = domReference.getBoundingClientRect();
			const rect = floating.getBoundingClientRect();
			const cursorLeaveFromRight = x > rect.right - rect.width / 2;
			const cursorLeaveFromBottom = y > rect.bottom - rect.height / 2;
			const isFloatingWider = rect.width > refRect.width;
			const isFloatingTaller = rect.height > refRect.height;
			const left = (isFloatingWider ? refRect : rect).left;
			const right = (isFloatingWider ? refRect : rect).right;
			const top = (isFloatingTaller ? refRect : rect).top;
			const bottom = (isFloatingTaller ? refRect : rect).bottom;

			if (
				(side === 'top' && y >= refRect.bottom - 1) ||
				(side === 'bottom' && y <= refRect.top + 1) ||
				(side === 'left' && x >= refRect.right - 1) ||
				(side === 'right' && x <= refRect.left + 1)
			) {
				closeIfNoOpenChild();
				return;
			}

			let isInsideTroughRect = false;
			if (side === 'top') {
				isInsideTroughRect = isInsideAxisAlignedRect(
					clientX,
					clientY,
					left,
					refRect.top + 1,
					right,
					rect.bottom - 1
				);
			} else if (side === 'bottom') {
				isInsideTroughRect = isInsideAxisAlignedRect(
					clientX,
					clientY,
					left,
					rect.top + 1,
					right,
					refRect.bottom - 1
				);
			} else if (side === 'left') {
				isInsideTroughRect = isInsideAxisAlignedRect(
					clientX,
					clientY,
					rect.right - 1,
					bottom,
					refRect.left + 1,
					top
				);
			} else if (side === 'right') {
				isInsideTroughRect = isInsideAxisAlignedRect(
					clientX,
					clientY,
					refRect.right - 1,
					bottom,
					rect.left + 1,
					top
				);
			}
			if (isInsideTroughRect) return;
			if (hasLanded && !isInsideRect(clientX, clientY, refRect)) {
				closeIfNoOpenChild();
				return;
			}
			if (!isLeave && isCursorMovingSlowly(clientX, clientY)) {
				closeIfNoOpenChild();
				return;
			}

			let isInsidePolygon = false;
			if (side === 'top' || side === 'bottom') {
				const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
				const cursorPointOneX = isFloatingWider
					? x + cursorXOffset
					: cursorLeaveFromRight
						? x + cursorXOffset
						: x - cursorXOffset;
				const cursorPointTwoX = isFloatingWider
					? x - cursorXOffset
					: cursorLeaveFromRight
						? x + cursorXOffset
						: x - cursorXOffset;
				if (side === 'top') {
					const cursorPointY = y + POLYGON_BUFFER + 1;
					const commonYLeft = cursorLeaveFromRight
						? rect.bottom - POLYGON_BUFFER
						: isFloatingWider
							? rect.bottom - POLYGON_BUFFER
							: rect.top;
					const commonYRight = cursorLeaveFromRight
						? isFloatingWider
							? rect.bottom - POLYGON_BUFFER
							: rect.top
						: rect.bottom - POLYGON_BUFFER;
					isInsidePolygon = isPointInQuadrilateral(
						clientX,
						clientY,
						cursorPointOneX,
						cursorPointY,
						cursorPointTwoX,
						cursorPointY,
						rect.left,
						commonYLeft,
						rect.right,
						commonYRight
					);
				} else {
					const cursorPointY = y - POLYGON_BUFFER;
					const commonYLeft = cursorLeaveFromRight
						? rect.top + POLYGON_BUFFER
						: isFloatingWider
							? rect.top + POLYGON_BUFFER
							: rect.bottom;
					const commonYRight = cursorLeaveFromRight
						? isFloatingWider
							? rect.top + POLYGON_BUFFER
							: rect.bottom
						: rect.top + POLYGON_BUFFER;
					isInsidePolygon = isPointInQuadrilateral(
						clientX,
						clientY,
						cursorPointOneX,
						cursorPointY,
						cursorPointTwoX,
						cursorPointY,
						rect.left,
						commonYLeft,
						rect.right,
						commonYRight
					);
				}
			} else if (side === 'left' || side === 'right') {
				const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
				const cursorPointOneY = isFloatingTaller
					? y + cursorYOffset
					: cursorLeaveFromBottom
						? y + cursorYOffset
						: y - cursorYOffset;
				const cursorPointTwoY = isFloatingTaller
					? y - cursorYOffset
					: cursorLeaveFromBottom
						? y + cursorYOffset
						: y - cursorYOffset;
				if (side === 'left') {
					const cursorPointX = x + POLYGON_BUFFER + 1;
					const commonXTop = cursorLeaveFromBottom
						? rect.right - POLYGON_BUFFER
						: isFloatingTaller
							? rect.right - POLYGON_BUFFER
							: rect.left;
					const commonXBottom = cursorLeaveFromBottom
						? isFloatingTaller
							? rect.right - POLYGON_BUFFER
							: rect.left
						: rect.right - POLYGON_BUFFER;
					isInsidePolygon = isPointInQuadrilateral(
						clientX,
						clientY,
						commonXTop,
						rect.top,
						commonXBottom,
						rect.bottom,
						cursorPointX,
						cursorPointOneY,
						cursorPointX,
						cursorPointTwoY
					);
				} else {
					const cursorPointX = x - POLYGON_BUFFER;
					const commonXTop = cursorLeaveFromBottom
						? rect.left + POLYGON_BUFFER
						: isFloatingTaller
							? rect.left + POLYGON_BUFFER
							: rect.right;
					const commonXBottom = cursorLeaveFromBottom
						? isFloatingTaller
							? rect.left + POLYGON_BUFFER
							: rect.right
						: rect.left + POLYGON_BUFFER;
					isInsidePolygon = isPointInQuadrilateral(
						clientX,
						clientY,
						cursorPointX,
						cursorPointOneY,
						cursorPointX,
						cursorPointTwoY,
						commonXTop,
						rect.top,
						commonXBottom,
						rect.bottom
					);
				}
			}

			if (!isInsidePolygon) closeIfNoOpenChild();
			else if (!hasLanded) timeout.start(40, closeIfNoOpenChild);
		};
	};
	fn.__options = { ...options, blockPointerEvents };
	fn.clear = () => timeout.clear();
	return fn;
}
