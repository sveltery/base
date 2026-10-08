// Derived from Base UI v1.8.0 packages/react/src/field/root/FieldRoot.tsx,
// useFieldValidation.ts and useFieldControlRegistration.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { FormContextValue } from '../form/context.js';
import type { FieldValidityData, FormValidationMode } from '../form/types.js';
import { DEFAULT_VALIDITY_STATE, VALIDITY_KEYS } from './constants.js';
import type { Labelable } from './labelable.svelte.js';
import type { FieldRootState, FieldValidate } from './types.js';
import { getCombinedFieldValidityData, isConstraintElement, isEligibleInput } from './validity.js';

interface FieldControlIdentity {
	id: string | undefined;
	name: string | undefined;
	element: HTMLElement | null;
}

/**
 * Either a live getter or a snapshot. A getter wins whenever it is present,
 * so the two are not combined.
 */
export type FieldControlRegistration = FieldControlIdentity &
	({ getValue: () => unknown; value?: undefined } | { value: unknown; getValue?: undefined });

interface RegisteredInput {
	element: HTMLElement | null;
	value: string | undefined;
}

const EMPTY_VALIDITY = (): FieldValidityData => ({
	state: { ...DEFAULT_VALIDITY_STATE },
	error: '',
	errors: [],
	value: null,
	initialValue: null
});

function isPromise(value: unknown): value is Promise<unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		'then' in value &&
		typeof value.then === 'function'
	);
}

function makeState(customError: boolean): FieldValidityData['state'] {
	return { ...DEFAULT_VALIDITY_STATE, valid: !customError, customError };
}

function nativeErrors(element: HTMLElement | null): string[] {
	if (!isConstraintElement(element) || !element.validationMessage) return [];
	return [element.validationMessage];
}

export interface FieldRootModelOptions {
	form: FormContextValue;
	labelable: Labelable;
	getDisabledProp: () => boolean;
	getFieldsetDisabled: () => boolean;
	getName: () => string | undefined;
	getInvalidProp: () => boolean | undefined;
	getDirtyProp: () => boolean | undefined;
	getTouchedProp: () => boolean | undefined;
	getValidationModeProp: () => FormValidationMode | undefined;
	getValidationDebounceTime: () => number;
	getValidate: () => FieldValidate | undefined;
}

/**
 * One field's validity, form registration and validation schedule.
 * Element access stays on the control (`bind:this`). This object holds the element
 * the control publishes.
 */
export class FieldRootModel {
	validityData = $state<FieldValidityData>(EMPTY_VALIDITY());
	private dirtyState = $state(false);
	private touchedState = $state(false);
	filled = $state(false);
	focused = $state(false);
	inputElement = $state<HTMLElement | null>(null);

	private markedDirty = false;
	private registeredFieldName = $state<string | undefined>(undefined);
	private registeredId: string | undefined;
	private registryId: string | undefined;
	private registration: FieldControlRegistration | null = null;
	private activeSource: symbol | null = null;
	private initialCaptured = false;
	private validationCommitId = 0;
	private customValidity:
		[HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, string, string] | null = null;
	/** When set, the form registry uses this instead of the live external invalid flag. */
	private reportedInvalid: boolean | undefined = undefined;
	private readonly registeredInputs = new SvelteMap<HTMLInputElement, RegisteredInput>();
	private timeoutId: ReturnType<typeof setTimeout> | undefined;
	private readonly options: FieldRootModelOptions;

	constructor(options: FieldRootModelOptions) {
		this.options = options;

		$effect(() => {
			const dirty = this.options.getDirtyProp();
			if (dirty !== undefined) this.markedDirty = dirty;
		});

		$effect(() => {
			return () => {
				this.clearTimer();
				const id = this.registryId;
				if (id) this.options.form.fields.delete(id);
			};
		});
	}

	get disabled() {
		return this.options.getFieldsetDisabled() || this.options.getDisabledProp();
	}

	get name(): string | undefined {
		return this.options.getName() ?? this.registeredFieldName;
	}

	get validationMode(): FormValidationMode {
		return this.options.getValidationModeProp() ?? this.options.form.validationMode;
	}

	get invalid() {
		const invalidProp = this.options.getInvalidProp();
		const name = this.name;
		const errors = this.options.form.errors;
		const formError = name && Object.hasOwn(errors, name) ? errors[name] : null;
		const hasFormError = !!(Array.isArray(formError) ? formError.length : formError);
		return invalidProp === true || hasFormError;
	}

	get formError(): string | string[] | null {
		const name = this.name;
		const errors = this.options.form.errors;
		if (!name || !Object.hasOwn(errors, name)) return null;
		return errors[name] ?? null;
	}

	get dirty() {
		return this.options.getDirtyProp() ?? this.dirtyState;
	}

	get touched() {
		return this.options.getTouchedProp() ?? this.touchedState;
	}

	get valid(): boolean | null {
		return !this.invalid && (this.disabled ? null : this.validityData.state.valid);
	}

	get state(): FieldRootState {
		return {
			disabled: this.disabled,
			touched: this.touched,
			dirty: this.dirty,
			valid: this.valid,
			filled: this.filled,
			focused: this.focused
		};
	}

	setTouched(value: boolean) {
		if (this.options.getTouchedProp() !== undefined) return;
		this.touchedState = value;
	}

	setDirty(value: boolean) {
		if (this.options.getDirtyProp() !== undefined) return;
		if (value) this.markedDirty = true;
		this.dirtyState = value;
	}

	setFilled(value: boolean) {
		this.filled = value;
	}

	setFocused(value: boolean) {
		this.focused = value;
	}

	shouldValidateOnChange() {
		return (
			this.validationMode === 'onChange' ||
			(this.validationMode === 'onSubmit' && this.options.form.submitCount > 0)
		);
	}

	validateField() {
		this.markedDirty = true;
		const registration = this.registration;
		if (!registration) {
			this.commit(this.validityData.value);
			return;
		}
		this.commit(this.registrationValue(registration));
	}

	registerControl(source: symbol, registration: FieldControlRegistration | undefined) {
		if (!registration) {
			if (this.activeSource !== source) return;
			this.activeSource = null;
			this.change(undefined, true);
			this.deleteRegistration();
			this.registration = null;
			this.registeredFieldName = undefined;
			this.registeredId = undefined;
			this.inputElement = null;
			return;
		}

		const previousId = this.registration?.id;
		const previousSource = this.activeSource;
		if (previousSource && previousSource !== source) this.change(undefined, true);

		this.activeSource = source;
		this.registration = registration;
		if (!this.options.getName()) this.registeredFieldName = registration.name;
		this.registeredId = registration.id;
		this.inputElement = registration.element;

		if (previousId && previousId !== registration.id) this.deleteRegistration(previousId);
		this.captureInitial(registration);
		this.ensureRegistry();
	}

	/**
	 * Registers one native input of a group (checkbox, radio) against this field.
	 * Field.Control itself uses `inputElement`; groups use this map.
	 */
	registerInput(element: HTMLInputElement, registration: RegisteredInput) {
		this.registeredInputs.set(element, registration);
		return () => {
			this.registeredInputs.delete(element);
		};
	}

	change(value: unknown, cancelPending = false) {
		this.clearTimer();
		this.validationCommitId += 1;
		if (cancelPending) return;

		const validateOnChange = this.shouldValidateOnChange();
		const debounce = this.options.getValidationDebounceTime();
		if (validateOnChange && value !== '' && debounce) {
			this.timeoutId = setTimeout(() => {
				this.commit(value);
			}, debounce);
			return;
		}
		this.commit(value, !validateOnChange);
	}

	commit(value: unknown, revalidate = false) {
		this.validationCommitId += 1;
		const commitId = this.validationCommitId;
		let element = this.representative();

		const publish = (
			validityState: FieldValidityData['state'],
			errorMessages: string[],
			externalInvalid?: boolean
		) => {
			const errors = validityState.valid === false ? errorMessages : [];
			this.validityData = {
				value,
				state: validityState,
				error: errors[0] ?? '',
				errors,
				initialValue: this.validityData.initialValue
			};
			this.reportedInvalid = externalInvalid;
		};

		if (revalidate) {
			if (this.valid !== false || !element) return;

			if (isConstraintElement(element) && !element.validity.valueMissing) {
				this.clearCustomValidity();
				const current = this.representative();
				const foreign =
					isConstraintElement(current) && current.validity.customError ? nativeErrors(current) : [];
				publish(makeState(foreign.length > 0), foreign, false);
				return;
			}

			if (isConstraintElement(element)) {
				for (const key of VALIDITY_KEYS) {
					if (
						key !== 'valid' &&
						key !== 'valueMissing' &&
						key !== 'customError' &&
						element.validity[key]
					) {
						return;
					}
				}
			}
		}

		this.clearTimer();
		this.clearCustomValidity();

		const refresh = () => {
			element = this.representative();
			return isConstraintElement(element) && element.willValidate
				? this.readNativeState(element)
				: makeState(false);
		};

		let nextState = refresh();
		let validationErrors = nativeErrors(element);
		const validatingOnChange = this.shouldValidateOnChange();

		if (validationErrors.length === 0 || validatingOnChange) {
			const formValues: Record<string, unknown> = {};
			for (const field of this.options.form.fields.values()) {
				if (field.name) formValues[field.name] = field.getValue();
			}

			const validate = this.options.getValidate() ?? (() => null);
			const resultOrPromise = validate(value, formValues);

			if (isPromise(resultOrPromise)) {
				if (nextState.valid === false) {
					publish(nextState, validationErrors);
				} else if (this.validationMode === 'onSubmit' || !this.validityData.state.customError) {
					nextState = { ...nextState, valid: null };
					publish(nextState, validationErrors);
				}

				void resultOrPromise.then(
					(result) => {
						if (commitId !== this.validationCommitId) return;
						this.finishAsync(commitId, value, result, refresh);
					},
					() => {
						// A rejected validator keeps the published state.
					}
				);
				return;
			}

			validationErrors = resultOrPromise
				? ([] as string[]).concat(resultOrPromise).filter(Boolean)
				: [];
			if (validationErrors.length > 0) {
				nextState = { ...nextState, valid: false, customError: true };
				if (isConstraintElement(element) && element.willValidate) {
					this.installCustomValidity(element, validationErrors.join('\n'));
				}
			} else {
				validationErrors = nativeErrors(element);
			}
		}

		publish(nextState, validationErrors);
	}

	private finishAsync(
		commitId: number,
		value: unknown,
		result: Awaited<ReturnType<FieldValidate>>,
		refresh: () => FieldValidityData['state']
	) {
		if (commitId !== this.validationCommitId) return;
		let element = this.representative();
		let nextState = refresh();
		let validationErrors = result ? ([] as string[]).concat(result).filter(Boolean) : [];
		if (validationErrors.length > 0) {
			nextState = { ...nextState, valid: false, customError: true };
			if (isConstraintElement(element) && element.willValidate) {
				this.installCustomValidity(element, validationErrors.join('\n'));
			}
		} else {
			element = this.representative();
			validationErrors = nativeErrors(element);
		}
		const errors = nextState.valid === false ? validationErrors : [];
		this.validityData = {
			value,
			state: nextState,
			error: errors[0] ?? '',
			errors,
			initialValue: this.validityData.initialValue
		};
		this.reportedInvalid = undefined;
	}

	private readNativeState(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
		const computed = { ...DEFAULT_VALIDITY_STATE };
		for (const key of VALIDITY_KEYS) {
			computed[key] = element.validity[key];
		}

		let onlyValueMissing = false;
		for (const key of VALIDITY_KEYS) {
			if (key === 'valid') continue;
			if (key === 'valueMissing' && computed[key]) onlyValueMissing = true;
			else if (computed[key]) return computed;
		}

		if (onlyValueMissing && !this.markedDirty) {
			computed.valid = true;
			computed.valueMissing = false;
		}
		return computed;
	}

	private representative(): HTMLElement | null {
		if (this.registeredInputs.size > 0) {
			let fallback: HTMLInputElement | null = null;
			for (const input of this.registeredInputs.keys()) {
				if (!isEligibleInput(input, this.options.form.element)) continue;
				if (!input.validity.valid) return input;
				fallback ??= input;
			}
			return fallback;
		}
		return this.inputElement;
	}

	private installCustomValidity(
		element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
		message: string
	) {
		const displaced = element.validity.customError ? element.validationMessage : '';
		const owned = message.replace(/\r\n?/g, '\n');
		element.setCustomValidity(owned);
		this.customValidity = [element, owned, displaced];
	}

	private clearCustomValidity() {
		const record = this.customValidity;
		this.customValidity = null;
		if (record && (!record[0].willValidate || record[0].validationMessage === record[1])) {
			record[0].setCustomValidity(record[2]);
		}
	}

	private registrationValue(registration: FieldControlRegistration) {
		if (registration.getValue) return registration.getValue();
		return registration.value === undefined ? this.readControlValue() : registration.value;
	}

	private readControlValue() {
		const registration = this.registration;
		if (registration?.getValue) return registration.getValue();
		const element = this.inputElement;
		if (isConstraintElement(element)) return element.value;
		return undefined;
	}

	private getFormValue() {
		const registration = this.registration;
		if (!registration) return undefined;
		if (registration.getValue) return registration.getValue();
		return registration.value;
	}

	private captureInitial(registration: FieldControlRegistration) {
		if (this.initialCaptured) return;
		// `getValue` is the live value, so a missing snapshot and element can still
		// record the start. A snapshot of `undefined` with neither means "not ready".
		if (
			registration.value === undefined &&
			registration.getValue === undefined &&
			!registration.element
		) {
			return;
		}
		this.initialCaptured = true;
		const initialValue = this.registrationValue(registration);
		const previous = untrack(() => this.validityData);
		if (previous.initialValue !== initialValue) {
			this.validityData = { ...previous, initialValue };
		}
	}

	private combinedForForm() {
		const invalid = this.reportedInvalid ?? this.invalid;
		return getCombinedFieldValidityData(this.validityData, invalid);
	}

	private ensureRegistry() {
		const id = this.registeredId;
		if (!id) return;
		if (this.registryId === id && this.options.form.fields.has(id)) return;
		if (this.registryId && this.registryId !== id) this.options.form.fields.delete(this.registryId);
		this.registryId = id;
		const readName = () => this.name;
		const readValidity = () => this.combinedForForm();
		const readControl = () => this.inputElement;
		const readValue = () => this.getFormValue();
		const validate = () => this.validateField();
		this.options.form.fields.set(id, {
			get name() {
				return readName();
			},
			validate,
			get validityData() {
				return readValidity();
			},
			get control() {
				return readControl();
			},
			getValue: readValue
		});
	}

	private deleteRegistration(id = this.registeredId) {
		if (!id) return;
		this.options.form.fields.delete(id);
		if (this.registryId === id) this.registryId = undefined;
	}

	private clearTimer() {
		if (this.timeoutId !== undefined) clearTimeout(this.timeoutId);
		this.timeoutId = undefined;
	}
}
