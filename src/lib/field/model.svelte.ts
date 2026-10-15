// Derived from Base UI v1.9.0 packages/react/src/field/root/FieldRoot.tsx,
// useFieldValidation.ts and useFieldControlRegistration.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { ScopedTimeout } from '@sveltery/utils';
import { SvelteMap } from 'svelte/reactivity';
import type { FormContextValue } from '../internal/form-context.js';
import { onFormReset, ownerForm } from '../internal/form-reset.svelte.js';
import type { FieldValidityData, FormValidationMode } from '../form/types.js';
import { resolveField, type ControlKind, type FieldHandle } from '../form/source.js';
import { FieldIssues, handlePath } from '../form/issues.svelte.js';
import { DEFAULT_VALIDITY_STATE, VALIDITY_KEYS } from '../internal/field-constants.js';
import type { Labelable } from '../internal/labelable-provider.svelte.js';
import type { FieldRootState, FieldValidate, FieldValidateResult } from './types.js';
import { getCombinedFieldValidityData, isConstraintElement, isEligibleInput } from './validity.js';

interface FieldControlIdentity {
	id: string | undefined;
	name: string | undefined;
	element: HTMLElement | null;
	/** What the Form submits when it differs from the control value, as for a checkbox group. */
	getFormValue?: () => unknown;
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

/** What field parts read. The inert fallback is this shape, not a model instance. */
export interface FieldContext {
	readonly validityData: FieldValidityData;
	readonly disabled: boolean;
	readonly name: string | undefined;
	readonly validationMode: FormValidationMode;
	readonly invalid: boolean;
	readonly formError: string | string[] | null;
	readonly hasFormError: boolean;
	readonly dirty: boolean;
	readonly touched: boolean;
	readonly valid: boolean | null;
	readonly filled: boolean;
	readonly focused: boolean;
	readonly state: FieldRootState;
	readonly inputElement: HTMLElement | null;
	setTouched: (value: boolean) => void;
	setDirty: (value: boolean) => void;
	setFilled: (value: boolean) => void;
	setFocused: (value: boolean) => void;
	/** The control the focused state belongs to. Written by `FieldFocusOwner`. */
	focusOwner: unknown;
	shouldValidateOnChange: () => boolean;
	validateField: () => void;
	registerControl: (source: symbol, registration: FieldControlRegistration | undefined) => void;
	registerInput: (element: HTMLInputElement, registration: RegisteredInput) => () => void;
	/** Native inputs registered with this Field. A grouped checkbox's entry carries the value it submits. */
	readonly registeredInputs: ReadonlyMap<HTMLInputElement, RegisteredInput>;
	change: (value: unknown, cancelPending?: boolean) => void;
	commit: (value: unknown, revalidate?: boolean) => void;
	/** The handle this Field is bound to through `field` or a `name` in a bound Form. */
	readonly binding: FieldHandle | undefined;
	/** The control kind Field.Root declares with `type`. Composites dev-check theirs against it. */
	readonly controlType: ControlKind | undefined;
}

/** State of a field that has no provider. Slider and OTP share this one object. */
export const DEFAULT_FIELD_STATE: FieldRootState = {
	disabled: false,
	touched: false,
	dirty: false,
	valid: null,
	filled: false,
	focused: false
};

export const EMPTY_VALIDITY = (): FieldValidityData => ({
	state: { ...DEFAULT_VALIDITY_STATE },
	error: '',
	errors: [],
	value: null,
	initialValue: null
});

function formErrorPresent(formError: string | string[] | null) {
	return !!(Array.isArray(formError) ? formError.length : formError);
}

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
	/** The handle passed as `field`. */
	getField: () => FieldHandle | undefined;
	getControlType: () => ControlKind | undefined;
}

/**
 * One field's validity, form registration and validation schedule.
 * Element access stays on the control (`bind:this`). This object holds the element
 * the control publishes.
 */
export class FieldRootModel implements FieldContext {
	validityData = $state<FieldValidityData>(EMPTY_VALIDITY());
	private dirtyState = $state(false);
	private touchedState = $state(false);
	filled = $state(false);
	focused = $state(false);
	focusOwner: unknown = undefined;
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
	readonly registeredInputs = new SvelteMap<HTMLInputElement, RegisteredInput>();
	private readonly debounceTimer = new ScopedTimeout();
	private readonly options: FieldRootModelOptions;
	private readonly resetForm: HTMLFormElement | null;
	/** The handle from `field`, or the one `name` resolves to through the Form's source. */
	readonly binding: FieldHandle | undefined;
	/** The path a bound field submits under, which is also its Base `name`. */
	private readonly bindingPath: string | undefined;
	private readonly issues: FieldIssues;

	constructor(options: FieldRootModelOptions) {
		this.options = options;
		this.binding = $derived.by(() => {
			const field = options.getField();
			if (field) return field;
			const name = options.getName();
			const source = options.form.source;
			return name && source ? resolveField(source.fields, name) : undefined;
		});
		this.bindingPath = $derived(this.binding ? handlePath(this.binding) : undefined);
		this.issues = new FieldIssues(options.form.issues, {
			binding: () => this.binding,
			path: () => this.bindingPath ?? '',
			validationMode: () => this.validationMode,
			dirty: () => this.dirty,
			touched: () => this.touched
		});

		// The Field shows its own path's issues and its `errors` entry, so Form.Error leaves them out.
		$effect(() => {
			const key = this.name;
			const byName = this.binding !== undefined && !options.getField();
			return options.form.issues.register(
				this.issues,
				key === undefined ? undefined : { key, byName }
			);
		});
		this.resetForm = $derived(
			ownerForm(this.registeredInputs.keys().next().value ?? this.inputElement) ??
				options.form.element
		);

		$effect(() => {
			const dirty = this.options.getDirtyProp();
			if (dirty !== undefined) this.markedDirty = dirty;
		});

		// The control has restored its value by the time a reset settles.
		$effect(() => {
			const form = this.resetForm;
			if (!form) return;
			return onFormReset(form, { settle: () => this.reset() });
		});

		$effect(() => {
			return () => {
				this.clearTimer();
				const id = this.registryId;
				if (id) this.options.form.fields.delete(id);
			};
		});
	}

	get controlType(): ControlKind | undefined {
		return this.options.getControlType();
	}

	get disabled() {
		return this.options.getFieldsetDisabled() || this.options.getDisabledProp();
	}

	get name(): string | undefined {
		return this.options.getName() ?? this.bindingPath ?? this.registeredFieldName;
	}

	get validationMode(): FormValidationMode {
		return this.options.getValidationModeProp() ?? this.options.form.validationMode;
	}

	get invalid() {
		return this.options.getInvalidProp() === true || this.hasFormError;
	}

	/** Visible source issues, else the Form `errors` entry for this field's name. */
	get formError(): string | string[] | null {
		const issues = this.issues.visible;
		if (issues.length > 0) return issues.length === 1 ? issues[0] : issues;
		return this.errorsEntry;
	}

	private get errorsEntry(): string | string[] | null {
		const name = this.name;
		const errors = this.options.form.errors;
		if (!name || !Object.hasOwn(errors, name)) return null;
		return errors[name] ?? null;
	}

	get hasFormError() {
		return formErrorPresent(this.formError);
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
		if (value && this.binding) {
			// Composites focus a visible element with no name, so a source cannot see the blur itself.
			// Kit's field proxy answers every property with another proxy, so test for a function
			// and call it without reading `.call`.
			const blur: unknown = this.binding.blur;
			if (typeof blur === 'function') Reflect.apply(blur, this.binding, []);
			if (this.validationMode === 'onBlur') this.options.form.issues.revalidate();
		}
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
		this.commit(this.readRegisteredValue());
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

	/** Returns the field to its state before any interaction, with the current value as the start. */
	reset() {
		this.clearTimer();
		this.validationCommitId += 1;
		this.clearCustomValidity();
		this.markedDirty = this.options.getDirtyProp() ?? false;
		this.dirtyState = false;
		this.touchedState = false;
		this.reportedInvalid = undefined;
		this.issues.clear();
		this.validityData = { ...EMPTY_VALIDITY(), initialValue: this.readRegisteredValue() };
	}

	change(value: unknown, cancelPending = false) {
		this.clearTimer();
		this.validationCommitId += 1;
		if (cancelPending) return;
		if (this.binding) {
			this.issues.markChanged();
			if (this.validationMode === 'onChange' || this.options.form.issues.submitted) {
				this.options.form.issues.revalidate();
			}
		}

		const validateOnChange = this.shouldValidateOnChange();
		const debounce = this.options.getValidationDebounceTime();
		if (validateOnChange && value !== '' && debounce) {
			this.debounceTimer.start(debounce, () => {
				this.commit(value);
			});
			return;
		}
		this.commit(value, !validateOnChange);
	}

	commit(value: unknown, revalidate = false) {
		this.validationCommitId += 1;
		const commitId = this.validationCommitId;
		let element = this.representative();

		if (revalidate) {
			if (this.valid !== false || !element) return;

			if (isConstraintElement(element) && !element.validity.valueMissing) {
				this.clearCustomValidity();
				const current = this.representative();
				const foreign =
					isConstraintElement(current) && current.validity.customError ? nativeErrors(current) : [];
				this.publishValidity(value, makeState(foreign.length > 0), foreign, false);
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
		const validationErrors = nativeErrors(element);
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
					this.publishValidity(value, nextState, validationErrors);
				} else if (this.validationMode === 'onSubmit' || !this.validityData.state.customError) {
					nextState = { ...nextState, valid: null };
					this.publishValidity(value, nextState, validationErrors);
				}

				void resultOrPromise.then(
					(result) => {
						if (commitId !== this.validationCommitId) return;
						this.finishAsync(commitId, value, result);
					},
					() => {
						// A rejected validator keeps the published state.
					}
				);
				return;
			}

			this.conclude(value, element, nextState, resultOrPromise);
			return;
		}

		this.publishValidity(value, nextState, validationErrors);
	}

	private publishValidity(
		value: unknown,
		validityState: FieldValidityData['state'],
		errorMessages: string[],
		externalInvalid?: boolean
	) {
		const errors = validityState.valid === false ? errorMessages : [];
		this.validityData = {
			value,
			state: validityState,
			error: errors[0] ?? '',
			errors,
			initialValue: this.validityData.initialValue
		};
		this.reportedInvalid = externalInvalid;
	}

	private conclude(
		value: unknown,
		element: HTMLElement | null,
		nextState: FieldValidityData['state'],
		result: FieldValidateResult
	) {
		let validationErrors = result ? ([] as string[]).concat(result).filter(Boolean) : [];
		if (validationErrors.length > 0) {
			nextState = { ...nextState, valid: false, customError: true };
			if (isConstraintElement(element) && element.willValidate) {
				this.installCustomValidity(element, validationErrors.join('\n'));
			}
		} else {
			validationErrors = nativeErrors(element);
		}
		this.publishValidity(value, nextState, validationErrors);
	}

	private finishAsync(commitId: number, value: unknown, result: FieldValidateResult) {
		if (commitId !== this.validationCommitId) return;
		const element = this.representative();
		const nextState =
			isConstraintElement(element) && element.willValidate
				? this.readNativeState(element)
				: makeState(false);
		this.conclude(value, element, nextState, result);
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

	/** The live control value. A getter wins over a snapshot. */
	private readRegisteredValue(registration = this.registration): unknown {
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
		const initialValue = this.readRegisteredValue(registration);
		const previous = untrack(() => this.validityData);
		if (previous.initialValue !== initialValue) {
			this.validityData = { ...previous, initialValue };
		}
	}

	/** What Form focuses: the control of a group's representative input, or the registered element. */
	get controlElement(): HTMLElement | null {
		if (this.registeredInputs.size === 0) return this.inputElement;
		const input = this.representative();
		if (!(input instanceof HTMLInputElement)) return null;
		return this.registeredInputs.get(input)?.element ?? input;
	}

	private combinedForForm() {
		const invalid = this.reportedInvalid ?? this.invalid;
		return getCombinedFieldValidityData(this.validityData, invalid);
	}

	/** Invalid in a way the source cannot re-check. Source issues are left to the source. */
	private blocksSubmit() {
		if (this.validityData.state.valid === false) return true;
		const external = this.options.getInvalidProp() === true || formErrorPresent(this.errorsEntry);
		return this.reportedInvalid ?? external;
	}

	private ensureRegistry() {
		const id = this.registeredId;
		if (!id) return;
		if (this.registryId === id && this.options.form.fields.has(id)) return;
		if (this.registryId && this.registryId !== id) this.options.form.fields.delete(this.registryId);
		this.registryId = id;
		const readName = () => this.name;
		const readValidity = () => this.combinedForForm();
		const readControl = () => this.controlElement;
		const readValue = () => {
			const formValue = this.registration?.getFormValue;
			return formValue ? formValue() : this.readRegisteredValue();
		};
		const validate = () => this.validateField();
		const blocksSubmit = () => this.blocksSubmit();
		this.options.form.fields.set(id, {
			get blocksSubmit() {
				return blocksSubmit();
			},
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
		this.debounceTimer.clear();
	}
}
