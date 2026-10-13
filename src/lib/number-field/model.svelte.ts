// Derived from Base UI v1.9.0 packages/react/src/number-field/root/NumberFieldRoot.tsx
// and packages/react/src/number-field/input/NumberFieldInput.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { on } from 'svelte/events';
import { formatNumber } from '../internal/formatNumber.js';
import { queueValueEvent } from '../internal/value-events.js';
import {
	createChangeEventDetails,
	createGenericEventDetails,
	REASONS,
	ownerDocument,
	platform,
	activeElement,
	warn
} from '@sveltery/utils';
import type { FieldContext } from '../field/model.svelte.js';
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

export interface NumberFieldModelOptions {
	getValue: () => number | null;
	writeValue: (value: number | null, details?: NumberFieldChangeEventDetails) => void;
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
	getField: () => FieldContext;
	getId: () => string | undefined;
	getName: () => string | undefined;
	getNameProp: () => string | undefined;
}

export class NumberFieldModel {
	scrubbing = $state(false);
	inputMode = $state<'numeric' | 'decimal' | 'text'>('numeric');
	inputElement = $state<HTMLInputElement | null>(null);
	pendingCaret = $state<number | null>(null);

	/**
	 * Mirrors upstream `allowInputSyncRef`. False while `draft` is what the input shows.
	 */
	allowInputSync = $state(true);
	/** Latest value `setValue` stored, including a no-op validation. */
	lastChangedValue: number | null = null;
	hasPendingCommit = false;
	/** The named input that submits the value. */
	hiddenInput = $state<HTMLInputElement | null>(null);
	/** Typed text. Ignored while `allowInputSync` is set. */
	private draft = $state<string | null>(null);
	/**
	 * Value the next step reads. Normally the stored number. A dirty commit can
	 * point it at the raw parsed text for the step that follows in the same turn.
	 */
	private basePin: { source: number | null; value: number | null } | null = null;

	readonly options: NumberFieldModelOptions;

	constructor(options: NumberFieldModelOptions) {
		this.options = options;

		$effect(() => {
			this.options.getField().setFilled(this.options.getValue() !== null);
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
				this.followInputValue();
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

	/** Shown text. A draft is kept only while input sync is off. */
	get inputValue() {
		const draft = this.draft;
		if (!this.allowInputSync && draft != null) return draft;
		return formatNumber(
			this.options.getValue(),
			this.options.getLocale(),
			this.options.getFormat()
		);
	}

	set inputValue(next: string) {
		this.draft = next;
		this.allowInputSync = false;
	}

	/** Let the input show the formatted value again. */
	followInputValue() {
		this.allowInputSync = true;
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
		const fieldState = this.options.getField().state;
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
		queueValueEvent(this.hiddenInput, 'change');
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
		const keys: string[] = [...BASE_NON_NUMERIC_SYMBOLS];
		keys.push(
			parts.find((part) => part.type === 'decimal')?.value ??
				getNumberLocaleDetails(locale, format).decimal
		);
		parts.forEach((part) => {
			if (
				part.type === 'integer' ||
				part.type === 'fraction' ||
				part.type === 'exponentInteger' ||
				part.type === 'compact'
			) {
				return;
			}
			keys.push(...part.value);
			if (SPACE_SEPARATOR_RE.test(part.value)) keys.push(' ');
		});
		const style = format?.style;
		if (style === 'percent' || (style === 'unit' && format?.unit === 'percent'))
			keys.push(...PERCENTAGES);
		if (style === 'percent' || (style === 'unit' && format?.unit === 'permille'))
			keys.push(...PERMILLE);
		keys.push(...PLUS_SIGNS_WITH_ASCII);
		if (this.minWithDefault < 0 || this.options.getAllowOutOfRange())
			keys.push(...MINUS_SIGNS_WITH_ASCII);
		return keys;
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
		}

		this.lastChangedValue = validatedValue;
		if (shouldFireChange) {
			const hidden = this.hiddenInput;
			this.options.writeValue(validatedValue, details);
			this.hasPendingCommit = true;
			// Autofill writes the hidden input itself, which already fired its events.
			if (details.event.target !== hidden) queueValueEvent(hidden, 'input');
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
		const typed = this.inputValue;
		this.followInputValue();
		if (!dirty) {
			this.lastChangedValue = this.baseValue;
			return;
		}
		const parsed = parseNumber(typed, this.options.getLocale(), this.options.getFormat());
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
				allowed.includes(character) ||
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

	handleBlur(event: FocusEvent) {
		if (this.options.getDisabled()) return;
		const field = this.options.getField();
		field.setTouched(true);
		if (this.options.getReadOnly()) return;

		const hadManualInput = !this.allowInputSync;
		const hadPending = this.hasPendingCommit;
		const previous = this.options.getValue();
		const shown = this.inputValue;
		this.followInputValue();

		if (shown.trim() === '') {
			const clearDetails = createChangeEventDetails(REASONS.inputClear, event);
			this.setValue(null, clearDetails);
			if (clearDetails.isCanceled) return;
			if (field.validationMode === 'onBlur') field.commit(null);
			if (hadManualInput || hadPending || previous !== null) {
				this.commit(null, createGenericEventDetails(REASONS.inputClear, event));
			}
			return;
		}

		const format = this.options.getFormat();
		const locale = this.options.getLocale();
		const parsed = parseNumber(shown, locale, format);
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
		if (field.validationMode === 'onBlur') field.commit(committedValue);
		if (shouldCommit) {
			this.commit(committedValue, createGenericEventDetails(REASONS.inputBlur, event));
		}
	}

	handleKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (this.options.getReadOnly() || this.options.getDisabled()) return;
		const hadManualInput = !this.allowInputSync;
		const allowed = this.getAllowedNonNumericKeys();
		let allowedNonNumeric = allowed.includes(event.key);
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
			if (detect.test(event.key) && allowed.some((key) => detect.test(key))) {
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
		if (stepKey || boundary !== null) this.followInputValue();
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
			warn('<NumberField.Input> could not read clipboard text during paste handling.');
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
