// Derived from Base UI v1.8.0 packages/react/src/number-field/root/NumberFieldRoot.tsx
// and packages/react/src/number-field/input/NumberFieldInput.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { on } from 'svelte/events';
import { SvelteSet } from 'svelte/reactivity';
import { formatNumber } from '../internal/formatNumber.js';
import {
	createChangeEventDetails,
	createGenericEventDetails,
	REASONS
} from '../internal/event-details.js';
import type { FieldRootModel } from '../field/model.svelte.js';
import type { FieldRootState } from '../field/types.js';
import { ownerDocument } from '../internal/owner.js';
import { platform } from '../internal/platform.js';
import { activeElement } from '../internal/shadow-dom.js';
import {
	ANY_MINUS_DETECT_RE,
	ANY_MINUS_RE,
	ANY_PLUS_DETECT_RE,
	ANY_PLUS_RE,
	BASE_NON_NUMERIC_SYMBOLS,
	FORMAT_CONTROL_DETECT_RE,
	getFormatParts,
	getNumberLocaleDetails,
	isNumeralChar,
	MINUS_SIGNS_WITH_ASCII,
	parseNumber,
	PERCENTAGES,
	PERMILLE,
	PLUS_SIGNS_WITH_ASCII,
	SPACE_SEPARATOR_RE
} from './parse.js';
import {
	hasNumberFormatRoundingOptions,
	removeFloatingPointErrors,
	toValidatedNumber
} from './validate.js';
import type {
	EventWithOptionalKeyState,
	IncrementValueParameters,
	NumberFieldChangeEventDetails,
	NumberFieldChangeEventReason,
	NumberFieldCommitEventDetails,
	NumberFieldRootState
} from './types.js';

const NAVIGATE_KEYS = new Set([
	'Backspace',
	'Delete',
	'ArrowLeft',
	'ArrowRight',
	'Tab',
	'Enter',
	'Escape'
]);

const EMPTY_FIELD_STATE: FieldRootState = {
	disabled: false,
	touched: false,
	dirty: false,
	valid: null,
	filled: false,
	focused: false
};

export interface NumberFieldModelOptions {
	getValue: () => number | null;
	writeValue: (value: number | null) => void;
	getMin: () => number | undefined;
	getMax: () => number | undefined;
	getSmallStep: () => number;
	getStep: () => number;
	getLargeStep: () => number;
	getRequired: () => boolean;
	getDisabled: () => boolean;
	getReadOnly: () => boolean;
	getAllowOutOfRange: () => boolean;
	getSnapOnStep: () => boolean;
	getAllowWheelScrub: () => boolean;
	getFormat: () => Intl.NumberFormatOptions | undefined;
	getLocale: () => Intl.LocalesArgument | undefined;
	getOnValueChange: () =>
		((value: number | null, details: NumberFieldChangeEventDetails) => void) | undefined;
	getOnValueCommitted: () =>
		((value: number | null, details: NumberFieldCommitEventDetails) => void) | undefined;
	getField: () => FieldRootModel | undefined;
	getId: () => string | undefined;
	getName: () => string | undefined;
	getNameProp: () => string | undefined;
}

export class NumberFieldModel {
	inputValue = $state('');
	scrubbing = $state(false);
	inputMode = $state<'numeric' | 'decimal' | 'text'>('numeric');
	inputElement = $state<HTMLInputElement | null>(null);
	pendingCaret = $state<number | null>(null);

	/** Mirrors upstream `allowInputSyncRef`. Plain so flipping it does not schedule a render. */
	allowInputSync = true;
	/** Latest value `setValue` stored, including a no-op validation. */
	lastChangedValue: number | null = null;
	hasPendingCommit = false;
	/**
	 * Reason for the value currently being committed. The change notice reads it
	 * once so a blur can commit without a second validation pass.
	 */
	changeReason: NumberFieldChangeEventDetails['reason'] | null = null;
	readonly fieldSource = Symbol('number-field-field');
	/**
	 * Value the next step reads. Normally the stored number. A dirty commit can
	 * point it at the raw parsed text for the step that follows in the same turn.
	 */
	private basePin: { source: number | null; value: number | null } | null = null;

	readonly options: NumberFieldModelOptions;

	constructor(options: NumberFieldModelOptions) {
		this.options = options;
		this.inputValue = formatNumber(options.getValue(), options.getLocale(), options.getFormat());

		// Before the DOM commit, so the change notice (a later `$effect`) validates
		// the text the parent write is about to show.
		$effect.pre(() => {
			const value = this.options.getValue();
			const locale = this.options.getLocale();
			const format = this.options.getFormat();
			const shown = this.inputValue;
			if (!this.allowInputSync) return;
			const next = formatNumber(value, locale, format);
			if (next !== shown) this.inputValue = next;
		});

		$effect(() => {
			this.options.getField()?.setFilled(this.options.getValue() !== null);
		});

		$effect(() => {
			const min = this.minWithDefault;
			if (!platform.os.ios) {
				this.inputMode = 'numeric';
				return;
			}
			this.inputMode = min >= 0 ? 'decimal' : 'text';
		});

		$effect(() => {
			const element = this.inputElement;
			const disabled = this.options.getDisabled();
			const readOnly = this.options.getReadOnly();
			const allow = this.options.getAllowWheelScrub();
			if (disabled || readOnly || !allow || !element) return;

			const handleWheel = (event: WheelEvent) => {
				if (
					event.ctrlKey ||
					activeElement(ownerDocument(this.inputElement)) !== this.inputElement
				) {
					return;
				}
				const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
				const delta = event.shiftKey && horizontal ? event.deltaX : event.deltaY;
				if (delta === 0 || (!event.shiftKey && horizontal)) return;
				event.preventDefault();
				this.allowInputSync = true;
				const amount = this.getStepAmount(event);
				const changed = this.incrementValue(amount, {
					direction: delta > 0 ? -1 : 1,
					event,
					reason: REASONS.wheel
				});
				if (changed) {
					this.commit(this.lastChangedValue, createGenericEventDetails(REASONS.wheel, event));
				}
			};

			return on(element, 'wheel', handleWheel, { passive: false });
		});

		$effect(() => {
			const caret = this.pendingCaret;
			if (caret == null) return;
			this.pendingCaret = null;
			this.inputElement?.setSelectionRange(caret, caret);
		});
	}

	get baseValue(): number | null {
		const live = this.options.getValue();
		if (this.basePin && Object.is(this.basePin.source, live)) return this.basePin.value;
		return live;
	}

	set baseValue(next: number | null) {
		this.basePin = { source: this.options.getValue(), value: next };
	}

	get minWithDefault() {
		return this.options.getMin() ?? Number.MIN_SAFE_INTEGER;
	}

	get maxWithDefault() {
		return this.options.getMax() ?? Number.MAX_SAFE_INTEGER;
	}

	get minWithZeroDefault() {
		return this.options.getMin() ?? 0;
	}

	get state(): NumberFieldRootState {
		const fieldState = this.options.getField()?.state ?? EMPTY_FIELD_STATE;
		return {
			...fieldState,
			disabled: this.options.getDisabled(),
			readOnly: this.options.getReadOnly(),
			required: this.options.getRequired(),
			value: this.options.getValue(),
			inputValue: this.inputValue,
			scrubbing: this.scrubbing
		};
	}

	commit(next: number | null, details: NumberFieldCommitEventDetails) {
		this.hasPendingCommit = false;
		this.options.getOnValueCommitted()?.(next, details);
	}

	getStepAmount(event?: EventWithOptionalKeyState) {
		if (event?.altKey) return this.options.getSmallStep();
		if (event?.shiftKey) return this.options.getLargeStep();
		return this.options.getStep();
	}

	getAllowedNonNumericKeys() {
		const locale = this.options.getLocale();
		const format = this.options.getFormat();
		const parts = getFormatParts(locale, format);
		const keys = new SvelteSet<string>(BASE_NON_NUMERIC_SYMBOLS);
		const addAll = (chars: readonly string[]) => chars.forEach((char) => keys.add(char));
		const decimal =
			parts.find((part) => part.type === 'decimal')?.value ??
			getNumberLocaleDetails(locale, format).decimal;
		keys.add(decimal);
		parts.forEach((part) => {
			if (
				part.type === 'integer' ||
				part.type === 'fraction' ||
				part.type === 'exponentInteger' ||
				part.type === 'compact'
			) {
				return;
			}
			addAll(Array.from(part.value));
			if (SPACE_SEPARATOR_RE.test(part.value)) keys.add(' ');
		});
		const style = format?.style;
		if (style === 'percent' || (style === 'unit' && format?.unit === 'percent'))
			addAll(PERCENTAGES);
		if (style === 'percent' || (style === 'unit' && format?.unit === 'permille')) addAll(PERMILLE);
		addAll(PLUS_SIGNS_WITH_ASCII);
		if (this.minWithDefault < 0 || this.options.getAllowOutOfRange())
			addAll(MINUS_SIGNS_WITH_ASCII);
		return keys;
	}

	/** Point field validation at the current number and input before the change notice. */
	registerField(snapshot?: {
		disabled: boolean;
		element: HTMLInputElement | null;
		id: string | undefined;
		name: string | undefined;
	}) {
		const field = this.options.getField();
		if (!field) return;
		const disabled = snapshot?.disabled ?? this.options.getDisabled();
		const element = snapshot ? snapshot.element : this.inputElement;
		const id = snapshot ? snapshot.id : this.options.getId();
		const name = snapshot ? snapshot.name : this.options.getNameProp();
		if (disabled) {
			field.registerControl(this.fieldSource, undefined);
			return;
		}
		field.registerControl(this.fieldSource, {
			id,
			name,
			value: this.options.getValue(),
			element
		});
	}

	setValue(unvalidatedValue: number | null, details: NumberFieldChangeEventDetails): boolean {
		const keyState = details.event as EventWithOptionalKeyState;
		const direction = details.direction;
		const isInputReason = details.reason.startsWith('input-') || details.reason === REASONS.none;
		const shouldClamp = !this.options.getAllowOutOfRange() || !isInputReason;
		const validatedValue = toValidatedNumber(
			unvalidatedValue,
			direction ? this.getStepAmount(keyState) * direction : undefined,
			this.minWithDefault,
			this.maxWithDefault,
			this.minWithZeroDefault,
			this.options.getFormat(),
			this.options.getSnapOnStep(),
			keyState?.altKey ?? false,
			shouldClamp
		);
		const value = this.options.getValue();
		const shouldFireChange =
			validatedValue !== value ||
			(isInputReason && (unvalidatedValue !== value || this.allowInputSync === false));

		if (shouldFireChange) {
			this.options.getOnValueChange()?.(validatedValue, details);
			if (details.isCanceled) return false;
			this.changeReason = details.reason;
		}

		this.lastChangedValue = validatedValue;
		if (this.allowInputSync) {
			this.inputValue = formatNumber(
				validatedValue,
				this.options.getLocale(),
				this.options.getFormat()
			);
		}
		if (shouldFireChange) {
			const before = this.options.getValue();
			this.options.writeValue(validatedValue);
			if (Object.is(before, this.options.getValue())) this.changeReason = null;
			this.hasPendingCommit = true;
		}
		return shouldFireChange;
	}

	incrementValue(amount: number, params: IncrementValueParameters): boolean {
		const previous = params.currentValue == null ? this.baseValue : params.currentValue;
		if (typeof previous !== 'number') {
			return this.setValue(0, createChangeEventDetails(params.reason, params.event));
		}
		return this.setValue(
			previous + amount * params.direction,
			createChangeEventDetails(params.reason, params.event, undefined, {
				direction: params.direction
			})
		);
	}

	focusInput() {
		const input = this.inputElement;
		if (!input) return;
		const length = input.value.length;
		input.setSelectionRange(length, length);
		input.focus();
	}

	/**
	 * Publish a dirty typed value before a step, without a direction so it is
	 * not snapped before the real increment.
	 */
	commitTypedValue(event: Event, reason: NumberFieldChangeEventReason) {
		const dirty = !this.allowInputSync;
		this.allowInputSync = true;
		if (!dirty) {
			this.lastChangedValue = this.baseValue;
			return;
		}
		const parsed = parseNumber(this.inputValue, this.options.getLocale(), this.options.getFormat());
		if (parsed === null) return;
		const details = createChangeEventDetails(reason, event);
		this.setValue(parsed, details);
		if (!details.isCanceled) this.baseValue = parsed;
	}

	/** Returns false when the text must be reverted. */
	applyInputText(targetValue: string, event: Event): boolean {
		this.allowInputSync = false;
		if (targetValue.trim() === '') {
			this.inputValue = targetValue;
			this.setValue(null, createChangeEventDetails(REASONS.inputClear, event));
			return true;
		}
		const allowed = this.getAllowedNonNumericKeys();
		const charactersOk = Array.from(targetValue).every(
			(character) =>
				isNumeralChar(character) ||
				ANY_MINUS_DETECT_RE.test(character) ||
				allowed.has(character) ||
				FORMAT_CONTROL_DETECT_RE.test(character)
		);
		if (!charactersOk) return false;
		const parsed = parseNumber(targetValue, this.options.getLocale(), this.options.getFormat());
		this.inputValue = targetValue;
		if (parsed !== null) {
			this.setValue(parsed, createChangeEventDetails(REASONS.inputChange, event));
		}
		return true;
	}

	handleFocus() {
		if (this.options.getDisabled()) return;
		this.options.getField()?.setFocused(true);
	}

	handleBlur(event: FocusEvent) {
		if (this.options.getDisabled()) return;
		const field = this.options.getField();
		field?.setTouched(true);
		field?.setFocused(false);
		if (this.options.getReadOnly()) return;

		const hadManualInput = !this.allowInputSync;
		const hadPending = this.hasPendingCommit;
		const previous = this.options.getValue();
		this.allowInputSync = true;

		if (this.inputValue.trim() === '') {
			const clearDetails = createChangeEventDetails(REASONS.inputClear, event);
			this.setValue(null, clearDetails);
			if (clearDetails.isCanceled) return;
			if (field?.validationMode === 'onBlur') field.commit(null);
			if (hadManualInput || hadPending || previous !== null) {
				this.commit(null, createGenericEventDetails(REASONS.inputClear, event));
			}
			return;
		}

		const format = this.options.getFormat();
		const locale = this.options.getLocale();
		const parsed = parseNumber(this.inputValue, locale, format);
		if (parsed === null) return;

		const rounding = hasNumberFormatRoundingOptions(format);
		let committed: number | null;
		if (!hadManualInput && !rounding) committed = previous;
		else if (rounding) committed = removeFloatingPointErrors(parsed, format);
		else committed = parsed;

		const shouldUpdate = previous !== committed;
		const shouldCommit = hadManualInput || shouldUpdate || hadPending;
		let committedValue = committed;
		if (shouldUpdate) {
			const changeDetails = createChangeEventDetails(REASONS.inputBlur, event);
			this.setValue(committed, changeDetails);
			if (changeDetails.isCanceled) return;
			committedValue = this.lastChangedValue;
		}
		if (field?.validationMode === 'onBlur') field.commit(committedValue);
		if (shouldCommit) {
			this.commit(committedValue, createGenericEventDetails(REASONS.inputBlur, event));
		}
		const canonical = formatNumber(committedValue, locale, format);
		if (this.inputValue !== canonical) this.inputValue = canonical;
	}

	handleKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (this.options.getReadOnly() || this.options.getDisabled()) return;
		const hadManualInput = !this.allowInputSync;
		const allowed = this.getAllowedNonNumericKeys();
		let allowedNonNumeric = allowed.has(event.key);
		const { decimal, currency, percentSign } = getNumberLocaleDetails(
			this.options.getLocale(),
			this.options.getFormat()
		);
		const input = event.currentTarget;
		const selectionStart = input.selectionStart;
		const selectionEnd = input.selectionEnd;
		const allSelected = selectionStart === 0 && selectionEnd === this.inputValue.length;
		const covers = (index: number) =>
			selectionStart != null &&
			selectionEnd != null &&
			index >= selectionStart &&
			index < selectionEnd;

		const signs = [
			[ANY_MINUS_DETECT_RE, ANY_MINUS_RE],
			[ANY_PLUS_DETECT_RE, ANY_PLUS_RE]
		] as const;
		for (const [detect, global] of signs) {
			if (detect.test(event.key) && Array.from(allowed).some((key) => detect.test(key))) {
				const existing = this.inputValue.search(global);
				const replacing = existing !== -1 && covers(existing);
				allowedNonNumeric =
					!(
						ANY_MINUS_DETECT_RE.test(this.inputValue) || ANY_PLUS_DETECT_RE.test(this.inputValue)
					) ||
					allSelected ||
					replacing;
			}
		}
		for (const symbol of [decimal, currency, percentSign]) {
			if (!symbol || event.key !== symbol) continue;
			const index = this.inputValue.indexOf(symbol);
			allowedNonNumeric = index === -1 || allSelected || covers(index);
		}

		const navigate = NAVIGATE_KEYS.has(event.key);
		const stepKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';
		const which = (event as KeyboardEvent & { which?: number }).which;
		if (
			which === 229 ||
			event.isComposing ||
			(event.altKey && !stepKey) ||
			event.ctrlKey ||
			event.metaKey ||
			allowedNonNumeric ||
			isNumeralChar(event.key) ||
			navigate
		) {
			return;
		}

		const min = this.options.getMin();
		const max = this.options.getMax();
		let boundary: number | null = null;
		if (event.key === 'Home' && min != null) boundary = min;
		else if (event.key === 'End' && max != null) boundary = max;
		if (event.key.length > 1 && !stepKey && boundary === null) return;

		const currentValue = hadManualInput
			? parseNumber(this.inputValue, this.options.getLocale(), this.options.getFormat())
			: null;
		const amount = this.getStepAmount(event);
		event.preventDefault();
		event.stopPropagation();
		const commitDetails = createGenericEventDetails(REASONS.keyboard, event);
		let changed = false;
		if (stepKey || boundary !== null) this.allowInputSync = true;
		if (stepKey) {
			if (!hadManualInput) this.lastChangedValue = this.baseValue;
			changed = this.incrementValue(amount, {
				direction: event.key === 'ArrowUp' ? 1 : -1,
				currentValue,
				event,
				reason: REASONS.keyboard
			});
		} else if (boundary !== null) {
			changed = this.setValue(boundary, createChangeEventDetails(REASONS.keyboard, event));
		}
		if (changed) this.commit(this.lastChangedValue, commitDetails);
	}

	handlePaste(event: ClipboardEvent & { currentTarget: HTMLInputElement }) {
		if (this.options.getReadOnly() || this.options.getDisabled()) return;
		let pasted: string;
		try {
			pasted = event.clipboardData?.getData('text/plain') ?? '';
		} catch {
			return;
		}
		event.preventDefault();
		const input = event.currentTarget;
		const start = input.selectionStart ?? 0;
		const end = input.selectionEnd ?? 0;
		const nextText = this.inputValue.slice(0, start) + pasted + this.inputValue.slice(end);
		const parsed = parseNumber(nextText, this.options.getLocale(), this.options.getFormat());
		if (parsed === null) return;
		this.allowInputSync = false;
		this.pendingCaret = start + pasted.length;
		this.setValue(parsed, createChangeEventDetails(REASONS.inputPaste, event));
		this.inputValue = nextText;
	}

	/**
	 * Browser autofill on the hidden number input.
	 * Returns false when the event is ignored.
	 */
	handleHiddenChange(event: Event & { currentTarget: HTMLInputElement }): number | null | false {
		if (event.defaultPrevented || this.options.getDisabled() || this.options.getReadOnly()) {
			return false;
		}
		const next = event.currentTarget.valueAsNumber;
		const parsed = Number.isNaN(next) ? null : next;
		const details = createChangeEventDetails(REASONS.none, event);
		this.setValue(parsed, details);
		return this.lastChangedValue ?? parsed;
	}
}
