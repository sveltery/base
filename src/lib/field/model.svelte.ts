// Derived from Base UI v1.9.0 packages/react/src/field/root/FieldRoot.tsx,
// useFieldValidation.ts and useFieldControlRegistration.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { ScopedTimeout } from '@sveltery/utils';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { FormContextValue } from '../internal/form-context.js';
import {
	fieldPathKey,
	isWithinField,
	parseFieldPath,
	resolveFieldNode,
	type RemoteFieldNode,
	type RemoteFormIssue
} from '../form/remote-form.js';
import { onFormReset, ownerForm } from '../internal/form-reset.svelte.js';
import type { FieldValidityData, FormValidationMode } from '../form/types.js';
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
	/**
	 * The field's path in the form's data, such as `address.city`, from Field.Root's `name`.
	 * `undefined` without a name.
	 */
	readonly path: string | undefined;
	/** In a remote form: the issues at this field's path and below, minus paths a nested Field owns. */
	readonly issues: readonly RemoteFormIssue[];
	/** The issues the field shows: `issues`, minus the ones the user's last edit dismissed. */
	readonly shownIssues: readonly RemoteFormIssue[];
	/** Messages from outside the field: its remote issues, or its Form `errors` entry, until an edit clears them. */
	readonly externalErrors: readonly string[];
	readonly hasExternalErrors: boolean;
	/** Hides the external errors until new ones arrive. Controls call it when the user edits them. */
	clearExternalErrors: () => void;
	/**
	 * Props for a control that has no spread, from the remote form's `.as()` at this field's
	 * path. `undefined` outside a remote form or without a name.
	 */
	bindRemote: (type: string, option?: unknown) => Record<string, unknown> | undefined;
	/** In a remote form: the field's value as the form holds it, which the server render echoes back. */
	readonly remoteValue: unknown;
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
	/** The enclosing Field, which leaves the paths this field owns to it. */
	parent: FieldRootModel | undefined;
	getDisabledProp: () => boolean;
	getFieldsetDisabled: () => boolean;
	getName: () => string | undefined;
	getInvalidProp: () => boolean | undefined;
	getDirtyProp: () => boolean | undefined;
	getTouchedProp: () => boolean | undefined;
	getValidationModeProp: () => FormValidationMode | undefined;
	getValidationDebounceTime: () => number | undefined;
	getValidate: () => FieldValidate | undefined;
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
	/** The Field.Root element. Form asks it which `invalid` events belong to this field. */
	rootElement: HTMLElement | null = null;
	/** Paths of nested Fields. Their issues are theirs, not this field's. */
	readonly ownedPaths = new SvelteSet<string>();
	/**
	 * The issues the user's last edit dismissed, and how many remote submits had settled then.
	 * Kit hands out a new issues array on every read, so the dismissal compares the issues.
	 */
	private dismissedIssues = $state<{ key: string; settleCount: number } | null>(null);
	private ownedPath: string | undefined;

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

	constructor(options: FieldRootModelOptions) {
		this.options = options;
		this.path = $derived.by(() => {
			const name = options.getName();
			return name ? fieldPathKey(parseFieldPath(name)) : undefined;
		});
		this.issues = $derived.by(() => {
			const path = this.path;
			if (path === undefined || !options.form.remote) return [];
			const owned = [...this.ownedPaths];
			return options.form.remoteIssues.filter((issue) => {
				const key = fieldPathKey(issue.path);
				return (
					issue.path.length > 0 &&
					isWithinField(key, path) &&
					!owned.some((nested) => isWithinField(key, nested))
				);
			});
		});

		// Registered while rendering, so an outer Field.Error that comes after this Field
		// leaves these issues out in the server HTML too.
		untrack(() => this.claimPath(this.path));
		$effect.pre(() => {
			const path = this.path;
			untrack(() => this.claimPath(path));
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
				this.claimPath(undefined);
				const id = this.registryId;
				if (id) this.options.form.fields.delete(id);
			};
		});
	}

	readonly path: string | undefined;
	readonly issues: readonly RemoteFormIssue[];

	private claimPath(path: string | undefined) {
		const parent = this.options.parent;
		if (!parent || path === this.ownedPath) return;
		if (this.ownedPath !== undefined) parent.ownedPaths.delete(this.ownedPath);
		this.ownedPath = path;
		if (path !== undefined) parent.ownedPaths.add(path);
	}

	/**
	 * The remote issues still shown. An edit hides them until they change or a later submit
	 * settles, so neither a blocked submit nor a pending one shows the old issues again.
	 */
	get shownIssues(): readonly RemoteFormIssue[] {
		const dismissed = this.dismissedIssues;
		if (
			dismissed &&
			dismissed.settleCount === this.options.form.settleCount &&
			dismissed.key === issuesKey(this.issues)
		) {
			return [];
		}
		return this.issues;
	}

	get externalErrors(): readonly string[] {
		if (this.options.form.remote) return this.shownIssues.map((issue) => issue.message);
		const formError = this.formError;
		if (formError === null) return [];
		return ([] as string[]).concat(formError).filter(Boolean);
	}

	get hasExternalErrors() {
		return this.externalErrors.length > 0;
	}

	clearExternalErrors() {
		if (this.options.form.remote) {
			if (this.issues.length > 0) {
				this.dismissedIssues = {
					key: issuesKey(this.issues),
					settleCount: this.options.form.settleCount
				};
			}
			return;
		}
		this.options.form.clearErrors(this.name);
	}

	/** The node of the remote form's `fields` at this field's path. Never cached: Kit builds a new proxy per access. */
	private get remoteNode(): RemoteFieldNode | undefined {
		const name = this.options.getName();
		const fields = this.options.form.remote?.fields;
		if (!name || !fields) return undefined;
		return resolveFieldNode(fields, parseFieldPath(name));
	}

	bindRemote(type: string, option?: unknown) {
		// Kit's `.as()` needs the value of these types, and a control without a spread has none.
		if (option === undefined && (type === 'radio' || type === 'submit' || type === 'hidden')) {
			return undefined;
		}
		return this.remoteNode?.as?.(type, option);
	}

	get remoteValue(): unknown {
		return this.remoteNode?.value?.();
	}

	owns(element: Element) {
		if (element === this.inputElement) return true;
		if (element instanceof HTMLInputElement && this.registeredInputs.has(element)) return true;
		return Boolean(this.rootElement?.contains(element));
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
		return this.options.getInvalidProp() === true || this.hasExternalErrors;
	}

	/** The Form `errors` entry for this field's name. */
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
		this.syncCustomValidity(this.readRegisteredValue(registration));
	}

	/**
	 * Registers one native input of a group (checkbox, radio) against this field.
	 * Field.Control itself uses `inputElement`; groups use this map.
	 */
	registerInput(element: HTMLInputElement, registration: RegisteredInput) {
		this.registeredInputs.set(element, registration);
		this.scheduleSync();
		return () => {
			this.registeredInputs.delete(element);
		};
	}

	private syncScheduled = false;

	/** Puts the `validate` message on a group's inputs once they have registered. */
	private scheduleSync() {
		if (this.syncScheduled) return;
		this.syncScheduled = true;
		queueMicrotask(() => {
			this.syncScheduled = false;
			if (this.customValidity) return;
			this.syncCustomValidity(this.readRegisteredValue());
		});
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
		const value = this.readRegisteredValue();
		this.validityData = { ...EMPTY_VALIDITY(), initialValue: value };
		// The restored value still has to pass `validate` before the browser lets a submit through.
		this.syncCustomValidity(value);
	}

	change(value: unknown, cancelPending = false) {
		this.clearTimer();
		this.validationCommitId += 1;
		if (cancelPending) return;

		const validateOnChange = this.shouldValidateOnChange();
		const debounce =
			this.options.getValidationDebounceTime() ?? this.options.form.validationDebounceTime ?? 0;
		if (validateOnChange && value !== '' && debounce) {
			// The message stays hidden until the timer runs. Form syncs every field when the user
			// submits, so a submit before then still checks this value.
			this.clearCustomValidity();
			this.debounceTimer.start(debounce, () => {
				this.commit(value);
			});
			return;
		}
		this.commit(value, !validateOnChange);
		// A commit that validates sets the custom validity itself. A revalidation may clear it.
		if (!validateOnChange) this.syncCustomValidity(value);
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
			const validate = this.options.getValidate() ?? (() => null);
			const resultOrPromise = validate(value, this.formValues());

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

	/**
	 * Keeps a sync `validate` message in the control's custom validity whatever the
	 * `validationMode`, so the browser's constraint check blocks the submit. Nothing shows
	 * until the field publishes its validity. An `async` function never runs here, and the
	 * promise of any other validator that returns one is ignored.
	 */
	private syncCustomValidity(value: unknown) {
		const validate = this.options.getValidate();
		if (!validate || validate.constructor.name === 'AsyncFunction') return;
		const element = this.representative();
		if (!isConstraintElement(element)) return;
		this.clearCustomValidity();
		const result = validate(value, this.formValues());
		if (isPromise(result)) {
			void result.catch(() => {});
			return;
		}
		const messages = result ? ([] as string[]).concat(result).filter(Boolean) : [];
		if (messages.length > 0 && element.willValidate) {
			this.installCustomValidity(element, messages.join('\n'));
		}
	}

	private formValues() {
		const formValues: Record<string, unknown> = {};
		for (const field of this.options.form.fields.values()) {
			if (field.name) formValues[field.name] = field.getValue();
		}
		return formValues;
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
		const syncValidity = () => this.syncCustomValidity(this.readRegisteredValue());
		const owns = (element: Element) => this.owns(element);
		const readInvalid = () => this.invalid;
		this.options.form.fields.set(id, {
			owns,
			get invalid() {
				return readInvalid();
			},
			get name() {
				return readName();
			},
			validate,
			syncValidity,
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

function issuesKey(issues: readonly RemoteFormIssue[]) {
	return JSON.stringify(issues.map((issue) => [issue.path, issue.message]));
}
