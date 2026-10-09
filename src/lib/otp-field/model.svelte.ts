// Derived from Base UI v1.8.0 packages/react/src/otp-field/root/OTPFieldRoot.tsx
// and packages/react/src/otp-field/input/OTPFieldInput.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
//
// Value changes notify Field on the path that stores the value, including a later
// parent update. Props are read through getters. Element lists live on SlotList.

import type { HTMLInputAttributes } from 'svelte/elements';
import { callPublic } from '../internal/callPublic.js';
import type { FieldRootModel } from '../field/model.svelte.js';
import type { FormContextValue } from '../form/context.js';
import {
	createChangeEventDetails,
	createGenericEventDetails,
	REASONS
} from '../internal/event-details.js';
import { ownerDocument } from '../internal/owner.js';
import { contains } from '../internal/shadow-dom.js';
import { findAssociatedLabel } from '../internal/associated-label.js';
import { getOTPValidationConfig, normalizeOTPValue, normalizeOTPValueWithDetails } from './otp.js';
import { SlotList } from './slots.svelte.js';
import type {
	OTPFieldChangeEventDetails,
	OTPFieldCompleteEventDetails,
	OTPFieldInvalidEventDetails,
	OTPFieldRootProps,
	OTPFieldRootState,
	OTPFieldValidationType
} from './types.js';

export interface OTPFieldModelOptions {
	getRawValue: () => string;
	writeValue: (next: string) => void;
	getLength: () => number;
	getValidationType: () => OTPFieldValidationType;
	getNormalizeValue: () => OTPFieldRootProps['normalizeValue'];
	getDisabled: () => boolean;
	getReadOnly: () => boolean;
	getRequired: () => boolean;
	getAutoSubmit: () => boolean;
	getAutoComplete: () => HTMLInputAttributes['autocomplete'];
	getMask: () => boolean;
	getInputMode: () => OTPFieldRootProps['inputMode'];
	getFormId: () => string | undefined;
	getName: () => string | undefined;
	getControlId: () => string;
	getAriaLabelledByProp: () => string | undefined;
	getLabelId: () => string | undefined;
	getOnValueChange: () => OTPFieldRootProps['onValueChange'];
	getOnValueInvalid: () => OTPFieldRootProps['onValueInvalid'];
	getOnValueComplete: () => OTPFieldRootProps['onValueComplete'];
	getField: () => FieldRootModel;
	getForm: () => FormContextValue;
}

export class OTPFieldModel {
	readonly slots = new SlotList();
	root = $state<HTMLDivElement | null>(null);
	hiddenInput = $state<HTMLInputElement | null>(null);
	focused = $state(false);
	focusedIndex = $state(0);
	fallbackLabelId = $state<string | undefined>(undefined);

	private pendingFocus: { index: number; value: string } | null = null;
	private pendingComplete: { value: string; eventDetails: OTPFieldCompleteEventDetails } | null =
		null;
	private readonly options: OTPFieldModelOptions;

	constructor(options: OTPFieldModelOptions) {
		this.options = options;
		const length = options.getLength();
		const initial = normalizeOTPValue(
			options.getRawValue(),
			length,
			options.getValidationType(),
			options.getNormalizeValue()
		);
		this.focusedIndex = Math.min(initial.length, length - 1);
	}

	get value() {
		return normalizeOTPValue(
			this.options.getRawValue(),
			this.length,
			this.validationType,
			this.options.getNormalizeValue()
		);
	}

	get length() {
		return this.options.getLength();
	}

	get validationType() {
		return this.options.getValidationType();
	}

	get disabled() {
		return this.options.getDisabled();
	}

	get readOnly() {
		return this.options.getReadOnly();
	}

	get required() {
		return this.options.getRequired();
	}

	get autoSubmit() {
		return this.options.getAutoSubmit();
	}

	get autoComplete() {
		return this.options.getAutoComplete();
	}

	get mask() {
		return this.options.getMask();
	}

	get formId() {
		return this.options.getFormId();
	}

	get name() {
		return this.options.getName();
	}

	get controlId() {
		return this.options.getControlId();
	}

	get groupLabelledBy() {
		return (
			this.options.getAriaLabelledByProp() ?? this.options.getLabelId() ?? this.fallbackLabelId
		);
	}

	get inputAriaLabelledBy() {
		if (this.options.getAriaLabelledByProp() != null) return undefined;
		return this.groupLabelledBy;
	}

	get normalize() {
		return this.options.getNormalizeValue();
	}

	get field() {
		return this.options.getField();
	}

	get filled() {
		return this.value !== '';
	}

	get hasValidLength() {
		return Number.isInteger(this.length) && this.length > 0;
	}

	get validationConfig() {
		return getOTPValidationConfig(this.validationType);
	}

	get pattern() {
		return this.validationConfig?.slotPattern;
	}

	get hiddenPattern() {
		return this.validationConfig?.getRootPattern(this.length);
	}

	get inputMode() {
		return this.options.getInputMode() ?? this.validationConfig?.inputMode;
	}

	get activeIndex() {
		const cap = Math.max(this.length - 1, 0);
		if (this.focused) return Math.min(this.focusedIndex, cap);
		return Math.min(this.value.length, this.length - 1);
	}

	get invalid() {
		return this.field.invalid;
	}

	get state(): OTPFieldRootState {
		return {
			...this.field.state,
			complete: this.value.length === this.length,
			disabled: this.disabled,
			filled: this.filled,
			focused: this.focused,
			length: this.length,
			readOnly: this.readOnly,
			required: this.required,
			value: this.value
		};
	}

	getInputId(index: number) {
		const id = this.controlId;
		if (!id) return undefined;
		return index === 0 ? id : `${id}-${index + 1}`;
	}

	publishFilled(filled: boolean) {
		this.field.setFilled(filled);
	}

	syncFallbackLabel(explicit: string | undefined, labelId: string | undefined) {
		const input = this.slots.first;
		if (explicit || labelId || !input) {
			this.fallbackLabelId = undefined;
			return;
		}
		const label = findAssociatedLabel(input);
		if (!label) {
			this.fallbackLabelId = undefined;
			return;
		}
		if (!label.id) label.id = `${this.controlId}-label`;
		this.fallbackLabelId = label.id || undefined;
	}

	focusInput(index: number) {
		const inputs = this.slots.elements;
		const targetIndex = Math.min(Math.max(index, 0), Math.max(inputs.length - 1, 0));
		const target = inputs[targetIndex];
		target?.focus();
		target?.select();
	}

	queueFocusInput(index: number, nextValue: string) {
		this.pendingFocus = { index, value: nextValue };
	}

	setValue(nextValue: string, details: OTPFieldChangeEventDetails): string | null {
		const normalizedValue = normalizeOTPValue(
			nextValue,
			this.length,
			this.validationType,
			this.options.getNormalizeValue()
		);
		const completeReason =
			details.reason === REASONS.inputChange || details.reason === REASONS.inputPaste
				? details.reason
				: null;
		const completeEventDetails =
			completeReason != null &&
			normalizedValue.length === this.length &&
			(this.value.length !== this.length || completeReason === REASONS.inputPaste)
				? createGenericEventDetails(completeReason, details.event)
				: null;

		if (normalizedValue === this.value) {
			if (completeEventDetails != null) {
				this.completeValue(normalizedValue, completeEventDetails);
			}
			return null;
		}

		callPublic(this.options.getOnValueChange(), normalizedValue, details);
		if (details.isCanceled) return null;

		if (completeEventDetails != null) {
			this.pendingComplete = { value: normalizedValue, eventDetails: completeEventDetails };
		} else if (normalizedValue.length !== this.length) {
			this.pendingComplete = null;
		}

		this.options.writeValue(normalizedValue);
		return normalizedValue;
	}

	reportValueInvalid(invalidValue: string, details: OTPFieldInvalidEventDetails) {
		callPublic(this.options.getOnValueInvalid(), invalidValue, details);
	}

	handleHiddenInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.defaultPrevented || this.disabled || this.readOnly) return;

		const rawValue = event.currentTarget.value;
		const [normalizedValue, didRejectCharacters] = normalizeOTPValueWithDetails(
			rawValue,
			this.length,
			this.validationType,
			this.options.getNormalizeValue()
		);

		if (didRejectCharacters) {
			this.reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputChange, event));
		}

		const committedValue = this.setValue(
			normalizedValue,
			createChangeEventDetails(REASONS.inputChange, event)
		);

		if (committedValue != null && committedValue !== '') {
			this.queueFocusInput(committedValue.length - 1, committedValue);
		}
	}

	handleInputFocus(index: number, event: FocusEvent & { currentTarget: HTMLInputElement }) {
		if (index > this.value.length) {
			this.focusInput(Math.min(this.value.length, this.length - 1));
			return;
		}

		this.focusedIndex = index;
		this.focused = true;
		this.field.setFocused(true);
		event.currentTarget.select();
	}

	handleInputBlur(event: FocusEvent) {
		if (contains(this.root, event.relatedTarget)) return;

		this.field.setTouched(true);
		this.focused = false;
		this.field.setFocused(false);

		if (this.field.validationMode === 'onBlur') {
			this.field.commit(this.value);
		}
	}

	afterValueChange(next: string) {
		const name = this.name;
		this.options.getForm().clearErrors(name);
		const field = this.field;
		field.setDirty(next !== field.validityData.initialValue);
		field.change(next);

		const pendingFocus = this.pendingFocus;
		if (pendingFocus != null) {
			this.pendingFocus = null;
			if (pendingFocus.value === next) this.focusInput(pendingFocus.index);
		}

		const pendingComplete = this.pendingComplete;
		if (pendingComplete != null) {
			this.pendingComplete = null;
			if (pendingComplete.value === next) {
				this.completeValue(next, pendingComplete.eventDetails);
			}
		}
	}

	private completeValue(completedValue: string, eventDetails: OTPFieldCompleteEventDetails) {
		callPublic(this.options.getOnValueComplete(), completedValue, eventDetails);
		if (!this.autoSubmit) return;
		if (this.hiddenInput) this.hiddenInput.value = completedValue;
		this.requestSubmit();
	}

	private requestSubmit() {
		let formElement: HTMLFormElement | null =
			this.hiddenInput?.form ?? this.slots.first?.form ?? null;
		const formId = this.formId;
		if (formId) {
			const associated = ownerDocument(this.root).getElementById(formId);
			if (associated?.tagName === 'FORM') formElement = associated as HTMLFormElement;
		}
		if (formElement && typeof formElement.requestSubmit === 'function') {
			formElement.requestSubmit();
		}
	}
}
