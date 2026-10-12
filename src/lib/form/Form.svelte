<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.8.0 packages/react/src/form/Form.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the form with `bind:this`.
-->
<script lang="ts" generics="FormValues extends Record<string, unknown> = Record<string, unknown>">
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { createGenericEventDetails, REASONS } from '@sveltery/utils';
	import { setFormContext, type FormContextValue } from './context.js';
	import { comesBeforeInSameTree } from './document-order.js';
	import { onFormReset } from '../internal/form-reset.svelte.js';
	import type { FormErrors, FormField, FormProps, FormState } from './types.js';

	let {
		validationMode = 'onSubmit',
		errors = $bindable(),
		onsubmit,
		onFormSubmit,
		novalidate = true,
		render,
		children,
		...elementProps
	}: FormProps<FormValues> = $props();

	const fields = new Map<string, FormField>();
	let element = $state<HTMLFormElement | null>(null);
	let submitCount = 0;
	// Plain flag. The focus effect reads it when `errors` changes.
	let submitted = false;

	const formState: FormState = {};
	const emptyErrors: FormErrors = {};
	const attachmentKey = createAttachmentKey();
	const noValidateKey = createAttachmentKey();

	function rememberForm(node: HTMLFormElement) {
		element = node;
		const stopGate = on(node, 'submit', gateSubmit, { capture: true });
		// A reset starts the form over: no external errors and no submit yet.
		const stopReset = onFormReset(node, {
			settle: () => {
				submitCount = 0;
				submitted = false;
				if (errors && Object.keys(errors).length > 0) errors = {};
			}
		});
		return () => {
			stopGate();
			stopReset();
			if (element === node) element = null;
		};
	}

	// Applied once the form is live. A page without JavaScript keeps native validation.
	function applyNoValidate(node: HTMLFormElement) {
		node.noValidate = novalidate;
	}

	function focusFirstInvalid(formErrors: FormErrors = emptyErrors) {
		// A field can be invalid without a focusable control. Submission stays blocked.
		// Registration order can diverge from DOM order, so pick the first control by
		// document position. Disconnected trees keep registration order.
		let hasInvalid = false;
		let firstControl: HTMLElement | null = null;
		for (const field of fields.values()) {
			const fieldName = field.name;
			const namedError = fieldName != null && formErrors[fieldName] != null;
			if (field.validityData.state.valid !== false && !namedError) continue;
			hasInvalid = true;
			const control = field.control;
			if (control && (!firstControl || comesBeforeInSameTree(control, firstControl))) {
				firstControl = control;
			}
		}
		if (firstControl) {
			firstControl.focus();
			if (firstControl.tagName === 'INPUT') {
				(firstControl as HTMLInputElement).select();
			}
			return true;
		}
		return hasInvalid;
	}

	export function validate(fieldName?: string) {
		if (fieldName) {
			for (const field of fields.values()) {
				if (field.name === fieldName) {
					field.validate();
					return;
				}
			}
			return;
		}
		fields.forEach((field) => {
			field.validate();
		});
	}

	function clearErrors(name: string | undefined) {
		if (!name || !errors || !Object.hasOwn(errors, name)) return;
		const nextErrors = { ...errors };
		delete nextErrors[name];
		errors = nextErrors;
	}

	// Capture phase, so an invalid submit stops before any later `submit` listener on the form,
	// such as SvelteKit's `enhance`, which does not check `defaultPrevented`.
	function gateSubmit(event: SubmitEvent) {
		// `formnovalidate` on the submitter skips validation, as it does for a native form.
		if (event.submitter?.hasAttribute('formnovalidate')) return;
		submitCount += 1;

		// Async validation is not awaited, so it cannot stop this submit.
		fields.forEach((field) => {
			field.validate();
		});

		if (focusFirstInvalid()) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		submitted = true;
		onsubmit?.(event);

		if (onFormSubmit) {
			event.preventDefault();

			const formValues: Record<string, unknown> = {};
			fields.forEach((field) => {
				if (field.name) formValues[field.name] = field.getValue();
			});

			onFormSubmit(formValues as FormValues, createGenericEventDetails(REASONS.none, event));
		}
	}

	const context: FormContextValue = {
		fields,
		get element() {
			return element;
		},
		get submitCount() {
			return submitCount;
		},
		get validationMode() {
			return validationMode;
		},
		get errors() {
			return errors ?? emptyErrors;
		},
		clearErrors
	};
	setFormContext(context);

	// After a submit that was not already blocked, focus the first invalid control
	// once external errors change (server errors arriving after the post).
	$effect(() => {
		const current = errors ?? emptyErrors;
		if (!submitted) return;
		submitted = false;
		focusFirstInvalid(current);
	});

	const hostProps: HTMLFormAttributes = $derived({
		...elementProps,
		onsubmit: handleSubmit,
		[attachmentKey]: rememberForm,
		[noValidateKey]: applyNoValidate
	});
</script>

{#if render}
	{@render render(hostProps, formState, children)}
{:else}
	<form {...hostProps}>{@render children?.()}</form>
{/if}
