// Derived from Base UI v1.8.0 packages/react/src/slider/root/SliderRoot.tsx,
// packages/react/src/slider/control/SliderControl.tsx, and
// packages/react/src/slider/thumb/SliderThumb.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Thumb order is a local list (the CompositeList registration Slider uses).
// Arrow keys change the value. They do not rove focus between thumbs.
// Text direction is `useDirection()`, read through `getDirection`.

import { untrack } from 'svelte';
import { useAnimationFrame } from '../internal/timeout.svelte.js';
import { clamp } from '../internal/clamp.js';
import {
	createChangeEventDetails,
	createGenericEventDetails,
	REASONS
} from '../internal/event-details.js';
import type { FieldContext } from '../field/model.svelte.js';
import type { FormContextValue } from '../form/context.js';
import { asc } from './asc.js';
import { ownerDocument, ownerWindow } from '../internal/owner.js';
import { activeElement, contains, getTarget } from '../internal/shadow-dom.js';
import { focusElement, isElement, matchesFocusVisible } from './dom.js';
import { getMidpoint } from './getMidpoint.js';
import { areValuesEqual, getSliderValue } from './getSliderValue.js';
import {
	ALL_KEYS,
	ARROW_DOWN,
	ARROW_LEFT,
	ARROW_RIGHT,
	ARROW_UP,
	COMPOSITE_KEYS,
	END,
	HOME,
	PAGE_DOWN,
	PAGE_UP
} from './keys.js';
import { getDecimalPrecision, roundValueToStep } from './roundValueToStep.js';
import { resolveThumbCollision } from './resolveThumbCollision.js';
import type {
	SliderChangeEventDetails,
	SliderChangeEventReason,
	SliderCommitEventDetails,
	SliderOrientation,
	SliderRootState,
	SliderThumbAlignment,
	SliderThumbCollisionBehavior,
	SliderValue
} from './types.js';
import { validateMinimumDistance } from './validateMinimumDistance.js';

const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2;

interface Coords {
	x: number;
	y: number;
}

interface FingerState {
	value: number | number[];
	thumbIndex: number;
	didSwap: boolean;
}

export interface SliderThumbRecord {
	element: HTMLElement;
	inputId: string | undefined;
	index: number;
}

export interface SliderModelOptions {
	getValueUnwrapped: () => SliderValue;
	writeValue: (next: SliderValue) => void;
	getMin: () => number;
	getMax: () => number;
	getStep: () => number;
	getLargeStep: () => number;
	getMinSteps: () => number;
	getOrientation: () => SliderOrientation;
	getDisabled: () => boolean;
	getName: () => string | undefined;
	getFormId: () => string | undefined;
	getRootId: () => string;
	getFormat: () => Intl.NumberFormatOptions | undefined;
	getLocale: () => Intl.LocalesArgument | undefined;
	getThumbAlignment: () => SliderThumbAlignment;
	getCollision: () => SliderThumbCollisionBehavior;
	getAriaLabelledBy: () => string | undefined;
	getFieldLabelId: () => string | undefined;
	getOnValueChange: () =>
		((value: SliderValue, eventDetails: SliderChangeEventDetails) => void) | undefined;
	getOnValueCommitted: () =>
		((value: SliderValue, eventDetails: SliderCommitEventDetails) => void) | undefined;
	getField: () => FieldContext;
	getFormContext: () => FormContextValue;
	getDirection: () => 'ltr' | 'rtl';
}

function getControlOffset(styles: CSSStyleDeclaration | null, vertical: boolean) {
	if (!styles) return { start: 0, end: 0 };

	function parseSize(value: string | null | undefined) {
		const parsed = value != null ? parseFloat(value) : 0;
		return Number.isNaN(parsed) ? 0 : parsed;
	}

	const start = !vertical ? 'InlineStart' : 'Top';
	const end = !vertical ? 'InlineEnd' : 'Bottom';
	const table = styles as unknown as Record<string, string>;
	return {
		start: parseSize(table[`border${start}Width`]) + parseSize(table[`padding${start}`]),
		end: parseSize(table[`border${end}Width`]) + parseSize(table[`padding${end}`])
	};
}

function getFingerCoords(event: TouchEvent | PointerEvent, touchId: number | null): Coords | null {
	if (touchId != null && (event as TouchEvent).changedTouches) {
		const touchEvent = event as TouchEvent;
		for (let i = 0; i < touchEvent.changedTouches.length; i += 1) {
			const touch = touchEvent.changedTouches[i];
			if (touch.identifier === touchId) return { x: touch.clientX, y: touch.clientY };
		}
		return null;
	}
	return { x: (event as PointerEvent).clientX, y: (event as PointerEvent).clientY };
}

function getNewValue(
	thumbValue: number,
	increment: number,
	direction: number,
	min: number,
	max: number
) {
	const value = thumbValue + increment * direction;
	const roundedValue = Number(
		value.toFixed(
			Math.max(
				getDecimalPrecision(thumbValue),
				getDecimalPrecision(increment),
				getDecimalPrecision(min)
			)
		)
	);
	return clamp(roundedValue, min, max);
}

/**
 * One slider: value, thumb registration, keyboard changes, and pointer dragging.
 */
export class SliderRootModel {
	active = $state(-1);
	lastUsedThumbIndex = $state(-1);
	dragging = $state(false);
	indicatorPosition = $state<(number | undefined)[]>([undefined, undefined]);
	labelId = $state<string | undefined>(undefined);
	get direction(): 'ltr' | 'rtl' {
		return this.options.getDirection();
	}
	hydrating = $state(true);
	control = $state<HTMLElement | null>(null);
	root = $state<HTMLElement | null>(null);
	fieldInput = $state<HTMLInputElement | null>(null);
	thumbs = $state<SliderThumbRecord[]>([]);

	pressedThumbIndex = -1;
	pressedThumbCenterOffset: number | null = null;
	pressedValues: readonly number[] | null = null;
	lastChangeReason: SliderChangeEventReason = REASONS.none;
	restoringFocusVisible = false;

	private touchId: number | null = null;
	private moveCount = 0;
	private insetThumbOffset = 0;
	private currentInteractionValue: number | number[] | null = null;
	private latestValues: readonly number[] = [];
	private styles: CSSStyleDeclaration | null = null;
	private readonly focusFrame = useAnimationFrame();
	private listeningDoc: Document | null = null;
	private pinnedFieldInput = false;
	private readonly options: SliderModelOptions;

	constructor(options: SliderModelOptions) {
		this.options = options;
	}

	/** True when the bound value is an array, one entry per thumb. */
	get range() {
		return Array.isArray(this.options.getValueUnwrapped());
	}

	/** Clamped thumb values. A range is sorted. */
	get values(): readonly number[] {
		const raw = this.options.getValueUnwrapped();
		const min = this.options.getMin();
		const max = this.options.getMax();
		if (typeof raw === 'number') return [clamp(raw, min, max)];
		return raw.map((value) => clamp(value, min, max)).sort(asc);
	}

	get min() {
		return this.options.getMin();
	}

	get max() {
		return this.options.getMax();
	}

	get step() {
		return this.options.getStep();
	}

	get largeStep() {
		return this.options.getLargeStep();
	}

	get minSteps() {
		return this.options.getMinSteps();
	}

	get vertical() {
		return this.options.getOrientation() === 'vertical';
	}

	get inset() {
		return this.options.getThumbAlignment() !== 'center';
	}

	get renderBeforeHydration() {
		return this.options.getThumbAlignment() === 'edge';
	}

	get disabled() {
		return this.options.getDisabled();
	}

	get linkedLabel() {
		return this.options.getAriaLabelledBy() ?? this.options.getFieldLabelId() ?? this.labelId;
	}

	get rootDomId() {
		return this.options.getRootId();
	}

	get format() {
		return this.options.getFormat();
	}

	get locale() {
		return this.options.getLocale();
	}

	get formId() {
		return this.options.getFormId();
	}

	get linkedName() {
		return this.options.getName();
	}

	get fieldValue(): SliderValue {
		return this.range ? this.values : this.values[0];
	}

	get outputFor() {
		const ids = this.thumbs.map((thumb) => thumb.inputId).filter((id): id is string => !!id);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}

	snapshot(): SliderRootState {
		const field = this.options.getField();
		return {
			...field.state,
			activeThumbIndex: this.active,
			disabled: this.disabled,
			dragging: this.dragging,
			orientation: this.options.getOrientation(),
			max: this.max,
			min: this.min,
			minStepsBetweenValues: this.minSteps,
			step: this.step,
			values: this.values
		};
	}

	setActive(index: number) {
		this.active = index;
		if (index !== -1) this.lastUsedThumbIndex = index;
	}

	setIndicatorEdge(index: number, last: boolean, position: number | undefined) {
		const current = untrack(() => this.indicatorPosition);
		if (index === 0) this.indicatorPosition = [position, current[1]];
		else if (last) this.indicatorPosition = [current[0], position];
	}

	trackElement(element: HTMLElement) {
		const thumbs = untrack(() => this.thumbs);
		if (thumbs.some((thumb) => thumb.element === element)) return;
		const next = [...thumbs, { element, inputId: undefined, index: -1 }];
		next.sort((a, b) => {
			if (a.element === b.element) return 0;
			const position = a.element.compareDocumentPosition(b.element);
			if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
			if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
			return 0;
		});
		this.thumbs = next;
	}

	untrackElement(element: HTMLElement) {
		const thumbs = untrack(() => this.thumbs);
		this.thumbs = thumbs.filter((thumb) => thumb.element !== element);
	}

	positionOf(element: HTMLElement | null) {
		if (!element) return -1;
		return this.thumbs.findIndex((thumb) => thumb.element === element);
	}

	syncThumb(element: HTMLElement, inputId: string | undefined, index: number) {
		const thumbs = untrack(() => this.thumbs);
		const current = thumbs.find((thumb) => thumb.element === element);
		if (!current || (current.inputId === inputId && current.index === index)) return;
		this.thumbs = thumbs.map((thumb) =>
			thumb.element === element ? { element, inputId, index } : thumb
		);
	}

	thumbElementAt(index: number) {
		return this.thumbs.find((thumb) => thumb.index === index)?.element ?? null;
	}

	noteInput(input: HTMLInputElement, index: number) {
		if (untrack(() => this.pinnedFieldInput)) return;
		if (untrack(() => this.fieldInput) == null || index <= 0) {
			this.fieldInput = input;
		}
	}

	captureStyles(element: HTMLElement) {
		if (this.styles == null) this.styles = ownerWindow(element).getComputedStyle(element);
	}

	/**
	 * Applies a value through `onValueChange`. Returns false when the value is
	 * NaN, unchanged, or the change was canceled.
	 */
	setValue(newValue: number | number[], details: SliderChangeEventDetails) {
		const current = this.options.getValueUnwrapped();
		if (Number.isNaN(newValue) || areValuesEqual(newValue, current)) return false;

		this.options.getOnValueChange()?.(newValue, details);
		if (details.isCanceled) return false;

		this.lastChangeReason = details.reason;
		this.options.writeValue(newValue);
		return true;
	}

	handleInputChange(valueInput: number, index: number, event: Event) {
		const input = event.currentTarget;
		if (this.disabled || (input instanceof HTMLInputElement && input.disabled)) return;

		const newValue = getSliderValue(valueInput, index, this.min, this.max, this.range, this.values);
		if (!validateMinimumDistance(newValue, this.step, this.minSteps)) return;

		const reason = 'key' in event ? REASONS.keyboard : REASONS.inputChange;
		const applied = this.setValue(
			newValue,
			createChangeEventDetails(reason, event, undefined, { activeThumbIndex: index })
		);
		this.options.getField().setTouched(true);
		if (applied) {
			this.options.getOnValueCommitted()?.(newValue, createGenericEventDetails(reason, event));
		}
	}

	/**
	 * @returns true when the focus event is the internal focus-visible restore and
	 * must not be forwarded.
	 */
	onThumbFocus(event: FocusEvent, index: number) {
		const restoring = this.restoringFocusVisible;
		this.restoringFocusVisible = false;
		this.setActive(index);
		this.options.getField().setFocused(true);
		const input = event.currentTarget;
		if (input instanceof HTMLInputElement) {
			this.fieldInput = input;
			this.pinnedFieldInput = true;
		}
		if (restoring) event.stopPropagation();
		return restoring;
	}

	/** @returns true when the blur is internal and must not be forwarded. */
	onThumbBlur(event: FocusEvent, index: number) {
		if (this.restoringFocusVisible) {
			event.stopPropagation();
			return true;
		}

		this.setActive(-1);
		if (this.thumbs.some((thumb) => contains(thumb.element, event.relatedTarget))) return false;

		const field = this.options.getField();
		field.setTouched(true);
		field.setFocused(false);
		if (field.validationMode === 'onBlur') {
			const thumbValue = this.values[index];
			field.commit(getSliderValue(thumbValue, index, this.min, this.max, this.range, this.values));
		}
		this.pinnedFieldInput = false;
		return false;
	}

	onThumbKeyDown(event: KeyboardEvent, index: number) {
		const input = event.currentTarget;
		if (this.disabled || (input instanceof HTMLInputElement && input.disabled)) return;
		if (!ALL_KEYS.has(event.key)) return;
		if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation();

		const thumbValue = this.values[index];
		if (!Number.isFinite(thumbValue)) return;

		const rtl = this.direction === 'rtl';

		let newValue: number | null = null;
		let direction = 0;
		let increment = event.shiftKey ? this.largeStep : this.step;
		const roundedValue = roundValueToStep(thumbValue, this.step, this.min);
		switch (event.key) {
			case ARROW_UP:
				direction = 1;
				break;
			case ARROW_RIGHT:
				direction = rtl ? -1 : 1;
				break;
			case ARROW_DOWN:
				direction = -1;
				break;
			case ARROW_LEFT:
				direction = rtl ? 1 : -1;
				break;
			case PAGE_UP:
				increment = this.largeStep;
				direction = 1;
				break;
			case PAGE_DOWN:
				increment = this.largeStep;
				direction = -1;
				break;
			case END:
				newValue =
					this.range && Number.isFinite(this.values[index + 1])
						? this.values[index + 1] - this.step * this.minSteps
						: this.max;
				break;
			case HOME:
				newValue =
					this.range && Number.isFinite(this.values[index - 1])
						? this.values[index - 1] + this.step * this.minSteps
						: this.min;
				break;
			default:
				break;
		}

		if (direction !== 0) {
			newValue = getNewValue(roundedValue, increment, direction, this.min, this.max);
		}

		if (newValue !== null) {
			const input = event.currentTarget;
			if (input instanceof HTMLInputElement && !matchesFocusVisible(input)) {
				this.restoringFocusVisible = true;
				input.blur();
				focusElement(input, { preventScroll: true, focusVisible: true });
			}
			this.handleInputChange(newValue, index, event);
			event.preventDefault();
		}
	}

	onPointerDown(event: PointerEvent) {
		const control = this.control;
		const target = getTarget(event);
		if (
			!control ||
			this.disabled ||
			event.defaultPrevented ||
			!isElement(target) ||
			event.button !== 0
		) {
			return;
		}

		if (this.isTargetDisabledThumb(target)) {
			this.resetPressedThumb();
			return;
		}

		this.stopListening();
		const fingerCoords = { x: event.clientX, y: event.clientY };
		this.startPressing(fingerCoords);
		const finger = this.getFingerState(fingerCoords);
		if (finger == null) return;

		const pressedOnFocusedThumb = contains(
			this.thumbElementAt(finger.thumbIndex),
			activeElement(ownerDocument(control))
		);
		if (pressedOnFocusedThumb) event.preventDefault();
		else this.requestFocus(finger.thumbIndex);

		this.dragging = true;
		const pressedOnAnyThumb = this.pressedThumbCenterOffset != null;
		if (!pressedOnAnyThumb) this.setValueFromPointer(finger, REASONS.trackPress, event);

		if (event.pointerId) {
			try {
				control.setPointerCapture(event.pointerId);
			} catch {
				// A synthetic pointer event has no active pointer to capture.
			}
		}

		this.moveCount = 0;
		this.listen(ownerDocument(control), false);
	}

	onThumbPointerDown(event: PointerEvent, index: number) {
		if (this.disabled || event.defaultPrevented) return;
		const current = event.currentTarget;
		if (!(current instanceof HTMLElement)) return;
		this.pressedThumbIndex = index;
		const midpoint = getMidpoint(current, this.vertical);
		this.pressedThumbCenterOffset = (this.vertical ? event.clientY : event.clientX) - midpoint;
	}

	onTouchStart(event: TouchEvent) {
		if (this.disabled) return;
		if (this.isTargetDisabledThumb(getTarget(event) as EventTarget | null)) {
			this.resetPressedThumb();
			return;
		}

		const touch = event.changedTouches[0];
		if (touch == null) return;

		this.stopListening();
		this.touchId = touch.identifier;
		const fingerCoords = { x: touch.clientX, y: touch.clientY };
		this.startPressing(fingerCoords);
		const finger = this.getFingerState(fingerCoords);
		if (finger == null) return;

		this.focusThumb(finger.thumbIndex);
		this.setValueFromPointer(finger, REASONS.trackPress, event);
		this.moveCount = 0;
		this.listen(ownerDocument(this.control), true);
	}

	stopListening() {
		const doc = this.listeningDoc;
		if (doc) {
			doc.removeEventListener('pointermove', this.onMove);
			doc.removeEventListener('pointerup', this.onUp);
			doc.removeEventListener('touchmove', this.onMove);
			doc.removeEventListener('touchend', this.onUp);
			this.listeningDoc = null;
		}
		this.pressedValues = null;
		this.currentInteractionValue = null;
	}

	cancelFocusFrame() {
		this.focusFrame.cancel();
	}

	private onMove = (event: Event) => {
		this.handleMove(event as PointerEvent | TouchEvent);
	};

	private onUp = (event: Event) => {
		this.handleEnd(event as PointerEvent | TouchEvent);
	};

	private listen(doc: Document, touch: boolean) {
		this.listeningDoc = doc;
		if (touch) {
			doc.addEventListener('touchmove', this.onMove, { passive: true });
			doc.addEventListener('touchend', this.onUp, { passive: true });
			return;
		}
		doc.addEventListener('pointermove', this.onMove, { passive: true });
		doc.addEventListener('pointerup', this.onUp, { once: true });
	}

	private thumbInput(element: Element | null | undefined) {
		return element?.querySelector<HTMLInputElement>('input[type="range"]') ?? null;
	}

	private isTargetDisabledThumb(target: EventTarget | null) {
		if (!isElement(target)) return false;
		return this.thumbs.some((thumb) => {
			if (!contains(thumb.element, target)) return false;
			return this.thumbInput(thumb.element)?.disabled === true;
		});
	}

	private updatePressedThumb(nextIndex: number) {
		this.pressedThumbIndex = nextIndex;
		if (!this.thumbElementAt(nextIndex)) this.pressedThumbCenterOffset = null;
	}

	private resetPressedThumb() {
		this.pressedThumbIndex = -1;
		this.pressedThumbCenterOffset = null;
	}

	private focusThumb(thumbIndex: number) {
		const input = this.thumbInput(this.thumbElementAt(thumbIndex));
		if (!input) return;
		focusElement(input, { preventScroll: true, focusVisible: false });
	}

	private requestFocus(thumbIndex: number) {
		this.focusFrame.request(() => {
			this.focusThumb(thumbIndex);
		});
	}

	private startPressing(fingerCoords: Coords) {
		this.pressedValues = this.range ? this.values.slice() : null;
		this.currentInteractionValue = null;
		this.latestValues = this.values.slice();
		const pressedThumbIndex = this.pressedThumbIndex;
		let closestThumbIndex = pressedThumbIndex;
		const values = this.values;

		if (pressedThumbIndex > -1 && pressedThumbIndex < values.length) {
			if (values[pressedThumbIndex] === this.max) {
				let candidateIndex = pressedThumbIndex;
				while (candidateIndex > 0 && values[candidateIndex - 1] === this.max) candidateIndex -= 1;
				closestThumbIndex = candidateIndex;
			}
		} else {
			const axis = !this.vertical ? 'x' : 'y';
			let minDistance: number | undefined;
			closestThumbIndex = -1;
			for (let i = 0; i < this.thumbs.length; i += 1) {
				const thumb = this.thumbs[i];
				if (!isElement(thumb.element) || this.thumbInput(thumb.element)?.disabled) continue;
				const midpoint = getMidpoint(thumb.element, this.vertical);
				const distance = Math.abs(fingerCoords[axis] - midpoint);
				if (minDistance === undefined || distance <= minDistance) {
					// DOM order is the value index, matching CompositeList positions.
					closestThumbIndex = i;
					minDistance = distance;
				}
			}
		}

		if (closestThumbIndex > -1 && closestThumbIndex !== pressedThumbIndex) {
			this.updatePressedThumb(closestThumbIndex);
		}

		if (this.inset) {
			const thumbEl = this.thumbElementAt(closestThumbIndex);
			if (isElement(thumbEl)) {
				const thumbRect = thumbEl.getBoundingClientRect();
				const side = !this.vertical ? 'width' : 'height';
				this.insetThumbOffset = thumbRect[side] / 2;
			}
		}
	}

	private getFingerState(fingerCoords: Coords): FingerState | null {
		const control = this.control;
		const thumbIndex = this.pressedThumbIndex;
		const values = this.values;

		if (!control || thumbIndex < 0 || thumbIndex >= values.length) {
			if (thumbIndex >= values.length) this.currentInteractionValue = null;
			return null;
		}

		const { width, height, bottom, left, right } = control.getBoundingClientRect();
		const controlOffset = getControlOffset(this.styles, this.vertical);
		const insetThumbOffset = this.insetThumbOffset;
		const controlSize =
			(this.vertical ? height : width) -
			controlOffset.start -
			controlOffset.end -
			insetThumbOffset * 2;
		const thumbCenterOffset = this.pressedThumbCenterOffset ?? 0;
		const fingerX = fingerCoords.x - thumbCenterOffset;
		const fingerY = fingerCoords.y - thumbCenterOffset;
		const valueSize = this.vertical
			? bottom - fingerY - controlOffset.end
			: (this.direction === 'rtl' ? right - fingerX : fingerX - left) - controlOffset.start;
		const valueRescaled = clamp((valueSize - insetThumbOffset) / controlSize, 0, 1);

		let newValue = (this.max - this.min) * valueRescaled + this.min;
		newValue = roundValueToStep(newValue, this.step, this.min);
		newValue = clamp(newValue, this.min, this.max);

		if (!this.range) return { value: newValue, thumbIndex, didSwap: false };

		return resolveThumbCollision(
			this.options.getCollision(),
			values,
			this.latestValues,
			this.pressedValues,
			thumbIndex,
			newValue,
			this.min,
			this.max,
			this.step,
			this.minSteps
		);
	}

	private setValueFromPointer(
		finger: FingerState,
		reason: typeof REASONS.trackPress | typeof REASONS.drag,
		nativeEvent: TouchEvent | PointerEvent
	) {
		const applied = this.setValue(
			finger.value,
			createChangeEventDetails(reason, nativeEvent, undefined, {
				activeThumbIndex: finger.thumbIndex
			})
		);
		if (!applied) return false;

		this.currentInteractionValue = finger.value;
		this.latestValues = Array.isArray(finger.value) ? finger.value : [finger.value];
		if (finger.didSwap) {
			this.updatePressedThumb(finger.thumbIndex);
			this.focusThumb(finger.thumbIndex);
		}
		return true;
	}

	private handleMove(nativeEvent: TouchEvent | PointerEvent) {
		const fingerCoords = getFingerCoords(nativeEvent, this.touchId);
		if (fingerCoords == null) return;

		this.moveCount += 1;
		if (nativeEvent.type === 'pointermove' && (nativeEvent as PointerEvent).buttons === 0) {
			this.handleEnd(nativeEvent);
			return;
		}

		const finger = this.getFingerState(fingerCoords);
		if (finger == null) return;
		if (!validateMinimumDistance(finger.value, this.step, this.minSteps)) return;

		if (!this.dragging && this.moveCount > INTENTIONAL_DRAG_COUNT_THRESHOLD) this.dragging = true;
		this.setValueFromPointer(finger, REASONS.drag, nativeEvent);
	}

	private handleEnd(nativeEvent: TouchEvent | PointerEvent) {
		this.setActive(-1);
		this.dragging = false;
		this.pressedThumbCenterOffset = null;

		const interactionValue = this.currentInteractionValue;
		if (Array.isArray(interactionValue) && interactionValue.length !== this.values.length) {
			this.currentInteractionValue = null;
		}

		if (this.currentInteractionValue != null) {
			this.options.getOnValueCommitted()?.(
				this.currentInteractionValue,
				createGenericEventDetails(this.lastChangeReason, nativeEvent)
			);
		}

		const control = this.control;
		if (control && 'pointerType' in nativeEvent && typeof nativeEvent.pointerId === 'number') {
			try {
				if (control.hasPointerCapture(nativeEvent.pointerId)) {
					control.releasePointerCapture(nativeEvent.pointerId);
				}
			} catch {
				// The pointer was already released, or it was never captured.
			}
		}

		this.pressedThumbIndex = -1;
		this.touchId = null;
		this.stopListening();
	}
}
