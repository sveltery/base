<!--
	A native form element with consolidated error handling. Renders a `<form>` element.
	Derived from Base UI v1.9.0 packages/react/src/form/Form.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the form with `bind:this`.
-->
<script lang="ts" generics="FormValues extends Record<string, unknown> = Record<string, unknown>">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { createGenericEventDetails, REASONS } from '@sveltery/utils';
	import { setFormContext, type FormContextValue } from '../internal/form-context.js';
	import { comesBeforeInSameTree } from './document-order.js';
	import { onFormReset } from '../internal/form-reset.svelte.js';
	import type { FormErrors, FormProps, FormState } from './types.js';

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

	const fields: FormContextValue['fields'] = new Map();
	let element = $state<HTMLFormElement | null>(null);
	let submitCount = 0;
	// A plain flag. The focus effect reads it when errors change.
	let submitted = false;

	const formState: FormState = {};
	const emptyErrors: FormErrors = {};
	const attachmentKey = createAttachmentKey();

	function rememberForm(node: HTMLFormElement) {
		element = node;
		// A reset starts the form over: no external errors and no submit yet.
		const stopReset = onFormReset(node, {
			settle: () => {
				submitCount = 0;
				submitted = false;
				if (errors && Object.keys(errors).length > 0) errors = {};
			}
		});
		return () => {
			stopReset();
			if (element === node) element = null;
		};
	}

	/**
	 * Focuses the first invalid control by document position.
	 * Returns whether any field is invalid, focusable or not.
	 */
	function focusFirstInvalid() {
		// Registration order can diverge from DOM order. Disconnected trees keep registration order.
		let hasInvalid = false;
		let firstControl: HTMLElement | null = null;
		for (const field of fields.values()) {
			if (field.validityData.state.valid !== false) continue;
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

	function handleSubmit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		submitCount += 1;

		// Async validation is not awaited, so it cannot stop this submit.
		fields.forEach((field) => {
			field.validate();
		});

		if (focusFirstInvalid()) {
			event.preventDefault();
			return;
		}

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

	// After a submit that was not blocked, focus the first invalid control
	// once external errors change (server errors arriving after the post).
	$effect(() => {
		void errors;
		if (!submitted) return;
		submitted = false;
		focusFirstInvalid();
	});

	const hostProps: HTMLFormAttributes = $derived({
		novalidate,
		...elementProps,
		onsubmit: handleSubmit,
		[attachmentKey]: rememberForm
	});
</script>

{#if render}
	{@render render(hostProps, formState, children)}
{:else}
	<form {...hostProps}>{@render children?.()}</form>
{/if}
